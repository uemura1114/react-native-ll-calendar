import { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { MonthCalendar } from 'react-native-light-calendar';

export default function App() {
  const [date, setDate] = useState(new Date());

  const handleChangeDate = useCallback((d: Date) => {
    setDate(d);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <MonthCalendar
          defaultDate={date}
          weekStartsOn={0}
          onChangeDate={handleChangeDate}
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
