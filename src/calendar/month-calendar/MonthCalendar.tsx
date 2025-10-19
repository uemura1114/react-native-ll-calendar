import {
  useWindowDimensions,
  FlatList,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import dayjs from 'dayjs';
import { useState } from 'react';
import type {
  CalendarEvent,
  WeekdayNum,
  WeekStartsOn,
} from '../../types/month-calendar';
import { MonthCalendarViewItem } from './view/MonthCalendarViewItem';

const HALF_PANEL_LENGTH = 120; // 10 years

export const MonthCalendar = (props: {
  defaultDate: Date;
  weekStartsOn?: WeekStartsOn;
  onChangeDate?: (date: Date) => void;
  events: CalendarEvent[];
  onPressEvent?: (event: CalendarEvent) => void;
  onLongPressEvent?: (event: CalendarEvent) => void;
  delayLongPressEvent?: number;
  onPressCell?: (date: Date) => void;
  onLongPressCell?: (date: Date) => void;
  delayLongPressCell?: number;
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
}) => {
  const [dateState] = useState(props.defaultDate);
  const [_activeIndex, setActiveIndex] = useState(HALF_PANEL_LENGTH);
  const defaultDateDjs = dayjs(dateState);
  const startOfDefaultDateDjs = defaultDateDjs.startOf('month');
  const prevPanels: string[] = Array.from(
    { length: HALF_PANEL_LENGTH },
    (_, i) => {
      return startOfDefaultDateDjs
        .subtract(HALF_PANEL_LENGTH - i, 'month')
        .format('YYYY-MM');
    }
  );
  const nextPanels: string[] = Array.from(
    { length: HALF_PANEL_LENGTH },
    (_, i) => {
      return startOfDefaultDateDjs.add(i + 1, 'month').format('YYYY-MM');
    }
  );
  const panels: string[] = [
    ...prevPanels,
    startOfDefaultDateDjs.format('YYYY-MM'),
    ...nextPanels,
  ];

  const { width } = useWindowDimensions();

  return (
    <FlatList
      horizontal
      pagingEnabled={true}
      getItemLayout={(_data, index) => {
        return {
          length: width,
          offset: width * index,
          index,
        };
      }}
      onMomentumScrollEnd={(e) => {
        const scrollX = e.nativeEvent.contentOffset.x;
        const newIndex = Math.round(scrollX / width);
        const month = panels[newIndex];
        if (month) {
          const newDate = new Date(month);
          props.onChangeDate?.(newDate);
        }
        setActiveIndex(newIndex);
      }}
      initialScrollIndex={HALF_PANEL_LENGTH}
      decelerationRate={'fast'}
      data={panels}
      renderItem={({ item, index }) => {
        return (
          <MonthCalendarViewItem
            month={item}
            weekStartsOn={props.weekStartsOn ?? 0}
            events={props.events}
            onPressEvent={props.onPressEvent}
            onLongPressEvent={props.onLongPressEvent}
            delayLongPressEvent={props.delayLongPressEvent}
            onPressCell={props.onPressCell}
            onLongPressCell={props.onLongPressCell}
            delayLongPressCell={props.delayLongPressCell}
            flatListIndex={index}
            onRefresh={props.onRefresh}
            refreshing={props.refreshing}
            dayCellContainerStyle={props.dayCellContainerStyle}
            dayCellTextStyle={props.dayCellTextStyle}
            locale={props.locale}
            weekdayCellContainerStyle={props.weekdayCellContainerStyle}
            weekdayCellTextStyle={props.weekdayCellTextStyle}
            todayCellTextStyle={props.todayCellTextStyle}
            hiddenMonth={props.hiddenMonth}
            monthFormat={props.monthFormat}
          />
        );
      }}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={true}
      windowSize={5}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      removeClippedSubviews={false}
    />
  );
};
