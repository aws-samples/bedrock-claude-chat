type CronFieldBase = string | number | "*" | "-" | ",";

type Minute = `${CronFieldBase}` | "/";
type Hour = `${CronFieldBase}` | "/";
type DayOfMonth = `${CronFieldBase}` | "?" | "L" | "W" | "/";
type Month =
  | `${CronFieldBase}`
  | "JAN"
  | "FEB"
  | "MAR"
  | "APR"
  | "MAY"
  | "JUN"
  | "JUL"
  | "AUG"
  | "SEP"
  | "OCT"
  | "NOV"
  | "DEC"
  | "/";
type DayOfWeek =
  | `${CronFieldBase}`
  | "?"
  | "L"
  | "#"
  | "SUN"
  | "MON"
  | "TUE"
  | "WED"
  | "THU"
  | "FRI"
  | "SAT"
  | "/";
type Year = `${1970 | number}-${2199 | number}` | "*" | "-" | "/";

type CronSchedule = {
  minute: Minute;
  hour: Hour;
  dayOfMonth: DayOfMonth;
  month: Month;
  dayOfWeek: DayOfWeek;
  year: Year;
};

type RdsScheduler = {
  timeToStop: CronSchedule;
  restorationTime: CronSchedule;
};

const isCormn = (rdbShutdown: unknown): rdbShutdown is RdsScheduler => {
  return true;
};
