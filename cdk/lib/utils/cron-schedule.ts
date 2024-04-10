import { CronOptions } from "aws-cdk-lib/aws-events";

export type RdsSchedules = {
  stop: CronOptions;
  start: CronOptions;
};

const hasCronObject = (cronObject: CronOptions) =>
  Object.keys(cronObject).length > 0;

export const createCronSchedule = (rdsSchedules: RdsSchedules) => {
  const hasCron = () =>
    hasCronObject(rdsSchedules.stop) && hasCronObject(rdsSchedules.start);

  return {
    hasCron,
    stopCron: rdsSchedules.stop,
    startCron: rdsSchedules.start,
  };
};

export type CronSchedule = ReturnType<typeof createCronSchedule>;
