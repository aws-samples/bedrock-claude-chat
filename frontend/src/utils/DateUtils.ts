import dayjs, { ManipulateType } from 'dayjs';

const DEFAULT_DATETIME_FORMAT = 'YYYY/MM/DD HH:mm:ss';
const DEFAULT_DATE_FORMAT = 'YYYY/MM/DD';

export const formatDatetime = (date: dayjs.ConfigType, format?: string) => {
  return dayjs(date).format(format ?? DEFAULT_DATETIME_FORMAT);
};

export const formatDate = (date: dayjs.ConfigType, format?: string) => {
  return dayjs(date).format(format ?? DEFAULT_DATE_FORMAT);
};

export const addDate = (
  date: dayjs.ConfigType,
  value: number,
  unit?: ManipulateType
) => {
  return dayjs(date).add(value, unit).toDate();
};
