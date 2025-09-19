import { View, StyleSheet, ScrollView } from 'react-native';
import { MonthCalendar } from 'react-native-light-calendar';

export default function App() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <MonthCalendar date={new Date()} />
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
    borderWidth: 0.5,
  },
});
