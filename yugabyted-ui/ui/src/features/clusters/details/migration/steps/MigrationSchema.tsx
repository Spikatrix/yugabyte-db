import React, { FC, Fragment } from "react";
import {
  Box,
  LinearProgress,
  makeStyles,
  TableCell,
  TableRow,
  Typography,
  useTheme,
} from "@material-ui/core";
import type { Migration } from "../MigrationOverview";
import {
  STATUS_TYPES,
  YBAccordion,
  YBButton,
  YBCodeBlock,
  YBStatus,
  YBTable,
} from "@app/components";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import RefreshIcon from "@app/assets/refresh.svg";
import { MigrationStepNA } from "../MigrationStepNA";
import MigrationAccordionTitle from "../MigrationAccordionTitle";
import { BadgeVariant, YBBadge } from "@app/components/YBBadge/YBBadge";
import ArrowRightIcon from "@app/assets/caret-right-circle.svg";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(4),
  },
  tooltip: {
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
  },
  queryTableRow: {
    display: "flex",
    flexWrap: "wrap",
  },
  rowTableCell: {
    borderBottom: "unset",
  },
  actionsCell: {
    width: theme.spacing(8),
  },
  queryTableCell: {
    padding: theme.spacing(1, 0),
  },
  queryCodeBlock: {
    lineHeight: 1.5,
    paddingRight: theme.spacing(0),
  },
  arrowComponent: {
    textAlign: "end",
    "& svg": {
      marginTop: theme.spacing(0.25),
    },
  },
  tableRow: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.background.default,
    },
  },
  tableCell: {
    padding: theme.spacing(1, 2),
    maxWidth: 120,
    wordBreak: "break-word",
  },
}));

const ArrowComponent = (classes: ReturnType<typeof useStyles>) => () => {
  return (
    <Box className={classes.arrowComponent}>
      <ArrowRightIcon />
    </Box>
  );
};

const getRowCellComponent = (
  displayedRows: any[],
  classes: ReturnType<typeof useStyles>,
  expanded: boolean[],
  setExpanded?: (index: number) => void
) => {
  const rowCellComponent = (data: any, dataIndex: number) => {
    return (
      <Fragment key={`row-fragment-${data}`}>
        <TableRow
          className={classes.tableRow}
          onClick={() => setExpanded && setExpanded(dataIndex)}
        >
          {data.map((val: any, index: number) => (
            <TableCell
              key={`row-${dataIndex}-body-cell-${index}`}
              className={clsx(classes.tableCell, expanded && classes.rowTableCell)}
            >
              {/* Index === 1 is for transforming filepath to filename */}
              {index === 1 ? val.slice(val.lastIndexOf("/") + 1) : val}
            </TableCell>
          ))}
        </TableRow>
        {expanded[dataIndex] && (
          <TableRow>
            <TableCell colSpan={7} className={classes.queryTableCell}>
              <YBCodeBlock
                text={
                  `// File: ${data[1]} \n\n${displayedRows[dataIndex].sqlStatement}` ||
                  "No query data"
                }
                preClassName={classes.queryCodeBlock}
              />
            </TableCell>
          </TableRow>
        )}
      </Fragment>
    );
  };
  return rowCellComponent;
};

interface MigrationSchemaProps {
  heading: string;
  migration: Migration;
  step: number;
  onRefetch: () => void;
}

export const MigrationSchema: FC<MigrationSchemaProps> = ({ heading, onRefetch }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();

  const isFetchingData = false;

  /* const schemaAPI = {
    migration_uuid: "07058f53-487e-11ee-bd6c-42010a97001d",
    overall_status: "in-progress",
    export_schema: "in-progress",
    analyze_schema: "N/A",
    import_schema: "N/A",
    suggestions_errors: null,
    sql_objects: null,
  }; */

  const schemaAPI = {
    migration_uuid: "a728a3d7-486c-11ee-8b83-42010a97001d",
    overall_status: "in-progress",
    export_schema: "complete",
    analyze_schema: "complete",
    import_schema: "N/A",
    suggestions_errors: [
      {
        objectType: "TABLE",
        objectName: "",
        reason: "INHERITS not supported yet.",
        sqlStatement:
          "CREATE TABLE public.payment_p2007_01 (\n    CONSTRAINT payment_p2007_01_payment_date_check CHECK (((payment_date \u003e= '2007-01-01 00:00:00'::timestamp without time zone) AND (payment_date \u003c '2007-02-01 00:00:00'::timestamp without time zone)))\n)\nINHERITS (public.payment);",
        filePath:
          "/home/centos/dev-server-ssinghal/home/centos/export-dirs/postgres-sakila-migration/schema/tables/table.sql",
        suggestion: "",
        GH: "https://github.com/YugaByte/yugabyte-db/issues/1129",
      },
      {
        objectType: "TABLE",
        objectName: "",
        reason: "DIVIDE not supported yet.",
        sqlStatement: "CREATE TABLE public.payment_p2007_01",
        filePath:
          "/home/centos/dev-server-ssinghal/home/centos/export-dirs/postgres-sakila-migration/schema/tables/table2.sql",
        suggestion: "",
        GH: "https://github.com/YugaByte/yugabyte-db/issues/1229",
      },
    ],
    sql_objects: [
      {
        objectType: "TABLE",
        totalCount: 6,
        invalidCount: 0,
        objectNames: "test1, test2, test3, test4, test5, test6",
        objectDetails: "",
      },
    ],
  };

  /* const schemaAPI = {
    migration_uuid: "07058f53-487e-11ee-bd6c-42010a97001d",
    overall_status: "in-progress",
    export_schema: "complete",
    analyze_schema: "complete",
    import_schema: "in-progress",
    suggestions_errors: null,
    sql_objects: [
      {
        objectType: "TABLE",
        totalCount: 6,
        invalidCount: 0,
        objectNames: "test5, test6, test1, test2, test3, test4",
        objectDetails: "",
      },
    ],
  }; */

  /* const schemaAPI = {
    migration_uuid: "07058f53-487e-11ee-bd6c-42010a97001d",
    overall_status: "complete",
    export_schema: "complete",
    analyze_schema: "complete",
    import_schema: "complete",
    suggestions_errors: null,
    sql_objects: [
      {
        objectType: "TABLE",
        totalCount: 6,
        invalidCount: 0,
        objectNames: "test5, test6, test1, test2, test3, test4",
        objectDetails: "",
      },
    ],
  }; */

  const schemaStates = Object.entries(schemaAPI)
    .filter(([key]) => key.endsWith("schema"))
    .map(([key, value]) => ({
      phase: key
        .split("_")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" "),
      state: (value as string)
        .split("-")
        .map((s, index) => (index === 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s))
        .join(" "),
    }));

  const schemaStateColumns = [
    {
      name: "phase",
      label: t("clusterDetail.voyager.migrateSchema.phase"),
      options: {
        setCellHeaderProps: () => ({ style: { padding: "8px 16px" } }),
        setCellProps: () => ({ style: { padding: "8px 16px" } }),
      },
    },
    {
      name: "state",
      label: t("clusterDetail.voyager.migrateSchema.status"),
      options: {
        customBodyRender: (status: string) =>
          status !== "N/A" ? (
            <YBBadge
              variant={status === "Complete" ? BadgeVariant.Success : BadgeVariant.InProgress}
              text={status}
            />
          ) : (
            status
          ),
        setCellHeaderProps: () => ({ style: { padding: "8px 16px" } }),
        setCellProps: () => ({ style: { padding: "8px 16px", height: "44px" } }),
      },
    },
  ];

  const suggestionErrorColumns = [
    {
      name: "objectType",
      label: t("clusterDetail.voyager.migrateSchema.sqlObjectType"),
      options: {
        setCellHeaderProps: () => ({ style: { padding: "8px 16px" } }),
      },
    },
    {
      name: "filePath",
      label: t("clusterDetail.voyager.migrateSchema.filename"),
      options: {
        renderCustomBody: () => "ho",
        setCellHeaderProps: () => ({ style: { padding: "8px 16px" } }),
      },
    },
    {
      name: "reason",
      label: t("clusterDetail.voyager.migrateSchema.reason"),
      options: {
        setCellHeaderProps: () => ({ style: { padding: "8px 16px" } }),
      },
    },
    {
      name: "GH",
      label: t("clusterDetail.voyager.migrateSchema.ghIssue"),
      options: {
        setCellHeaderProps: () => ({ style: { padding: "8px 16px" } }),
      },
    },
    {
      name: "",
      label: "",
      options: {
        sort: false,
        customBodyRender: ArrowComponent(classes),
      },
    },
  ];

  const [expandedSuggestions, setExpandedSuggestions] = React.useState<boolean[]>([]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Typography variant="h4" className={classes.heading}>
          {heading}
        </Typography>
        <YBButton variant="ghost" startIcon={<RefreshIcon />} onClick={onRefetch}>
          {t("clusterDetail.performance.actions.refresh")}
        </YBButton>
      </Box>

      {isFetchingData && (
        <Box textAlign="center" pt={2} pb={2} width="100%">
          <LinearProgress />
        </Box>
      )}

      {!isFetchingData && (
        <>
          {schemaAPI.overall_status === "complete" && (
            <Box display="flex" gridGap={4} alignItems="center" mb={4}>
              <YBStatus type={STATUS_TYPES.SUCCESS} size={42} />
              <Box display="flex" flexDirection="column">
                <Typography variant="h5">
                  {t("clusterDetail.voyager.migrateSchema.migratedSchema")}
                </Typography>
                <Typography variant="body2">
                  {t("clusterDetail.voyager.migrateSchema.migratedSchemaDesc")}
                </Typography>
              </Box>
            </Box>
          )}

          {schemaAPI.overall_status !== "complete" && (
            <Box>
              <YBTable
                data={schemaStates}
                columns={schemaStateColumns}
                options={{
                  pagination: false,
                }}
                withBorder={false}
              />
            </Box>
          )}

          <Box display="flex" flexDirection="column" gridGap={theme.spacing(2)} mt={5}>
            <YBAccordion
              titleContent={t("clusterDetail.voyager.migrateSchema.sqlObjects")}
              defaultExpanded
            >
              {schemaAPI.analyze_schema !== "complete" || schemaAPI.sql_objects == null ? (
                <MigrationStepNA />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={schemaAPI.sql_objects}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                    barCategoryGap={30}
                    maxBarSize={40}
                  >
                    <defs>
                      <linearGradient id="total-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="20%" stopColor={"#8047F5"} stopOpacity={"0.5"} />
                        <stop offset="80%" stopColor={"#2B59C3"} stopOpacity={"0.5"} />
                      </linearGradient>
                      <linearGradient id="invalid-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="20%" stopColor={"#ff0000"} stopOpacity={"0.5"} />
                        <stop offset="80%" stopColor={"#c744eb"} stopOpacity={"0.5"} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="objectType" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="totalCount" fill="url(#total-gradient)">
                      <LabelList dataKey="totalCount" position="top" style={{ fill: "black" }} />
                    </Bar>
                    <Bar dataKey="invalidCount" fill="url(#invalid-gradient)">
                      <LabelList dataKey="invalidCount" position="top" style={{ fill: "black" }} />
                    </Bar>
                    <Legend
                      formatter={(value) =>
                        (value as string)
                          .split(/(?=[A-Z][^A-Z])/)
                          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                          .join(" ")
                      }
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </YBAccordion>

            <YBAccordion
              titleContent={
                <MigrationAccordionTitle
                  title={t("clusterDetail.voyager.migrateSchema.suggestionsErrors")}
                  count={schemaAPI.suggestions_errors?.length || 0}
                  color={theme.palette.warning[100]}
                />
              }
              defaultExpanded
            >
              {!schemaAPI.suggestions_errors?.length ? (
                <MigrationStepNA />
              ) : (
                <Box flex={1} px={2} minWidth={0}>
                  <YBTable
                    data={schemaAPI.suggestions_errors}
                    columns={suggestionErrorColumns}
                    options={{
                      customRowRender: getRowCellComponent(
                        schemaAPI.suggestions_errors,
                        classes,
                        expandedSuggestions,
                        (index) => {
                          setExpandedSuggestions((prev) => {
                            const newExpanded = [...prev];
                            newExpanded[index] = !newExpanded[index];
                            return newExpanded;
                          });
                        }
                      ),
                      pagination: true,
                      rowHover: true,
                    }}
                    withBorder={false}
                  />
                </Box>
              )}
            </YBAccordion>
          </Box>
        </>
      )}
    </Box>
  );
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  const classes = useStyles();

  if (active && payload && payload.length) {
    return (
      <Box className={classes.tooltip}>
        <Box mb={0.5}>
          <Typography>{label}</Typography>
        </Box>
        <Box>{payload[0].value} total</Box>
        <Box>{payload[1].value} invalid</Box>
      </Box>
    );
  }

  return null;
};