import dayjs from 'dayjs';
import en from 'dayjs/locale/en';
import { StyleSheet } from 'react-native';
import { Text, View, type ViewStyle } from 'react-native';
import type { WeekdayNum } from '../../../types/month-calendar';
import { CELL_BORDER_WIDTH } from '../../../constants/size';
import type { TextStyle } from 'react-native';

export const MonthCalendarWeekDayRow = (props: {
  locale?: ILocale;
  dates: dayjs.Dayjs[];
  weekdayCellContainerStyle?: (weekDayNum: WeekdayNum) => ViewStyle;
  weekdayCellTextStyle?: (weekDayNum: WeekdayNum) => TextStyle;
}) => {
  return (
    <View style={styles.container}>
      {props.dates.map((djs, dateIndex) => {
        const text = djs.locale(props.locale ?? en).format('ddd');

        return (
          <View
            key={djs.get('d')}
            style={[styles.dayCellContainer, { zIndex: 7 - dateIndex }]}
          >
            <View
              style={[
                styles.dayCellInner,
                props.weekdayCellContainerStyle?.(djs.day()),
              ]}
            />
            <View style={styles.dayCellLabel}>
              <Text
                style={[
                  styles.dayCellText,
                  props.weekdayCellTextStyle?.(djs.day()),
                ]}
              >
                {text}
              </Text>
            </View>
          </View>
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
    backgroundColor: 'white',
  },
  dayCellContainer: {
    flex: 1,
    borderRightWidth: CELL_BORDER_WIDTH,
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderColor: 'lightslategrey',
    backgroundColor: 'white',
    position: 'relative',
  },
  dayCellInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
