import { CronOptions } from "aws-cdk-lib/aws-events";

export type CronScheduleProps = {
  stop: CronOptions;
  start: CronOptions;
};

const hasCronObject = (cronObject: CronOptions) =>
  Object.keys(cronObject).length > 0;

export const createCronSchedule = (schedules: CronScheduleProps) => {
  const hasCron = () =>
    hasCronObject(schedules.stop) && hasCronObject(schedules.start);

  return {
    hasCron,
    stopCron: schedules.stop,
    startCron: schedules.start,
  };
};

export type CronSchedule = ReturnType<typeof createCronSchedule>;
