import { View, StyleSheet, ScrollView } from 'react-native';
import { MonthCalendar } from 'react-native-light-calendar';

export default function App() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <MonthCalendar date={new Date('2025-09-22')} weekStartsOn={1} />
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
