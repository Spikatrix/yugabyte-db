// Copyright (c) YugaByte, Inc.

package server

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"math/rand"
	"node-agent/app/executor"
	"node-agent/app/scheduler"
	"node-agent/app/task"
	pb "node-agent/generated/service"
	"os"
	"testing"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var (
	server     *RPCServer
	clientCtx  context.Context
	dialOpts   []grpc.DialOption
	serverAddr = "localhost:0"
)

func init() {
	rand.Seed(time.Now().Unix())
}

func randomString(length int) string {
	bytes := make([]byte, length)
	for i := 0; i < length; i++ {
		bytes[i] = byte('a' + rand.Intn(26))
	}
	return string(bytes)
}

// TestMain is invoked before the tests.
func TestMain(m *testing.M) {
	var err error
	ctx := Context()
	cancelFunc = CancelFunc()
	executor.Init(ctx)
	scheduler.Init(ctx)
	task.InitTaskManager(ctx)
	dialOpts = append(dialOpts, grpc.WithTransportCredentials(insecure.NewCredentials()))
	server, err = NewRPCServer(ctx, serverAddr, false)
	if err != nil {
		panic(err)
	}
	// Update with the actual address.
	serverAddr = server.Addr()
	log.Printf("Listening to server address %s", serverAddr)
	code := m.Run()
	server.Stop()
	cancelFunc()
	executor.GetInstance().WaitOnShutdown()
	os.Exit(code)
}

// Server test starts here.
func TestPing(t *testing.T) {
	conn, err := grpc.Dial(serverAddr, dialOpts...)
	if err != nil {
		t.Fatalf("Failed to dial: %v", err)
	}
	defer conn.Close()
	client := pb.NewNodeAgentClient(conn)
	req := pb.PingRequest{}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	res, err := client.Ping(ctx, &req)
	if err != nil {
		t.Fatal(err)
	}
	if res.ServerInfo == nil {
		t.Fatalf("ServerInfo must be set")
	}
}

func TestExecuteInvalidCommand(t *testing.T) {
	conn, err := grpc.Dial(serverAddr, dialOpts...)
	if err != nil {
		t.Fatalf("Failed to dial: %v", err)
	}
	defer conn.Close()
	client := pb.NewNodeAgentClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	echoWord := "Hello Test"
	req := pb.ExecuteCommandRequest{Command: []string{"echo -n", echoWord}}
	stream, err := client.ExecuteCommand(ctx, &req)
	if err != nil {
		t.Fatal(err)
	}
	isError := false
	for {
		res, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			t.Fatal(err)
		}
		if res.GetError() != nil {
			isError = true
		}
	}
	if !isError {
		t.Fatalf("Error expected")
	}
}

func TestExecuteCommand(t *testing.T) {
	conn, err := grpc.Dial(serverAddr, dialOpts...)
	if err != nil {
		t.Fatalf("Failed to dial: %v", err)
	}
	defer conn.Close()
	client := pb.NewNodeAgentClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	echoWord := "Hello Test"
	req := pb.ExecuteCommandRequest{Command: []string{"echo", "-n", echoWord}}
	stream, err := client.ExecuteCommand(ctx, &req)
	if err != nil {
		t.Fatal(err)
	}
	buffer := bytes.Buffer{}
	for {
		res, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			t.Fatal(err)
		}
		if res.GetError() != nil {
			buffer.WriteString(res.GetError().Message)
		} else {
			buffer.WriteString(res.GetOutput())
		}
	}
	out := buffer.String()
	t.Logf("Output: %s\n", out)
	if out != echoWord {
		t.Fatalf("Expected '%s', found '%s'", echoWord, out)
	}
}

func TestSubmitTask(t *testing.T) {
	conn, err := grpc.Dial(serverAddr, dialOpts...)
	if err != nil {
		t.Fatalf("Failed to dial: %v", err)
	}
	defer conn.Close()
	client := pb.NewNodeAgentClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	echoWord := "Hello Test"
	taskID := "task1"
	cmd := fmt.Sprintf("sleep 5 & echo -n \"%s\"", echoWord)
	req := pb.SubmitTaskRequest{TaskId: taskID, Command: []string{"bash", "-c", cmd}}
	_, err = client.SubmitTask(ctx, &req)
	if err != nil {
		t.Fatalf("Failed to submit task - %s", err.Error())
	}
	buffer := bytes.Buffer{}
	rc := 0
	retryCount := 0
	for {
		ctx, cancel = context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		stream, err := client.DescribeTask(
			ctx,
			&pb.DescribeTaskRequest{TaskId: taskID},
		)
		res, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			retryCount++
			t.Logf("Retrying because the error is not EOF - %s", err.Error())
			continue
		}
		if res.GetError() != nil {
			rc = int(res.GetError().Code)
			buffer.WriteString(res.GetError().Message)
		} else {
			buffer.WriteString(res.GetOutput())
		}
	}
	out := buffer.String()
	t.Logf("Output: %s\n", out)
	if out != echoWord {
		t.Fatalf("Expected '%s', found '%s'", echoWord, out)
	}
	if rc != 0 {
		t.Fatalf("Expected exit code of 0, found %d", rc)
	}
	if retryCount == 0 {
		t.Fatal("Expected retry")
	}
}

func TestUploadFile(t *testing.T) {
	conn, err := grpc.Dial(serverAddr, dialOpts...)
	if err != nil {
		t.Fatalf("Failed to dial: %v", err)
	}
	defer conn.Close()
	client := pb.NewNodeAgentClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	file, err := ioutil.TempFile("/tmp", "node-agent")
	if err != nil {
		t.Fatal(err)
	}
	content := randomString(50)
	file.WriteString(content)
	file.Sync()
	file.Seek(0, 0)
	defer file.Close()
	defer os.Remove(file.Name())
	stream, err := client.UploadFile(ctx)
	if err != nil {
		t.Fatalf("Failed to upload file - %s", err.Error())
	}
	filename := fmt.Sprintf("/tmp/upload-node-agent-%s", randomString(5))
	req := &pb.UploadFileRequest{
		Data: &pb.UploadFileRequest_FileInfo{
			FileInfo: &pb.FileInfo{
				Filename: filename,
			},
		},
	}
	err = stream.Send(req)
	if err != nil {
		t.Fatalf("Failed to send file info to server - %v", stream.RecvMsg(nil))
	}
	reader := bufio.NewReader(file)
	buffer := make([]byte, 1024)
	for {
		n, err := reader.Read(buffer)
		if err == io.EOF {
			break
		}
		if err != nil {
			t.Fatalf("Failed to read chunk into buffer - %s", err.Error())
		}
		req = &pb.UploadFileRequest{
			Data: &pb.UploadFileRequest_ChunkData{
				ChunkData: buffer[:n],
			},
		}
		err = stream.Send(req)
		if err != nil {
			t.Fatalf("Failed to send chunk to server - %v", stream.RecvMsg(nil))
		}
	}
	_, err = stream.CloseAndRecv()
	if err != nil {
		t.Fatalf("Failed to receive response - %s", err.Error())
	}
	defer os.Remove(filename)
	data, err := os.ReadFile(filename)
	if err != nil {
		log.Fatal(err)
	}
	out := string(data)
	if content != out {
		t.Fatalf("Expected %s, found %s", content, out)
	}
}

func TestDownloadFile(t *testing.T) {
	conn, err := grpc.Dial(serverAddr, dialOpts...)
	if err != nil {
		log.Fatalf("Failed to dial: %v", err)
	}
	defer conn.Close()
	client := pb.NewNodeAgentClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	file, err := ioutil.TempFile("/tmp", "node-agent")
	if err != nil {
		t.Fatal(err)
	}
	content := randomString(50)
	file.WriteString(content)
	file.Close()
	defer os.Remove(file.Name())
	req := pb.DownloadFileRequest{Filename: file.Name()}
	stream, err := client.DownloadFile(ctx, &req)
	if err != nil {
		t.Fatalf("Failed to download file")
	}
	buffer := bytes.Buffer{}
	for {
		res, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			t.Fatalf("Failed to receive data - %s", err.Error())
		}
		buffer.Write(res.ChunkData)
	}
	out := buffer.String()
	if out != content {
		t.Fatalf("Expected %s, found %s", content, out)
	}
}
