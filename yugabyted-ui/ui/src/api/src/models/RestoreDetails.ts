// tslint:disable
/**
 * Yugabyte Cloud
 * YugabyteDB as a Service
 *
 * The version of the OpenAPI document: v1
 * Contact: support@yugabyte.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */




/**
 * Details of databases in YugabyteDB cluster on which restore operation in run
 * @export
 * @interface RestoreDetails
 */
export interface RestoreDetails  {
  /**
   * 
   * @type {string}
   * @memberof RestoreDetails
   */
  ybc_task_id: string;
  /**
   * 
   * @type {string}
   * @memberof RestoreDetails
   */
  tserver_ip: string;
  /**
   * 
   * @type {string}
   * @memberof RestoreDetails
   */
  user_operation: string;
  /**
   * 
   * @type {string}
   * @memberof RestoreDetails
   */
  ybdb_api: string;
  /**
   * 
   * @type {string}
   * @memberof RestoreDetails
   */
  database_keyspace: string;
  /**
   * 
   * @type {string}
   * @memberof RestoreDetails
   */
  task_start_time: string;
  /**
   * 
   * @type {string}
   * @memberof RestoreDetails
   */
  task_status: string;
  /**
   * 
   * @type {string}
   * @memberof RestoreDetails
   */
  time_taken: string;
  /**
   * 
   * @type {string}
   * @memberof RestoreDetails
   */
  bytes_transferred: string;
  /**
   * 
   * @type {string}
   * @memberof RestoreDetails
   */
  actual_size: string;
}


