import dayjs from 'dayjs';
import { monthlyEndDate, monthlyStartDate } from '../../utility/functions';

const useMonthCalendar = (props: { date: Date; weekStartsOn: 0 | 1 }) => {
  const { date, weekStartsOn } = props;
  const startDate = monthlyStartDate({ date, weekStartsOn });
  const endDate = monthlyEndDate({ date, weekStartsOn });
  const endDjs = dayjs(endDate);
  const rows: dayjs.Dayjs[][] = [];

  let currentDate = dayjs(startDate);
  while (currentDate.isBefore(endDjs)) {
    const row = Array.from({ length: 7 }, (_, i) => {
      return currentDate.add(i, 'day');
    });
    rows.push(row);
    currentDate = currentDate.add(7, 'day');
  }

  return { rows };
};
export default useMonthCalendar;
