import { CronOptions } from "aws-cdk-lib/aws-events";

export type RdsSchedules = {
  stop: CronOptions;
  restored: CronOptions;
};

const hasCronObject = (cronObject: CronOptions) =>
  Object.keys(cronObject).length > 0;

export const createRdsScheduler = (rdsSchedules: RdsSchedules) => {
  const hasCron = () =>
    hasCronObject(rdsSchedules.stop) && hasCronObject(rdsSchedules.restored);

  return {
    hasCron,
    stopCron: rdsSchedules.stop,
    restoredCron: rdsSchedules.restored,
  };
};

export type RdsScheduler = ReturnType<typeof createRdsScheduler>;
