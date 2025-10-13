import dayjs from 'dayjs';
import ja from 'dayjs/locale/ja';
import { useCallback, useState } from 'react';
import { Alert, type ViewStyle } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { MonthCalendar, type CalendarEvent } from 'react-native-ll-calendar';
import type { WeekdayNum } from '../../src/types/month-calendar';
import type { TextStyle } from 'react-native';
import { exampleEvents } from './utils/events';
import * as Haptics from 'expo-haptics';

export default function App() {
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const [events, setEvents] = useState<CalendarEvent[]>(
    exampleEvents(currentYear, currentMonth)
  );

  const handleChangeDate = useCallback((d: Date) => {
    setDate(d);
  }, []);

  const handleEventPress = useCallback((event: CalendarEvent) => {
    Alert.alert('Notification', `pressed ${event.title}`);
  }, []);

  const handleCellPress = useCallback((d: Date) => {
    const djs = dayjs(d);
    Alert.alert('Notification', `pressed ${djs.format('YYYY-MM-DD')}`);
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setEvents(exampleEvents(currentYear, currentMonth));
      setRefreshing(false);
    }, 1000);
  }, [currentMonth, currentYear]);

  const dayCellContainerStyle: (date: Date) => ViewStyle = useCallback(
    (d) => {
      if (dayjs(d).isSame(dayjs(selectedDate), 'day')) {
        return {
          backgroundColor: 'lightgray',
        };
      }
      return {};
    },
    [selectedDate]
  );

  const dayCellTextStyle: (date: Date) => TextStyle = useCallback((d) => {
    if (d.getDay() === 0) {
      return {
        color: 'red',
        fontWeight: 'bold',
      };
    } else if (d.getDay() === 6) {
      return {
        color: 'blue',
        fontWeight: 'bold',
      };
    }
    return {};
  }, []);

  const weekdayCellContainerStyle: (weekday: WeekdayNum) => ViewStyle =
    useCallback((day) => {
      if (day === 0 || day === 6) {
        return {
          backgroundColor: 'lightgreen',
        };
      }
      return {};
    }, []);

  const weekdayCellTextStyle: (weekday: WeekdayNum) => TextStyle = useCallback(
    (day) => {
      if (day === 0) {
        return {
          color: 'red',
          fontWeight: 'bold',
        };
      } else if (day === 6) {
        return {
          color: 'blue',
          fontWeight: 'bold',
        };
      }
      return {};
    },
    []
  );

  const todayCellTextStyle: TextStyle = {
    backgroundColor: 'lightblue',
    borderRadius: 12,
  };

  const handleLongPressCell = useCallback((d: Date) => {
    setSelectedDate(d);
  }, []);

  const handleEventDragStart = useCallback((event: CalendarEvent) => {
    console.log('handleEventDragStart', event);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleEventDrop = useCallback(
    (args: { event: CalendarEvent; newStartDate: Date }) => {
      const { event, newStartDate } = args;
      const diff = dayjs(newStartDate).diff(dayjs(event.start), 'days');
      const newEndDate = dayjs(event.end).add(diff, 'days').toDate();
      setEvents((prev) => {
        const filtered = prev.filter((e) => e.id !== event.id);
        return [
          ...filtered,
          { ...event, start: newStartDate, end: newEndDate },
        ];
      });
    },
    []
  );

  return (
    <View style={styles.container}>
      <MonthCalendar
        defaultDate={date}
        weekStartsOn={1}
        onChangeDate={handleChangeDate}
        events={events}
        onPressEvent={handleEventPress}
        onPressCell={handleCellPress}
        onLongPressCell={handleLongPressCell}
        delayLongPress={500}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        dayCellContainerStyle={dayCellContainerStyle}
        dayCellTextStyle={dayCellTextStyle}
        locale={ja}
        weekdayCellContainerStyle={weekdayCellContainerStyle}
        weekdayCellTextStyle={weekdayCellTextStyle}
        todayCellTextStyle={todayCellTextStyle}
        hiddenMonth={false}
        monthFormat={'YYYY/MM'}
        onEventDragStart={handleEventDragStart}
        onEventDrop={handleEventDrop}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 80,
    width: '100%',
  },
});
