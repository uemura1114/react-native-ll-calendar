import type dayjs from 'dayjs';
import { StyleSheet } from 'react-native';
import { Text, TouchableOpacity, View } from 'react-native';

export const MonthCalendarRow = (props: {
  row: dayjs.Dayjs[];
  isWeekdayHeader?: boolean;
}) => {
  const { row, isWeekdayHeader } = props;
  return (
    <View style={styles.container}>
      {row.map((djs) => {
        const text = isWeekdayHeader ? djs.format('ddd') : djs.format('D');
        return (
          <TouchableOpacity
            key={isWeekdayHeader ? djs.get('d') : djs.get('date')}
            style={[
              styles.dayCellCountainer,
              isWeekdayHeader ? { minHeight: undefined } : {},
            ]}
          >
            <View style={styles.dayCellLabel}>
              <Text style={styles.dayCellText}>{text}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  dayCellCountainer: {
    minHeight: 80,
    flex: 1,
    borderWidth: 0.2,
    borderColor: 'lightslategrey',
    backgroundColor: 'white',
  },
  dayCellLabel: {
    paddingVertical: 1,
    paddingHorizontal: 2,
  },
  dayCellText: {
    textAlign: 'center',
    fontSize: 12,
  },
});
