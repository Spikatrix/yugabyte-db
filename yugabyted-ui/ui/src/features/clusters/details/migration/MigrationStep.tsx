import React, { FC } from "react";
import { Box } from "@material-ui/core";
import type { Migration } from "./MigrationOverview";
import { MigrationData } from "./steps/MigrationData";
import { MigrationPlanAssess } from "./steps/MigrationPlanAssess";
import { MigrationSchema } from "./steps/MigrationSchema";
import { MigrationVerify } from "./steps/MigrationVerify";

interface MigrationStepProps {
  steps: string[];
  migration: Migration;
  step: number;
  onRefetch: () => void;
  isFetching?: boolean;
}

const stepComponents = [MigrationPlanAssess, MigrationSchema, MigrationData, MigrationVerify];

export const MigrationStep: FC<MigrationStepProps> = ({
  steps = [""],
  migration,
  step,
  onRefetch,
  isFetching = false,
}) => {
  return (
    <Box mt={1}>
      {stepComponents.map((StepComponent, index) => {
        if (index === step) {
          return (
            <StepComponent
              key={index}
              step={index}
              heading={steps[step]}
              migration={migration}
              onRefetch={onRefetch}
              isFetching={isFetching}
            />
          );
        }
        return <React.Fragment key={index} />;
      })}
    </Box>
  );
};
