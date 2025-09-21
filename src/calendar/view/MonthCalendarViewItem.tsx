import dayjs from 'dayjs';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { monthlyStartDate, monthlyEndDate } from '../../utility/functions';
import type { CalendarEvent, WeekStartsOn } from '../MonthCalendar';
import { MonthCalendarWeekRow } from './MonthCalendarWeekRow';
import { useEvents } from '../logic/useEvents';
import MonthCalendarEventPosition from '../../utility/month-calendar-event-position';
import { CELL_BORDER_WIDTH } from '../../utility/size';

export const MonthCalendarViewItem = (props: {
  month: string;
  weekStartsOn: WeekStartsOn;
  events: CalendarEvent[];
}) => {
  const { month, weekStartsOn, events } = props;
  const { width } = useWindowDimensions();
  const eventPosition = new MonthCalendarEventPosition();

  const date = new Date(month);
  const dateDjs = dayjs(date);
  const startDate = monthlyStartDate({ date, weekStartsOn });
  const endDate = monthlyEndDate({ date, weekStartsOn });
  const endDjs = dayjs(endDate);
  const weeks: dayjs.Dayjs[][] = [];
  let currentDate = dayjs(startDate);
  while (currentDate.isBefore(endDjs)) {
    const week = Array.from({ length: 7 }, (_, i) => {
      return currentDate.add(i, 'day');
    });
    weeks.push(week);
    currentDate = currentDate.add(7, 'day');
  }

  const { eventsGroupByWeekId } = useEvents({ events, weekStartsOn });

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.monthContainer}>
        <Text style={styles.monthText}>{dateDjs.format('YYYY/MM')}</Text>
      </View>
      <View>
        <MonthCalendarWeekRow dates={weeks[0] ?? []} isWeekdayHeader={true} />
      </View>
      <View>
        {weeks.map((week, index) => {
          const firstDayOfWeek = week[0];
          if (firstDayOfWeek === undefined) {
            return null;
          }
          const weekId = firstDayOfWeek.format('YYYY-MM-DD');
          const weekEvents = eventsGroupByWeekId[weekId] || [];
          return (
            <MonthCalendarWeekRow
              key={`row-${index}`}
              dates={week}
              events={weekEvents}
              eventPosition={eventPosition}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: CELL_BORDER_WIDTH,
    borderColor: 'lightslategrey',
    alignSelf: 'flex-start',
  },
  monthContainer: {
    padding: 2,
    borderWidth: CELL_BORDER_WIDTH,
    borderColor: 'lightslategrey',
  },
  monthText: {
    textAlign: 'center',
  },
});
