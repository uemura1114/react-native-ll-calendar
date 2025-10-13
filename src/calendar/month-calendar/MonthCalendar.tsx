import {
  useWindowDimensions,
  FlatList,
  type ViewStyle,
  type TextStyle,
  View,
  StyleSheet,
} from 'react-native';
import dayjs from 'dayjs';
import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  CalendarEvent,
  WeekdayNum,
  WeekStartsOn,
} from '../../types/month-calendar';
import { MonthCalendarViewItem } from './view/MonthCalendarViewItem';
import { Platform } from 'react-native';

const HALF_PANEL_LENGTH = 120; // 10 years

export const MonthCalendar = (props: {
  defaultDate: Date;
  weekStartsOn?: WeekStartsOn;
  onChangeDate?: (date: Date) => void;
  events: CalendarEvent[];
  onPressEvent?: (event: CalendarEvent) => void;
  onPressCell?: (date: Date) => void;
  onLongPressCell?: (date: Date) => void;
  delayLongPress?: number;
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
  onEventDragStart?: (event: CalendarEvent) => void;
  onEventDrop?: (args: { event: CalendarEvent; newStartDate: Date }) => void;
}) => {
  const {
    defaultDate,
    weekStartsOn = 0,
    onChangeDate,
    events,
    onPressEvent,
    onPressCell,
    onLongPressCell,
    delayLongPress,
    onRefresh,
    refreshing,
    dayCellContainerStyle,
    dayCellTextStyle,
    locale,
    weekdayCellContainerStyle,
    weekdayCellTextStyle,
    todayCellTextStyle,
    hiddenMonth,
    monthFormat,
    onEventDragStart,
    onEventDrop,
  } = props;
  const [dateState] = useState(defaultDate);
  const activeIndex = useRef(HALF_PANEL_LENGTH);

  const [draggingEvent, setDraggingEvent] = useState<CalendarEvent | null>(
    null
  );
  const [layoutKey, setLayoutKey] = useState(0);
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
  const panels: string[] = useMemo(() => {
    return [
      ...prevPanels,
      startOfDefaultDateDjs.format('YYYY-MM'),
      ...nextPanels,
    ];
  }, [nextPanels, prevPanels, startOfDefaultDateDjs]);

  const { width } = useWindowDimensions();

  const scrollOffsetXRef = useRef(0);
  const scrollOffsetYsRef = useRef<Map<string, number>>(new Map());
  const cellLayoutsRef = useRef<
    Map<
      string,
      {
        pageX: number;
        pageY: number;
        width: number;
        height: number;
        date: Date;
      }
    >
  >(new Map());

  const calendarContainerRef = useRef<any>(null);
  const calendarContainerYRef = useRef(0);
  const weekdayTextHeightsRef = useRef<Map<string, number>>(new Map());

  const findDateFromPosition = useCallback(
    (x: number, y: number): Date | null => {
      const activePanel = panels[activeIndex.current];
      const scrollOffsetY = activePanel
        ? (scrollOffsetYsRef.current.get(activePanel) ?? 0)
        : 0;
      for (const [_, layout] of cellLayoutsRef.current.entries()) {
        if (
          x >= layout.pageX - scrollOffsetXRef.current &&
          x <= layout.pageX - scrollOffsetXRef.current + layout.width &&
          y >=
            layout.pageY -
              scrollOffsetY +
              (Platform.OS === 'android' ? calendarContainerYRef.current : 0) &&
          y <=
            layout.pageY +
              layout.height -
              scrollOffsetY +
              (Platform.OS === 'android' ? calendarContainerYRef.current : 0)
        ) {
          return layout.date;
        }
      }
      return null;
    },
    [panels]
  );

  const findPositionFromDate = useCallback(
    (date: Date, month: string): { x: number; y: number } | null => {
      const key = `${month}-${dayjs(date).format('YYYY-MM-DD')}`;
      const weekdayHeight = weekdayTextHeightsRef.current.get(key) ?? 0;
      const layout = cellLayoutsRef.current.get(key);
      if (layout) {
        return {
          x: layout.pageX - scrollOffsetXRef.current,
          y: layout.pageY + weekdayHeight,
        };
      } else {
        return null;
      }
    },
    []
  );

  const updateLayoutKey = useCallback(() => {
    setLayoutKey(layoutKey + 1);
  }, [layoutKey]);

  return (
    <View
      style={styles.container}
      ref={calendarContainerRef}
      onLayout={() => {
        calendarContainerRef.current?.measureInWindow(
          (_pageX: number, pageY: number) => {
            calendarContainerYRef.current = pageY;
          }
        );
      }}
    >
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
            onChangeDate?.(newDate);
          }
          activeIndex.current = newIndex;
        }}
        initialScrollIndex={HALF_PANEL_LENGTH}
        decelerationRate={'fast'}
        data={panels}
        renderItem={({ item, index }) => {
          return (
            <MonthCalendarViewItem
              month={item}
              weekStartsOn={weekStartsOn}
              events={events}
              onPressEvent={onPressEvent}
              onPressCell={onPressCell}
              onLongPressCell={onLongPressCell}
              delayLongPress={delayLongPress}
              flatListIndex={index}
              onRefresh={onRefresh}
              refreshing={refreshing}
              dayCellContainerStyle={dayCellContainerStyle}
              dayCellTextStyle={dayCellTextStyle}
              locale={locale}
              weekdayCellContainerStyle={weekdayCellContainerStyle}
              weekdayCellTextStyle={weekdayCellTextStyle}
              todayCellTextStyle={todayCellTextStyle}
              hiddenMonth={hiddenMonth}
              monthFormat={monthFormat}
              draggingEvent={draggingEvent}
              setDraggingEvent={setDraggingEvent}
              cellLayoutsRef={cellLayoutsRef}
              findDateFromPosition={findDateFromPosition}
              scrollOffsetYsRef={scrollOffsetYsRef}
              findPositionFromDate={findPositionFromDate}
              weekdayTextHeightsRef={weekdayTextHeightsRef}
              calendarContainerRef={calendarContainerRef}
              onEventDragStart={onEventDragStart}
              onEventDrop={onEventDrop}
              layoutKey={layoutKey}
              updateLayoutKey={updateLayoutKey}
            />
          );
        }}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={draggingEvent === null}
        windowSize={5}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        removeClippedSubviews={false}
        onScroll={(e) => {
          scrollOffsetXRef.current = e.nativeEvent.contentOffset.x;
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});
