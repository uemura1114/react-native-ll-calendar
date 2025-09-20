import type dayjs from 'dayjs';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const MonthCalendarView = (props: { rows: dayjs.Dayjs[][] }) => {
  const { rows } = props;
  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        {rows[0]?.map((date) => {
          return (
            <View key={date.get('day')} style={styles.headerCellCountainer}>
              <Text style={styles.dayCellText}>{date.format('ddd')}</Text>
            </View>
          );
        })}
      </View>
      {rows.map((row, index) => {
        return (
          <View key={`row-${index}`} style={styles.rowContainer}>
            {row.map((date) => {
              return (
                <TouchableOpacity
                  style={styles.dayCellCountainer}
                  key={date.get('date')}
                >
                  <View style={styles.dayCellLabel}>
                    <Text
                      style={styles.dayCellText}
                    >{`${date.format('D')}`}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 0.2,
  },
  rowContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  dayCellCountainer: {
    minHeight: 80,
    borderWidth: 0.2,
    borderColor: 'gray',
    width: `${100 / 7}%`,
  },
  dayCellLabel: {
    paddingVertical: 1,
    paddingHorizontal: 2,
  },
  dayCellText: {
    textAlign: 'center',
    fontSize: 12,
  },
  weekContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  headerCellCountainer: {
    borderWidth: 0.2,
    paddingVertical: 2,
    borderColor: 'gray',
    width: `${100 / 7}%`,
  },
  headerCellText: {
    textAlign: 'center',
    fontSize: 12,
  },
});
