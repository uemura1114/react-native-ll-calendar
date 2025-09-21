import { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { MonthCalendar, type CalendarEvent } from 'react-native-light-calendar';

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
        title: 'Meeting',
        start: new Date(currentYear, currentMonth, 5),
        end: new Date(currentYear, currentMonth, 5),
        backgroundColor: '#ff6b6b',
        borderColor: '#e55353',
      },
      {
        id: '2',
        title: 'Conference',
        start: new Date(currentYear, currentMonth, 10),
        end: new Date(currentYear, currentMonth, 12),
        backgroundColor: '#4ecdc4',
        borderColor: '#45b7aa',
      },
      {
        id: '3',
        title: 'Appointment',
        start: new Date(currentYear, currentMonth, 15),
        end: new Date(currentYear, currentMonth, 15),
        backgroundColor: '#45b7d1',
        borderColor: '#3a9bc1',
      },
      {
        id: '4',
        title: 'Workshop',
        start: new Date(currentYear, currentMonth, 20),
        end: new Date(currentYear, currentMonth, 22),
        backgroundColor: '#96ceb4',
        borderColor: '#7fb069',
      },
      {
        id: '5',
        title: 'Review',
        start: new Date(currentYear, currentMonth, 25),
        end: new Date(currentYear, currentMonth, 25),
        backgroundColor: '#ffeaa7',
        borderColor: '#fdcb6e',
      },
      {
        id: '6',
        title: 'Vacation',
        start: new Date(currentYear, currentMonth, 28),
        end: new Date(currentYear, currentMonth + 1, 2),
        backgroundColor: '#dda0dd',
        borderColor: '#ba68c8',
      },

      {
        id: '7',
        title: 'Training',
        start: new Date(currentYear, currentMonth - 1, 18),
        end: new Date(currentYear, currentMonth - 1, 20),
        backgroundColor: '#74b9ff',
        borderColor: '#0984e3',
      },
      {
        id: '8',
        title: 'Birthday',
        start: new Date(currentYear, currentMonth - 1, 25),
        end: new Date(currentYear, currentMonth - 1, 25),
        backgroundColor: '#fd79a8',
        borderColor: '#e84393',
      },
      {
        id: '9',
        title: 'Project Deadline',
        start: new Date(currentYear, currentMonth - 1, 30),
        end: new Date(currentYear, currentMonth, 1),
        backgroundColor: '#fdcb6e',
        borderColor: '#e17055',
      },

      {
        id: '10',
        title: 'Seminar',
        start: new Date(currentYear, currentMonth + 1, 8),
        end: new Date(currentYear, currentMonth + 1, 10),
        backgroundColor: '#a29bfe',
        borderColor: '#6c5ce7',
      },
      {
        id: '11',
        title: 'Team Lunch',
        start: new Date(currentYear, currentMonth + 1, 14),
        end: new Date(currentYear, currentMonth + 1, 14),
        backgroundColor: '#fd79a8',
        borderColor: '#e84393',
      },
      {
        id: '12',
        title: 'Business Trip',
        start: new Date(currentYear, currentMonth + 1, 20),
        end: new Date(currentYear, currentMonth + 1, 23),
        backgroundColor: '#00b894',
        borderColor: '#00a085',
      },
      {
        id: '13',
        title: 'Presentation',
        start: new Date(currentYear, currentMonth + 1, 28),
        end: new Date(currentYear, currentMonth + 1, 28),
        backgroundColor: '#fab1a0',
        borderColor: '#e17055',
      },
    ];
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <MonthCalendar
          defaultDate={date}
          weekStartsOn={0}
          onChangeDate={handleChangeDate}
          events={events}
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
