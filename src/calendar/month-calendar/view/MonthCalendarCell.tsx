import type { Dayjs } from 'dayjs';
import {
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { TouchableOpacity } from 'react-native';
import type { CalendarEvent, WeekdayNum } from '../../../types/month-calendar';
import dayjs from 'dayjs';
import { CELL_BORDER_WIDTH, EVENT_GAP } from '../../../constants/size';
import { MonthCalendarEvent } from './MonthCalendarEvent';
import { useRef } from 'react';
import { MonthCalendarDraggingEvent } from './MonthCalendarDraggingEvent';

export const MonthCalendarCell = (props: {
  month: string;
  isWeekdayHeader: boolean;
  djs: Dayjs;
  weekRowMinHeight?: number;
  dateIndex: number;
  onPressCell?: (date: Date) => void;
  onLongPressCell?: (date: Date) => void;
  delayLongPress?: number;
  dayCellContainerStyle?: (date: Date) => ViewStyle;
  dayCellTextStyle?: (date: Date) => TextStyle;
  weekdayCellContainerStyle?: (weekDayNum: WeekdayNum) => ViewStyle;
  weekdayCellTextStyle?: (weekDayNum: WeekdayNum) => TextStyle;
  todayCellTextStyle?: TextStyle;
  cellText: string;
  events: (CalendarEvent | number)[];
  eventHeight: number;
  dateColumnWidth: number;
  onPressEvent?: (event: CalendarEvent) => void;
  setIsEventDragging?: (bool: boolean) => void;
  setDraggingEvent?: (event: CalendarEvent | null) => void;
  cellLayoutsRef?: React.RefObject<
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
  findDateFromPosition?: (x: number, y: number) => Date | null;
  draggingEvent?: CalendarEvent | null;
}) => {
  const {
    month,
    isWeekdayHeader,
    djs,
    weekRowMinHeight,
    dateIndex,
    onPressCell,
    onLongPressCell,
    delayLongPress,
    dayCellContainerStyle,
    dayCellTextStyle,
    weekdayCellContainerStyle,
    weekdayCellTextStyle,
    todayCellTextStyle,
    cellText,
    events,
    eventHeight,
    dateColumnWidth,
    onPressEvent,
    setIsEventDragging,
    setDraggingEvent,
    cellLayoutsRef,
    findDateFromPosition,
    draggingEvent,
  } = props;

  const cellRef = useRef<any>(null);

  const isRenderDraggingEvent =
    (draggingEvent &&
      dayjs(draggingEvent.start).format('YYYY-MM-DD') ===
        djs.format('YYYY-MM-DD')) ||
    (draggingEvent &&
      dateIndex === 0 &&
      dayjs(draggingEvent.start).isBefore(djs));

  return (
    <TouchableOpacity
      ref={(ref) => {
        cellRef.current = ref;
      }}
      onLayout={() => {
        const ref = cellRef.current;
        const dateKey = `${month}-${djs.format('YYYY-MM-DD')}`;

        ref?.measureInWindow(
          (pageX: any, pageY: any, width: any, height: any) => {
            cellLayoutsRef?.current.set(dateKey, {
              pageX,
              pageY,
              width,
              height,
              date: djs.toDate(),
            });
          }
        );
      }}
      key={isWeekdayHeader ? djs.get('d') : djs.get('date')}
      style={[
        styles.dayCellCountainer,
        { minHeight: isWeekdayHeader ? undefined : weekRowMinHeight },
        { zIndex: 7 - dateIndex },
      ]}
      onPress={() => {
        onPressCell?.(djs.toDate());
      }}
      onLongPress={() => {
        onLongPressCell?.(djs.toDate());
      }}
      delayLongPress={delayLongPress}
    >
      <View
        style={[
          styles.dayCellInner,
          isWeekdayHeader
            ? weekdayCellContainerStyle?.(djs.day())
            : dayCellContainerStyle?.(djs.toDate()),
        ]}
      />
      <View style={styles.dayCellLabel}>
        <Text
          style={[
            styles.dayCellText,
            isWeekdayHeader
              ? weekdayCellTextStyle?.(djs.day())
              : dayCellTextStyle?.(djs.toDate()),
            !isWeekdayHeader && dayjs(djs).isSame(dayjs(), 'day')
              ? todayCellTextStyle
              : {},
          ]}
        >
          {cellText}
        </Text>
      </View>
      <View style={styles.eventsWrapper}>
        {events.map((event, rowIndex) => {
          if (typeof event === 'number') {
            return (
              <View
                key={event}
                style={{ height: eventHeight, marginBottom: EVENT_GAP }}
              />
            );
          }

          const rawStartDjs = dayjs(event.start);
          const startDjs = dateIndex === 0 ? djs : dayjs(event.start);
          const endDjs = dayjs(event.end);
          const diffDays = endDjs
            .startOf('day')
            .diff(startDjs.startOf('day'), 'day');
          const isPrevDateEvent = dateIndex === 0 && rawStartDjs.isBefore(djs);
          let width =
            (diffDays + 1) * dateColumnWidth -
            EVENT_GAP * 2 -
            CELL_BORDER_WIDTH * 2;

          if (isPrevDateEvent) {
            width += EVENT_GAP + 1;
          }

          const isLast = rowIndex === events.length - 1;

          return (
            <MonthCalendarEvent
              key={event.id}
              event={event}
              width={width}
              height={eventHeight}
              isPrevDateEvent={isPrevDateEvent}
              isLastEvent={isLast}
              onPressEvent={onPressEvent}
              setIsEventDragging={setIsEventDragging}
              setDraggingEvent={setDraggingEvent}
              findDateFromPosition={findDateFromPosition}
            />
          );
        })}
        {isRenderDraggingEvent && (
          <MonthCalendarDraggingEvent
            date={djs.toDate()}
            event={draggingEvent}
            height={eventHeight}
            dateColumnWidth={dateColumnWidth}
            dateIndex={dateIndex}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dayCellCountainer: {
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
  eventsWrapper: {
    position: 'relative',
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
