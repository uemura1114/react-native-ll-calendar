import dayjs from 'dayjs';
import ja from 'dayjs/locale/ja';
import { useCallback, useMemo, useState } from 'react';
import { Alert, type ViewStyle } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { MonthCalendar, type CalendarEvent } from 'react-native-ll-calendar';
import type { WeekdayNum } from '../../src/types/month-calendar';
import type { TextStyle } from 'react-native';

export default function App() {
  const [date, setDate] = useState(new Date());

  const handleChangeDate = useCallback((d: Date) => {
    setDate(d);
  }, []);

  const events: CalendarEvent[] = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return [
      {
        id: '1−1',
        title: '😃!Meeting',
        start: new Date(currentYear, currentMonth, 5, 22, 0),
        end: new Date(currentYear, currentMonth, 6, 1, 0),
        backgroundColor: '#ff6b6b',
        borderColor: '#e55353',
        color: '#0e0e0e',
      },
      {
        id: '1-2',
        title: '😃Meeting',
        start: new Date(currentYear, currentMonth, 9, 22, 0),
        end: new Date(currentYear, currentMonth, 10, 1, 0),
        backgroundColor: '#ff6b6b',
        borderColor: '#e55353',
        color: '#0e0e0e',
      },
      {
        id: '1-3',
        title: '😃Meeting',
        start: new Date(currentYear, currentMonth, 6, 22, 0),
        end: new Date(currentYear, currentMonth, 7, 1, 0),
        backgroundColor: '#ff6b6b',
        borderColor: '#e55353',
        color: '#0e0e0e',
      },
      {
        id: '2',
        title: 'Conference',
        start: new Date(currentYear, currentMonth, 10),
        end: new Date(currentYear, currentMonth, 19),
        backgroundColor: '#4ecdc4',
        borderColor: '#45b7aa',
        color: '#0e0e0e',
      },
      {
        id: '3',
        title: 'Appointment',
        start: new Date(currentYear, currentMonth, 15),
        end: new Date(currentYear, currentMonth, 15),
        backgroundColor: '#45b7d1',
        borderColor: '#3a9bc1',
        color: '#0e0e0e',
      },
      {
        id: '4',
        title: 'Workshop',
        start: new Date(currentYear, currentMonth, 20),
        end: new Date(currentYear, currentMonth, 22),
        backgroundColor: '#96ceb4',
        borderColor: '#7fb069',
        color: '#0e0e0e',
      },
      {
        id: '5',
        title: 'Review',
        start: new Date(currentYear, currentMonth, 25),
        end: new Date(currentYear, currentMonth, 25),
        backgroundColor: '#ffeaa7',
        borderColor: '#fdcb6e',
        color: '#0e0e0e',
      },
      {
        id: '6',
        title: 'Vacation',
        start: new Date(currentYear, currentMonth, 28),
        end: new Date(currentYear, currentMonth + 1, 4),
        backgroundColor: '#dda0dd',
        borderColor: '#ba68c8',
        color: '#0e0e0e',
      },

      {
        id: '7',
        title: 'Training',
        start: new Date(currentYear, currentMonth - 1, 18),
        end: new Date(currentYear, currentMonth - 1, 20),
        backgroundColor: '#74b9ff',
        borderColor: '#0984e3',
        color: '#0e0e0e',
      },
      {
        id: '8',
        title: 'Birthday',
        start: new Date(currentYear, currentMonth - 1, 25),
        end: new Date(currentYear, currentMonth - 1, 25),
        backgroundColor: '#fd79a8',
        borderColor: '#e84393',
        color: '#0e0e0e',
      },
      {
        id: '9',
        title: 'Project Deadline',
        start: new Date(currentYear, currentMonth - 1, 30),
        end: new Date(currentYear, currentMonth, 1),
        backgroundColor: '#fdcb6e',
        borderColor: '#e17055',
        color: '#0e0e0e',
      },

      {
        id: '10-1',
        title: 'Seminar',
        start: new Date(currentYear, currentMonth + 1, 3),
        end: new Date(currentYear, currentMonth + 1, 10),
        backgroundColor: '#a29bfe',
        borderColor: '#6c5ce7',
        color: '#0e0e0e',
      },
      {
        id: '10-2',
        title: 'Seminar',
        start: new Date(currentYear, currentMonth + 1, 4),
        end: new Date(currentYear, currentMonth + 1, 9),
        backgroundColor: '#a29bfe',
        borderColor: '#6c5ce7',
        color: '#0e0e0e',
      },
      {
        id: '10-3',
        title: 'Seminar',
        start: new Date(currentYear, currentMonth + 1, 10),
        end: new Date(currentYear, currentMonth + 1, 10),
        backgroundColor: '#a29bfe',
        borderColor: '#6c5ce7',
        color: '#0e0e0e',
      },
      {
        id: '10-4',
        title: 'Seminar',
        start: new Date(currentYear, currentMonth + 1, 10),
        end: new Date(currentYear, currentMonth + 1, 10),
        backgroundColor: '#a29bfe',
        borderColor: '#6c5ce7',
        color: '#0e0e0e',
      },
      {
        id: '11',
        title: 'Team Lunch',
        start: new Date(currentYear, currentMonth + 1, 14),
        end: new Date(currentYear, currentMonth + 1, 14),
        backgroundColor: '#fd79a8',
        borderColor: '#e84393',
        color: '#0e0e0e',
      },
      {
        id: '12',
        title: 'Business Trip',
        start: new Date(currentYear, currentMonth + 1, 20),
        end: new Date(currentYear, currentMonth + 1, 23),
        backgroundColor: '#00b894',
        borderColor: '#00a085',
        color: '#0e0e0e',
      },
      {
        id: '13',
        title: 'Presentation',
        start: new Date(currentYear, currentMonth + 1, 28),
        end: new Date(currentYear, currentMonth + 1, 28),
        backgroundColor: '#fab1a0',
        borderColor: '#e17055',
        color: '#0e0e0e',
      },
      {
        id: '14',
        title: 'Event 1',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#ff6b6b',
        borderColor: '#e55353',
        color: '#0e0e0e',
      },
      {
        id: '15',
        title: 'Event 2',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#4ecdc4',
        borderColor: '#45b7aa',
        color: '#0e0e0e',
      },
      {
        id: '16',
        title: 'Event 3',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#45b7d1',
        borderColor: '#3a9bc1',
        color: '#0e0e0e',
      },
      {
        id: '17',
        title: 'Event 4',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#96ceb4',
        borderColor: '#7fb069',
        color: '#0e0e0e',
      },
      {
        id: '18',
        title: 'Event 5',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#ffeaa7',
        borderColor: '#fdcb6e',
        color: '#0e0e0e',
      },
      {
        id: '19',
        title: 'Event 6',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#dda0dd',
        borderColor: '#ba68c8',
        color: '#0e0e0e',
      },
      {
        id: '20',
        title: 'Event 7',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#74b9ff',
        borderColor: '#0984e3',
        color: '#0e0e0e',
      },
      {
        id: '21',
        title: 'Event 8',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#fd79a8',
        borderColor: '#e84393',
        color: '#0e0e0e',
      },
      {
        id: '22',
        title: 'Event 9',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#fdcb6e',
        borderColor: '#e17055',
        color: '#0e0e0e',
      },
      {
        id: '23',
        title: 'Event 10',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#a29bfe',
        borderColor: '#6c5ce7',
        color: '#0e0e0e',
      },
      {
        id: '24',
        title: 'Event 11',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#fd79a8',
        borderColor: '#e84393',
        color: '#0e0e0e',
      },
      {
        id: '25',
        title: 'Event 12',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#00b894',
        borderColor: '#00a085',
        color: '#0e0e0e',
      },
      {
        id: '26',
        title: 'Event 13',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#fab1a0',
        borderColor: '#e17055',
        color: '#0e0e0e',
      },
      {
        id: '27',
        title: 'Event 14',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#ff6b6b',
        borderColor: '#e55353',
        color: '#0e0e0e',
      },
      {
        id: '28',
        title: 'Event 15',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#4ecdc4',
        borderColor: '#45b7aa',
        color: '#0e0e0e',
      },
      {
        id: '29',
        title: 'Event 16',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#45b7d1',
        borderColor: '#3a9bc1',
        color: '#0e0e0e',
      },
      {
        id: '30',
        title: 'Event 17',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#96ceb4',
        borderColor: '#7fb069',
        color: '#0e0e0e',
      },
      {
        id: '31',
        title: 'Event 18',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#ffeaa7',
        borderColor: '#fdcb6e',
        color: '#0e0e0e',
      },
      {
        id: '32',
        title: 'Event 19',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#dda0dd',
        borderColor: '#ba68c8',
        color: '#0e0e0e',
      },
      {
        id: '33',
        title: 'Event 20',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#74b9ff',
        borderColor: '#0984e3',
        color: '#0e0e0e',
      },
    ];
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
      setRefreshing(false);
    }, 2000);
  }, []);

  const dayCellContainerStyle: (date: Date) => ViewStyle = useCallback((d) => {
    if (d.getDate() === 10) {
      return {
        borderColor: 'red',
        backgroundColor: 'lightgray',
        borderWidth: 2,
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

  return (
    <View style={styles.container}>
      <MonthCalendar
        defaultDate={date}
        weekStartsOn={1}
        onChangeDate={handleChangeDate}
        events={events}
        onPressEvent={handleEventPress}
        onPressCell={handleCellPress}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        dayCellContainerStyle={dayCellContainerStyle}
        locale={ja}
        weekdayCellContainerStyle={weekdayCellContainerStyle}
        weekdayCellTextStyle={weekdayCellTextStyle}
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
