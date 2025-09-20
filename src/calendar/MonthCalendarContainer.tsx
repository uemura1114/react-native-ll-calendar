import useMonthCalendar from './logic/useMonthCalendar';
import { MonthCalendarView } from './view/MonthCalendarView';

type WeekStartsOn = 0 | 1;

export const MonthCalendar = (props: {
  date: Date;
  weekStartsOn?: WeekStartsOn;
}) => {
  const { date, weekStartsOn = 0 } = props;
  const { rows } = useMonthCalendar({ date, weekStartsOn });

  return <MonthCalendarView rows={rows} />;
};
