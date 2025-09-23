import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { View, StyleSheet, ScrollView } from 'react-native';
import { MonthCalendar, type CalendarEvent } from 'react-native-ll-calendar';

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
        id: '1',
        title: '😃Meeting',
        start: new Date(currentYear, currentMonth, 5),
        end: new Date(currentYear, currentMonth, 5),
        backgroundColor: '#ff6b6b',
        borderColor: '#e55353',
        color: '#0e0e0e',
      },
      {
        id: '2',
        title: 'Conference',
        start: new Date(currentYear, currentMonth, 10),
        end: new Date(currentYear, currentMonth, 12),
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
        end: new Date(currentYear, currentMonth + 1, 2),
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
        start: new Date(currentYear, currentMonth + 1, 8),
        end: new Date(currentYear, currentMonth + 1, 10),
        backgroundColor: '#a29bfe',
        borderColor: '#6c5ce7',
        color: '#0e0e0e',
      },
      {
        id: '10-2',
        title: 'Seminar',
        start: new Date(currentYear, currentMonth + 1, 8),
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
    ];
  }, []);

  const handleEventPress = useCallback((event: CalendarEvent) => {
    Alert.alert('Notification', `pressed ${event.title}`);
  }, []);

  const handleCellPress = useCallback((d: Date) => {
    const djs = dayjs(d);
    Alert.alert('Notification', `pressed ${djs.format('YYYY-MM-DD')}`);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <MonthCalendar
          defaultDate={date}
          weekStartsOn={0}
          onChangeDate={handleChangeDate}
          events={events}
          onPressEvent={handleEventPress}
          onPressCell={handleCellPress}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    marginVertical: 80,
    width: '100%',
  },
});
