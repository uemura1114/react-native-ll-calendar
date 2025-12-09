import dayjs from 'dayjs';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { MonthCalendarWeekRow } from './MonthCalendarWeekRow';
import type {
  CalendarEvent,
  WeekdayNum,
  WeekStartsOn,
} from '../../../types/month-calendar';
import MonthCalendarEventPosition from '../../../utils/month-calendar-event-position';
import { monthlyEndDate, monthlyStartDate } from '../../../utils/functions';
import { useEvents } from '../logic/useEvents';
import { CELL_BORDER_WIDTH } from '../../../constants/size';
import { RefreshControl } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { MonthCalendarWeekDayRow } from './MonthCalendarWeekDayRow';

export const MonthCalendarViewItem = (props: {
  month: string;
  weekStartsOn: WeekStartsOn;
  events: CalendarEvent[];
  onPressEvent?: (event: CalendarEvent) => void;
  onLongPressEvent?: (event: CalendarEvent) => void;
  delayLongPressEvent?: number;
  onPressCell?: (date: Date) => void;
  onLongPressCell?: (date: Date) => void;
  delayLongPressCell?: number;
  flatListIndex: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  dayCellContainerStyle?: (date: Date) => ViewStyle;
  dayCellTextStyle?: (date: Date) => TextStyle;
  locale?: ILocale;
  weekdayCellContainerStyle?: (weekDayNum: WeekdayNum) => ViewStyle;
  weekdayCellTextStyle?: (weekDayNum: WeekdayNum) => TextStyle;
  todayCellTextStyle?: TextStyle;
  hiddenMonth?: boolean;
  monthFormat?: string;
  stickyHeaderEnabled?: boolean;
  cellBorderColor?: string;
  allowFontScaling?: boolean;
  eventHeight?: number;
  eventTextStyle?: (event: CalendarEvent) => TextStyle;
}) => {
  const { width } = useWindowDimensions();
  const eventPosition = new MonthCalendarEventPosition();
  const date = new Date(props.month);
  const dateDjs = dayjs(date);
  const startDate = monthlyStartDate({
    date,
    weekStartsOn: props.weekStartsOn,
  });
  const endDate = monthlyEndDate({ date, weekStartsOn: props.weekStartsOn });
  const endDjs = dayjs(endDate);
  const weeks: dayjs.Dayjs[][] = [];
  let currentDate = dayjs(startDate);
  while (currentDate.isBefore(endDjs)) {
    const week = Array.from({ length: 7 }, (_, i) => {
      return currentDate.add(i, 'day');
    });
    weeks.push(week);
    currentDate = currentDate.add(7, 'day');
  }

  const { eventsGroupByWeekId } = useEvents({
    events: props.events,
    weekStartsOn: props.weekStartsOn,
  });

  const [bodyHeight, setBodyHeight] = useState(0);
  const onLayoutBody = useCallback((e: LayoutChangeEvent) => {
    setBodyHeight(e.nativeEvent.layout.height);
  }, []);

  const [monthRowHeight, setMonthRowHeight] = useState(0);
  const onLayoutMonthRow = useCallback((e: LayoutChangeEvent) => {
    setMonthRowHeight(e.nativeEvent.layout.height);
  }, []);

  const [weekdayRowHeight, setWeekdayRowHeight] = useState(0);
  const onLayoutWeekdayRow = useCallback((e: LayoutChangeEvent) => {
    setWeekdayRowHeight(e.nativeEvent.layout.height);
  }, []);

  const weekRowMinHeight = useMemo(() => {
    return (bodyHeight - monthRowHeight - weekdayRowHeight) / weeks.length;
  }, [bodyHeight, monthRowHeight, weekdayRowHeight, weeks.length]);

  const stickyHeaderIndices = useMemo(() => {
    return props.stickyHeaderEnabled ? [0] : [];
  }, [props.stickyHeaderEnabled]);

  return (
    <ScrollView
      style={[
        styles.container,
        {
          width,
          zIndex: props.flatListIndex,
          borderColor: props.cellBorderColor ?? 'lightslategrey',
        },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={!!props.refreshing}
          onRefresh={props.onRefresh}
        />
      }
      onLayout={onLayoutBody}
      stickyHeaderIndices={stickyHeaderIndices}
    >
      <View>
        {props.hiddenMonth ? (
          <View
            style={[
              styles.blankMonthContainer,
              { borderColor: props.cellBorderColor ?? 'lightslategrey' },
            ]}
          />
        ) : (
          <View
            style={[
              styles.monthContainer,
              { borderColor: props.cellBorderColor ?? 'lightslategrey' },
            ]}
            onLayout={onLayoutMonthRow}
          >
            <Text
              style={styles.monthText}
              allowFontScaling={props.allowFontScaling}
            >
              {dateDjs.format(props.monthFormat ?? 'YYYY/MM')}
            </Text>
          </View>
        )}
        <View onLayout={onLayoutWeekdayRow}>
          <MonthCalendarWeekDayRow
            dates={weeks[0] ?? []}
            locale={props.locale}
            weekdayCellContainerStyle={props.weekdayCellContainerStyle}
            weekdayCellTextStyle={props.weekdayCellTextStyle}
            cellBorderColor={props.cellBorderColor}
            allowFontScaling={props.allowFontScaling}
          />
        </View>
      </View>
      <View>
        {weeks.map((week, index) => {
          const firstDayOfWeek = week[0];
          if (firstDayOfWeek === undefined) {
            return null;
          }
          const weekId = firstDayOfWeek.format('YYYY-MM-DD');
          const weekEvents = eventsGroupByWeekId[weekId] || [];
          return (
            <MonthCalendarWeekRow
              key={`row-${index}`}
              dates={week}
              events={weekEvents}
              eventPosition={eventPosition}
              onPressEvent={props.onPressEvent}
              onLongPressEvent={props.onLongPressEvent}
              delayLongPressEvent={props.delayLongPressEvent}
              onPressCell={props.onPressCell}
              onLongPressCell={props.onLongPressCell}
              delayLongPressCell={props.delayLongPressCell}
              dayCellContainerStyle={props.dayCellContainerStyle}
              dayCellTextStyle={props.dayCellTextStyle}
              weekRowMinHeight={weekRowMinHeight}
              todayCellTextStyle={props.todayCellTextStyle}
              cellBorderColor={props.cellBorderColor}
              allowFontScaling={props.allowFontScaling}
              eventHeight={props.eventHeight}
              eventTextStyle={props.eventTextStyle}
            />
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    alignSelf: 'flex-start',
  },
  blankMonthContainer: {
    borderWidth: CELL_BORDER_WIDTH,
  },
  monthContainer: {
    padding: 2,
    borderWidth: CELL_BORDER_WIDTH,
    backgroundColor: 'white',
  },
  monthText: {
    textAlign: 'center',
    fontSize: 14,
  },
});
