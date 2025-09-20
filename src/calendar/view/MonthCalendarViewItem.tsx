import type dayjs from 'dayjs';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

export const MonthCalendarViewItem = (props: { rows: dayjs.Dayjs[][] }) => {
  const { rows } = props;
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        {rows[0]?.map((date) => {
          return (
            <View
              key={date.get('day')}
              style={[styles.headerCellCountainer, { width: width / 7 }]}
            >
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
                  style={[styles.dayCellCountainer, { width: width / 7 }]}
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
    borderWidth: 0.3,
  },
  rowContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  dayCellCountainer: {
    minHeight: 80,
    borderWidth: 0.3,
    borderColor: 'gray',
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
    borderWidth: 0.3,
    paddingVertical: 2,
    borderColor: 'gray',
  },
  headerCellText: {
    textAlign: 'center',
    fontSize: 12,
  },
});
