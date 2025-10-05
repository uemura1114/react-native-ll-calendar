import dayjs from 'dayjs';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MonthCalendarWeekRow } from './MonthCalendarWeekRow';
import type {
  CalendarEvent,
  WeekStartsOn,
} from '../../../types/month-calendar';
import MonthCalendarEventPosition from '../../../utils/month-calendar-event-position';
import { monthlyEndDate, monthlyStartDate } from '../../../utils/functions';
import { useEvents } from '../logic/useEvents';
import { CELL_BORDER_WIDTH } from '../../../constants/size';

export const MonthCalendarViewItem = (props: {
  month: string;
  weekStartsOn: WeekStartsOn;
  events: CalendarEvent[];
  onPressEvent?: (event: CalendarEvent) => void;
  onPressCell?: (date: Date) => void;
  flatListIndex: number;
}) => {
  const {
    month,
    weekStartsOn,
    events,
    onPressEvent,
    onPressCell,
    flatListIndex,
  } = props;
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
    <View style={[styles.container, { width, zIndex: flatListIndex }]}>
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
              onPressEvent={onPressEvent}
              onPressCell={onPressCell}
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
    backgroundColor: 'white',
  },
  monthText: {
    textAlign: 'center',
  },
});
