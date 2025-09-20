import useMonthCalendar from './logic/useMonthCalendar';
import { MonthCalendarView } from './view/MonthCalendarView';

export const MonthCalendar = (props: { date: Date; weekStartsOn?: 0 | 1 }) => {
  const { date, weekStartsOn = 0 } = props;
  const { rows } = useMonthCalendar({ date, weekStartsOn });

  return <MonthCalendarView rows={rows} />;
};
