import { CronOptions } from "aws-cdk-lib/aws-events";

export type RdsSchedules = {
  stop: CronOptions;
  restored: CronOptions;
};

const hasCronObject = (cornObject: CronOptions) =>
  Object.keys(cornObject).length > 0;

export const createRdsScheduler = (rdsSchedules: RdsSchedules) => {
  const hasCorn = () =>
    hasCronObject(rdsSchedules.stop) && hasCronObject(rdsSchedules.restored);

  return {
    hasCorn,
    stopCorn: rdsSchedules.stop,
    restoredCorn: rdsSchedules.restored,
  };
};

export type RdsScheduler = ReturnType<typeof createRdsScheduler>;
