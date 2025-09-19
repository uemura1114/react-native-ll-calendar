import dayjs from 'dayjs';
import { View, StyleSheet, Text } from 'react-native';

export const MonthCalendar = (props: { date: Date }) => {
  const { date } = props;
  return (
    <View style={styles.container}>
      <Text>{dayjs(date).format('YYYY-MM-DD')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 1000,
  },
  cellCountainer: {
    minHeight: 50,
    borderWidth: 0.5,
  },
});
