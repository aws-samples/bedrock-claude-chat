import dayjs from 'dayjs';

export const formatDatetime = (date: Date) => {
  return dayjs(date).format('YYYY/MM/DD HH:mm:ss');
};
