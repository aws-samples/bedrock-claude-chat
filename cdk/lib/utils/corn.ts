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

export type RdsSchedules = {
  stop: CronSchedule;
  restored: CronSchedule;
};

const isCronFieldBase = (value: unknown): value is CronFieldBase =>
  typeof value === "string" ||
  typeof value === "number" ||
  value === "*" ||
  value === "-" ||
  value === ",";

const isMinute = (value: unknown): value is Minute =>
  isCronFieldBase(value) || value === "/";

const isHour = (value: unknown): value is Hour =>
  isCronFieldBase(value) || value === "/";

const isDayOfMonth = (value: unknown): value is DayOfMonth =>
  isCronFieldBase(value) ||
  value === "?" ||
  value === "L" ||
  value === "W" ||
  value === "/";

const isMonth = (value: unknown): value is Month => {
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  return (
    isCronFieldBase(value) ||
    (typeof value === "string" && months.includes(value)) ||
    value === "/"
  );
};

const isDayOfWeek = (value: unknown): value is DayOfWeek => {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return (
    isCronFieldBase(value) ||
    value === "?" ||
    value === "L" ||
    value === "#" ||
    (typeof value === "string" && days.includes(value)) ||
    value === "/"
  );
};

const isYear = (value: unknown): value is Year => {
  if (typeof value !== "string") return false;
  if (value === "*" || value === "-" || value === "/") return true;

  const yearRange = value.split("-");
  if (yearRange.length !== 2) return false;

  const startYear = parseInt(yearRange[0], 10);
  const endYear = parseInt(yearRange[1], 10);

  return (
    !isNaN(startYear) && !isNaN(endYear) && startYear >= 1970 && endYear <= 2199
  );
};

const hasCornTypeGuard = (
  rdsSchedules: unknown
): rdsSchedules is RdsSchedules => {
  const args = rdsSchedules as RdsSchedules;
  return isCornSchedule(args.restored) && isCornSchedule(args.stop);
};

const isCornSchedule = (cornObject: unknown): cornObject is CronSchedule => {
  const args = cornObject as CronSchedule;

  return (
    isYear(args.year) &&
    isDayOfWeek(args.dayOfWeek) &&
    isDayOfMonth(args.dayOfMonth) &&
    isMonth(args.month) &&
    isHour(args.hour) &&
    isMinute(args.minute)
  );
};

export const createRdsScheduler = (rdsSchedules: RdsSchedules) => {
  const hasCorn = () => hasCornTypeGuard(rdsSchedules);

  return {
    hasCorn,
    stopCorn: rdsSchedules.stop,
    restoredCorn: rdsSchedules.restored,
  };
};

export type RdsScheduler = ReturnType<typeof createRdsScheduler>;
