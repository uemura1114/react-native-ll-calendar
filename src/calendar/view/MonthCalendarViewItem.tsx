import dayjs from 'dayjs';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { monthlyStartDate, monthlyEndDate } from '../../utility/functions';
import type { WeekStartsOn } from '../MonthCalendar';

export const MonthCalendarViewItem = (props: {
  month: string;
  weekStartsOn: WeekStartsOn;
}) => {
  const { month, weekStartsOn } = props;
  const { width } = useWindowDimensions();

  const date = new Date(month);
  const dateDjs = dayjs(date);
  const startDate = monthlyStartDate({ date, weekStartsOn });
  const endDate = monthlyEndDate({ date, weekStartsOn });
  const endDjs = dayjs(endDate);
  const rows: dayjs.Dayjs[][] = [];
  let currentDate = dayjs(startDate);
  while (currentDate.isBefore(endDjs)) {
    const row = Array.from({ length: 7 }, (_, i) => {
      return currentDate.add(i, 'day');
    });
    rows.push(row);
    currentDate = currentDate.add(7, 'day');
  }

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.monthContainer}>
        <Text style={styles.monthText}>{dateDjs.format('YYYY/MM')}</Text>
      </View>
      <View style={styles.rowContainer}>
        {rows[0]?.map((djs) => {
          return (
            <View
              key={djs.get('day')}
              style={[styles.headerCellCountainer, { width: width / 7 }]}
            >
              <Text style={styles.dayCellText}>{djs.format('ddd')}</Text>
            </View>
          );
        })}
      </View>
      {rows.map((row, index) => {
        return (
          <View key={`row-${index}`} style={styles.rowContainer}>
            {row.map((djs) => {
              return (
                <TouchableOpacity
                  style={[styles.dayCellCountainer, { width: width / 7 }]}
                  key={djs.get('date')}
                >
                  <View style={styles.dayCellLabel}>
                    <Text
                      style={styles.dayCellText}
                    >{`${djs.format('D')}`}</Text>
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
    borderWidth: 0.2,
    borderColor: 'lightslategrey',
    alignSelf: 'flex-start',
  },
  monthContainer: {
    padding: 2,
    borderWidth: 0.2,
    borderColor: 'lightslategrey',
  },
  monthText: {
    textAlign: 'center',
  },
  rowContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  dayCellCountainer: {
    minHeight: 80,
    borderWidth: 0.2,
    borderColor: 'lightslategrey',
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
    borderColor: 'lightslategrey',
    paddingVertical: 2,
  },
  headerCellText: {
    textAlign: 'center',
    fontSize: 12,
  },
});
