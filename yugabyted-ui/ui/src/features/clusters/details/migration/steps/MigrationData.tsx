import React, { FC } from "react";
import { Box, LinearProgress, makeStyles, Theme, Typography, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import type { Migration } from "../MigrationOverview";
import {
  STATUS_TYPES,
  YBAccordion,
  YBButton,
  YBProgress,
  YBStatus,
  YBTable,
} from "@app/components";
import { MigrationPhase } from "../migration";
import RefreshIcon from "@app/assets/refresh.svg";

const useStyles = makeStyles((theme) => ({
  label: {
    color: theme.palette.grey[600],
    fontWeight: theme.typography.fontWeightMedium as number,
    marginBottom: theme.spacing(0.75),
    textTransform: "uppercase",
    textAlign: "start",
  },
  value: {
    paddingTop: theme.spacing(0.36),
    textAlign: "start",
  },
  dividerHorizontal: {
    width: "100%",
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },
  heading: {
    marginBottom: theme.spacing(4),
  },
}));

const CompletionComponent = (theme: Theme) => (completionPercentage: number) => {
  const statusType =
    completionPercentage === 100
      ? STATUS_TYPES.SUCCESS
      : completionPercentage === 0
      ? STATUS_TYPES.PENDING
      : STATUS_TYPES.IN_PROGRESS;

  return (
    <Box display="flex" alignItems="center" maxWidth={400}>
      <Box mr={0.5}>
        <YBStatus type={statusType} />
      </Box>
      {completionPercentage === 100 && <Box>Complete</Box>}
      {completionPercentage === 0 && <Box>Not started</Box>}
      {completionPercentage !== 100 && completionPercentage !== 0 && (
        <>
          <Box mr={1}>{completionPercentage}%</Box>
          <YBProgress value={completionPercentage} color={theme.palette.primary[500]} />
        </>
      )}
    </Box>
  );
};

interface MigrationProps {
  heading: string;
  migration: Migration;
  step: number;
  onRefetch: () => void;
}

export const MigrationData: FC<MigrationProps> = ({ heading, onRefetch }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();

  const isFetchingData = false;

  const dataAPI = {
    metrics: [
      {
        migration_uuid: "34fdb71d-4514-11ee-9019-42010a97001d",
        table_name: "YUGABYTED",
        schema_name: "YUGABYTED.TEST1",
        migration_phase: 2,
        status: 3,
        count_live_rows: 42700,
        count_total_rows: 42700,
        invocation_timestamp: "2023-08-27 22:37:13",
      },
      {
        migration_uuid: "34fdb71d-4514-11ee-9019-42010a97001d",
        table_name: "YUGABYTED",
        schema_name: "YUGABYTED.TEST2",
        migration_phase: 2,
        status: 3,
        count_live_rows: 42700,
        count_total_rows: 52700,
        invocation_timestamp: "2023-08-27 22:37:24",
      },
      {
        migration_uuid: "34fdb71d-4514-11ee-9019-42010a97001d",
        table_name: "YUGABYTED",
        schema_name: "YUGABYTED.TEST3",
        migration_phase: 2,
        status: 3,
        count_live_rows: 62700,
        count_total_rows: 62700,
        invocation_timestamp: "2023-08-27 22:37:50",
      },
      {
        migration_uuid: "34fdb71d-4514-11ee-9019-42010a97001d",
        table_name: "YUGABYTED",
        schema_name: "YUGABYTED.TEST4",
        migration_phase: 2,
        status: 3,
        count_live_rows: 82700,
        count_total_rows: 82700,
        invocation_timestamp: "2023-08-27 22:37:46",
      },
      {
        migration_uuid: "34fdb71d-4514-11ee-9019-42010a97001d",
        table_name: "YUGABYTED",
        schema_name: "YUGABYTED.TEST5",
        migration_phase: 2,
        status: 3,
        count_live_rows: 82700,
        count_total_rows: 82700,
        invocation_timestamp: "2023-08-27 22:38:14",
      },
      {
        migration_uuid: "34fdb71d-4514-11ee-9019-42010a97001d",
        table_name: "YUGABYTED",
        schema_name: "YUGABYTED.TEST6",
        migration_phase: 2,
        status: 3,
        count_live_rows: 157000,
        count_total_rows: 157000,
        invocation_timestamp: "2023-08-27 22:39:01",
      },
    ],
  };

  const phase = dataAPI.metrics[0]?.migration_phase ?? 0;

  const migrationProgressData = React.useMemo(
    () =>
      dataAPI.metrics.map((data) => ({
        table_name: data.table_name,
        exportPercentage:
          data.migration_phase === MigrationPhase["Export Data"]
            ? Math.floor((data.count_live_rows / data.count_total_rows) * 100)
            : data.migration_phase > MigrationPhase["Export Data"]
            ? 100
            : 0,
        importPercentage:
          data.migration_phase === MigrationPhase["Import Data"]
            ? Math.floor((data.count_live_rows / data.count_total_rows) * 100)
            : data.migration_phase > MigrationPhase["Import Data"]
            ? 100
            : 0,
      })),
    [dataAPI]
  );

  const totalExportProgress = Math.floor(
    migrationProgressData.reduce((acc, { exportPercentage }) => acc + exportPercentage, 0) /
      migrationProgressData.length
  );
  const totalImportProgress = Math.floor(
    migrationProgressData.reduce((acc, { importPercentage }) => acc + importPercentage, 0) /
      migrationProgressData.length
  );

  const migrationImportColumns = [
    {
      name: "table_name",
      label: t("clusterDetail.voyager.tableName"),
      options: {
        setCellHeaderProps: () => ({ style: { padding: "8px 16px" } }),
        setCellProps: () => ({ style: { padding: "8px 16px" } }),
      },
    },
    {
      name: "importPercentage",
      label: t("clusterDetail.voyager.status"),
      options: {
        customBodyRender: CompletionComponent(theme),
        setCellHeaderProps: () => ({ style: { padding: "8px 16px" } }),
        setCellProps: () => ({ style: { padding: "8px 16px" } }),
      },
    },
  ];

  const migrationExportColumns = [
    {
      name: "table_name",
      label: t("clusterDetail.voyager.tableName"),
      options: {
        setCellHeaderProps: () => ({ style: { padding: "8px 16px" } }),
        setCellProps: () => ({ style: { padding: "8px 16px" } }),
      },
    },
    {
      name: "exportPercentage",
      label: t("clusterDetail.voyager.status"),
      options: {
        customBodyRender: CompletionComponent(theme),
        setCellHeaderProps: () => ({ style: { padding: "8px 16px" } }),
        setCellProps: () => ({ style: { padding: "8px 16px" } }),
      },
    },
  ];

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
          {phase > MigrationPhase["Import Data"] && (
            <Box display="flex" gridGap={4} alignItems="center" mb={5}>
              <YBStatus type={STATUS_TYPES.SUCCESS} size={42} />
              <Box display="flex" flexDirection="column">
                <Typography variant="h5">
                  {t("clusterDetail.voyager.migrateData.migratedData")}
                </Typography>
                <Typography variant="body2">
                  {t("clusterDetail.voyager.migrateData.migratedDataDesc")}
                </Typography>
              </Box>
            </Box>
          )}

          <Box display="flex" gridGap={theme.spacing(2)} flexDirection="column">
            <YBAccordion
              titleContent={
                <AccordionTitleComponent
                  title={t("clusterDetail.voyager.exportData")}
                  status={
                    phase < MigrationPhase["Export Data"]
                      ? STATUS_TYPES.PENDING
                      : totalExportProgress === 100
                      ? STATUS_TYPES.SUCCESS
                      : STATUS_TYPES.IN_PROGRESS
                  }
                />
              }
              defaultExpanded={phase <= MigrationPhase["Export Data"]}
            >
              <Box flex={1} minWidth={0}>
                <Box mx={2} mb={5} mt={2}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="body1">
                      {t("clusterDetail.voyager.percentCompleted", {
                        percent: totalExportProgress,
                      })}
                    </Typography>
                  </Box>
                  <YBProgress value={totalExportProgress} />
                </Box>
                <Box mt={2}>
                  <YBTable
                    data={migrationProgressData}
                    columns={migrationExportColumns}
                    options={{
                      pagination: true,
                    }}
                    withBorder={false}
                  />
                </Box>
              </Box>
            </YBAccordion>
            <YBAccordion
              titleContent={
                <AccordionTitleComponent
                  title={t("clusterDetail.voyager.importData")}
                  status={
                    phase < MigrationPhase["Import Data"]
                      ? STATUS_TYPES.PENDING
                      : totalImportProgress === 100
                      ? STATUS_TYPES.SUCCESS
                      : STATUS_TYPES.IN_PROGRESS
                  }
                />
              }
              defaultExpanded={
                phase === MigrationPhase["Import Data"] || phase === MigrationPhase["Import Schema"]
              }
            >
              <Box flex={1} minWidth={0}>
                <Box mx={2} mb={5} mt={2}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="body1">
                      {t("clusterDetail.voyager.percentCompleted", {
                        percent: totalImportProgress,
                      })}
                    </Typography>
                  </Box>
                  <YBProgress value={totalImportProgress} />
                </Box>
                <Box mt={2}>
                  <YBTable
                    data={migrationProgressData}
                    columns={migrationImportColumns}
                    options={{
                      pagination: true,
                    }}
                    withBorder={false}
                  />
                </Box>
              </Box>
            </YBAccordion>
          </Box>
        </>
      )}
    </Box>
  );
};

const AccordionTitleComponent: React.FC<{ title: string; status?: STATUS_TYPES }> = ({
  title,
  status,
}) => {
  const theme = useTheme();

  return (
    <Box display="flex" alignItems="center" gridGap={theme.spacing(1.2)} flexGrow={1}>
      <Box mt={0.2}>{title}</Box>
      {status && <YBStatus type={status} />}
    </Box>
  );
};
