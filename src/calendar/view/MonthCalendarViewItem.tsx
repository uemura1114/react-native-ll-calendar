import dayjs from 'dayjs';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { monthlyStartDate, monthlyEndDate } from '../../utility/functions';
import type { CalendarEvent, WeekStartsOn } from '../MonthCalendar';
import { MonthCalendarRow } from './MonthCalendarRow';
import { useEvents } from '../logic/useEvents';

export const MonthCalendarViewItem = (props: {
  month: string;
  weekStartsOn: WeekStartsOn;
  events: CalendarEvent[];
}) => {
  const { month, weekStartsOn, events } = props;
  const { width } = useWindowDimensions();

  const date = new Date(month);
  const dateDjs = dayjs(date);
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

  const { eventsGroupByWeekId } = useEvents({ events, weekStartsOn });

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.monthContainer}>
        <Text style={styles.monthText}>{dateDjs.format('YYYY/MM')}</Text>
      </View>
      <View>
        <MonthCalendarRow row={rows[0] ?? []} isWeekdayHeader={true} />
      </View>
      <View>
        {rows.map((row, index) => {
          const firstDayOfWeek = row[0];
          if (firstDayOfWeek === undefined) {
            return null;
          }
          const weekId = firstDayOfWeek.format('YYYY-MM-DD');
          const weekEvents = eventsGroupByWeekId[weekId] || [];
          return (
            <MonthCalendarRow
              key={`row-${index}`}
              row={row}
              events={weekEvents}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.2,
    borderColor: 'lightslategrey',
    alignSelf: 'flex-start',
  },
  monthContainer: {
    padding: 2,
    borderWidth: 0.2,
    borderColor: 'lightslategrey',
  },
  monthText: {
    textAlign: 'center',
  },
});
