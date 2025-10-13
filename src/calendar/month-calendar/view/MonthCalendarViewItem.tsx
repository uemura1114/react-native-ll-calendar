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
import {
  getWeekIds,
  monthlyEndDate,
  monthlyStartDate,
} from '../../../utils/functions';
import { useEvents } from '../logic/useEvents';
import { CELL_BORDER_WIDTH } from '../../../constants/size';
import { RefreshControl } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { MonthCalendarDraggingEvent } from './MonthCalendarDraggingEvent';

export const MonthCalendarViewItem = (props: {
  month: string;
  weekStartsOn: WeekStartsOn;
  events: CalendarEvent[];
  onPressEvent?: (event: CalendarEvent) => void;
  onPressCell?: (date: Date) => void;
  onLongPressCell?: (date: Date) => void;
  delayLongPress?: number;
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
  draggingEvent: CalendarEvent | null;
  setDraggingEvent: (event: CalendarEvent | null) => void;
  cellLayoutsRef: React.RefObject<
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
  >;
  findDateFromPosition: (x: number, y: number) => Date | null;
  scrollOffsetYsRef: React.RefObject<Map<string, number>>;
  findPositionFromDate: (
    date: Date,
    month: string
  ) => {
    x: number;
    y: number;
  } | null;
  weekdayTextHeightsRef: React.RefObject<Map<string, number>>;
  calendarContainerRef: React.RefObject<any>;
  onEventDragStart?: (event: CalendarEvent) => void;
  onEventDrop?: (args: { event: CalendarEvent; newStartDate: Date }) => void;
  layoutKey: number;
  updateLayoutKey: () => void;
}) => {
  const {
    month,
    weekStartsOn,
    events,
    onPressEvent,
    onPressCell,
    onLongPressCell,
    delayLongPress,
    flatListIndex,
    onRefresh,
    refreshing,
    dayCellContainerStyle,
    dayCellTextStyle,
    locale,
    weekdayCellContainerStyle,
    weekdayCellTextStyle,
    todayCellTextStyle,
    hiddenMonth,
    monthFormat = 'YYYY/MM',
    draggingEvent,
    setDraggingEvent,
    cellLayoutsRef,
    findDateFromPosition,
    scrollOffsetYsRef,
    findPositionFromDate,
    weekdayTextHeightsRef,
    calendarContainerRef,
    onEventDragStart,
    onEventDrop,
    layoutKey,
    updateLayoutKey,
  } = props;

  const { width } = useWindowDimensions();
  const eventPosition = new MonthCalendarEventPosition();
  const date = new Date(month);
  const dateDjs = dayjs(date);
  const startDate = monthlyStartDate({ date, weekStartsOn });
  const endDate = monthlyEndDate({ date, weekStartsOn });
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
    events,
    weekStartsOn,
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

  const draggingEventWeekIds: string[] = useMemo(() => {
    if (weekStartsOn === undefined || !draggingEvent) {
      return [];
    }
    return getWeekIds({
      start: draggingEvent.start,
      end: draggingEvent.end,
      weekStartsOn,
    });
  }, [draggingEvent, weekStartsOn]);

  const eventHeight = 26;
  const dateColumnWidth = width / 7;

  return (
    <ScrollView
      scrollEnabled={draggingEvent === null}
      style={[styles.container, { width, zIndex: flatListIndex }]}
      refreshControl={
        <RefreshControl
          refreshing={!!refreshing}
          onRefresh={onRefresh}
          enabled={draggingEvent === null}
        />
      }
      onLayout={onLayoutBody}
      onScroll={(e) => {
        scrollOffsetYsRef.current.set(month, e.nativeEvent.contentOffset.y);
      }}
    >
      {hiddenMonth ? (
        <View style={styles.blankMonthContainer} />
      ) : (
        <View style={styles.monthContainer} onLayout={onLayoutMonthRow}>
          <Text style={styles.monthText}>{dateDjs.format(monthFormat)}</Text>
        </View>
      )}
      <View onLayout={onLayoutWeekdayRow}>
        <MonthCalendarWeekRow
          month={month}
          dates={weeks[0] ?? []}
          isWeekdayHeader={true}
          locale={locale}
          weekdayCellContainerStyle={weekdayCellContainerStyle}
          weekdayCellTextStyle={weekdayCellTextStyle}
        />
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
              month={month}
              dates={week}
              events={weekEvents}
              eventPosition={eventPosition}
              onPressEvent={onPressEvent}
              onPressCell={onPressCell}
              onLongPressCell={onLongPressCell}
              delayLongPress={delayLongPress}
              dayCellContainerStyle={dayCellContainerStyle}
              dayCellTextStyle={dayCellTextStyle}
              weekRowMinHeight={weekRowMinHeight}
              todayCellTextStyle={todayCellTextStyle}
              draggingEvent={draggingEvent}
              setDraggingEvent={setDraggingEvent}
              cellLayoutsRef={cellLayoutsRef}
              findDateFromPosition={findDateFromPosition}
              eventHeight={eventHeight}
              dateColumnWidth={dateColumnWidth}
              weekdayTextHeightsRef={weekdayTextHeightsRef}
              calendarContainerRef={calendarContainerRef}
              onEventDragStart={onEventDragStart}
              onEventDrop={onEventDrop}
              layoutKey={layoutKey}
              updateLayoutKey={updateLayoutKey}
            />
          );
        })}
      </View>
      {weeks.flatMap((week) => {
        const weekId = week[0]?.format('YYYY-MM-DD');
        const isRenderDraggingEventRow =
          !!draggingEvent && !!weekId && draggingEventWeekIds.includes(weekId);

        if (!isRenderDraggingEventRow) {
          return null;
        }

        return week.map((d, index) => {
          const djs = dayjs(d);
          const isRenderDraggingEventCell =
            (isRenderDraggingEventRow &&
              draggingEvent &&
              dayjs(draggingEvent.start).format('YYYY-MM-DD') ===
                djs.format('YYYY-MM-DD')) ||
            (isRenderDraggingEventRow &&
              draggingEvent &&
              index === 0 &&
              dayjs(draggingEvent.start).isBefore(djs));

          if (!isRenderDraggingEventCell) {
            return null;
          }

          return (
            <MonthCalendarDraggingEvent
              key={`${month}-${djs.format('YYYY-MM-DD')}-${draggingEvent.id}`}
              month={month}
              date={d.toDate()}
              event={draggingEvent}
              height={eventHeight}
              dateColumnWidth={dateColumnWidth}
              dateIndex={index}
              findPositionFromDate={findPositionFromDate}
            />
          );
        });
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    borderColor: 'lightslategrey',
    alignSelf: 'flex-start',
  },
  blankMonthContainer: {
    borderWidth: CELL_BORDER_WIDTH,
    borderColor: 'lightslategrey',
  },
  monthContainer: {
    padding: 2,
    borderWidth: CELL_BORDER_WIDTH,
    borderColor: 'lightslategrey',
    backgroundColor: 'white',
  },
  monthText: {
    textAlign: 'center',
  },
});
