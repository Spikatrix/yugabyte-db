import React, { FC } from "react";
import { Box, makeStyles, Paper, Typography, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import type { Migration } from "./MigrationOverview";
import { ErrorOutline, Warning } from "@material-ui/icons";
import { Bar, BarChart, LabelList, Tooltip, TooltipProps, XAxis, YAxis } from "recharts";
import Editor from "@monaco-editor/react";
import { YBAccordion } from "@app/components";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(5),
  },
  tooltip: {
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
  }
}));

interface MigrationAnalyzeProps {
  heading: string;
  migration: Migration;
}

export const MigrationAnalyze: FC<MigrationAnalyzeProps> = ({ heading, migration }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();

  const [value] = React.useState<string>(
    "CREATE VIEW Failing_Students AS\nSELECT S_NAME, Student_ID\nFROM STUDENT\nWHERE GPA > 40;"
  );

  const graphData = React.useMemo(
    () => [
      {
        xAxis: "Table",
        count: 128,
      },
      {
        xAxis: "Index",
        count: 77,
      },
      {
        xAxis: "Function",
        count: 32,
      },
    ],
    []
  );

  return (
    <Paper>
      <Box p={4}>
        <Typography variant="h4" className={classes.heading}>
          {heading}
        </Typography>
        <Box display="flex" flexDirection="column" gridGap={theme.spacing(2)}>
          <YBAccordion titleContent={t("clusterDetail.voyager.sqlEditor")} defaultExpanded>
            <Editor
              height="300px"
              defaultLanguage="sql"
              defaultValue={value}
              options={{
                readOnly: true,
                scrollBeyondLastLine: false,
                minimap: {
                  enabled: false,
                },
              }}
            />
          </YBAccordion>

          <YBAccordion titleContent={t("clusterDetail.voyager.sqlObjects")}>
            <BarChart
              width={400}
              height={300}
              data={graphData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barCategoryGap={30}
            >
              <defs>
                <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="20%" stopColor={"#8047F5"} stopOpacity={"0.5"} />
                  <stop offset="80%" stopColor={"#2B59C3"} stopOpacity={"0.5"} />
                </linearGradient>
              </defs>
              <XAxis dataKey="xAxis" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="url(#bar-gradient)">
                <LabelList dataKey="count" position="top" style={{ fill: "black" }} />
              </Bar>
            </BarChart>
          </YBAccordion>

          <YBAccordion
            titleContent={
              <Box display="flex" alignItems="center" gridGap={theme.spacing(1)} flexGrow={1}>
                {t("clusterDetail.voyager.suggestionsErrors")}
                <Box
                  borderRadius={theme.shape.borderRadius}
                  bgcolor={theme.palette.warning[100]}
                  fontSize="12px"
                  fontWeight={400}
                  px="5px"
                  py="2px"
                >
                  2
                </Box>
              </Box>
            }
          >
            <Box display="flex" gridGap={theme.spacing(1)} flexDirection="column">
              <Box display="flex" alignItems="center" gridGap={theme.spacing(1)}>
                <ErrorOutline color="error" />
                <Typography variant="body2">Invalid character at line 22, character 63</Typography>
              </Box>
              <Box display="flex" alignItems="center" gridGap={theme.spacing(1)}>
                <Warning />
                <Typography variant="body2">XYZ is deprecated, use ABC instead</Typography>
              </Box>
            </Box>
          </YBAccordion>
        </Box>
      </Box>
    </Paper>
  );
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  const classes = useStyles();

  if (active && payload && payload.length) {
    return (
      <Box className={classes.tooltip}>
        {`${label}: ${payload[0].value}`}
      </Box>
    );
  }

  return null;
};