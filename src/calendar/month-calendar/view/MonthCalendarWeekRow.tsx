import dayjs from 'dayjs';
import en from 'dayjs/locale/en';
import { StyleSheet } from 'react-native';
import { View, type ViewStyle } from 'react-native';
import type { CalendarEvent, WeekdayNum } from '../../../types/month-calendar';
import type MonthCalendarEventPosition from '../../../utils/month-calendar-event-position';
import { CELL_BORDER_WIDTH } from '../../../constants/size';
import type { TextStyle } from 'react-native';
import { MonthCalendarCell } from './MonthCalendarCell';

export const MonthCalendarWeekRow = (props: {
  month: string;
  dates: dayjs.Dayjs[];
  isWeekdayHeader?: boolean;
  events?: CalendarEvent[];
  eventPosition?: MonthCalendarEventPosition;
  onPressEvent?: (event: CalendarEvent) => void;
  onPressCell?: (date: Date) => void;
  onLongPressCell?: (date: Date) => void;
  delayLongPress?: number;
  dayCellContainerStyle?: (date: Date) => ViewStyle;
  dayCellTextStyle?: (date: Date) => TextStyle;
  locale?: ILocale;
  weekdayCellContainerStyle?: (weekDayNum: WeekdayNum) => ViewStyle;
  weekdayCellTextStyle?: (weekDayNum: WeekdayNum) => TextStyle;
  weekRowMinHeight?: number;
  todayCellTextStyle?: TextStyle;
  setIsEventDragging?: (bool: boolean) => void;
  draggingEvent?: CalendarEvent | null;
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
  eventHeight?: number;
  dateColumnWidth?: number;
  weekdayTextHeightsRef?: React.RefObject<Map<string, number>>;
  calendarContainerRef?: React.RefObject<any>;
  onEventDragStart?: (event: CalendarEvent) => void;
  onEventDrop?: (args: { event: CalendarEvent; newStartDate: Date }) => void;
}) => {
  const {
    month,
    dates,
    isWeekdayHeader = false,
    events = [],
    eventPosition,
    onPressEvent,
    onPressCell,
    onLongPressCell,
    delayLongPress = 500,
    dayCellContainerStyle,
    dayCellTextStyle,
    locale = en,
    weekdayCellContainerStyle,
    weekdayCellTextStyle,
    weekRowMinHeight,
    todayCellTextStyle,
    setIsEventDragging,
    draggingEvent,
    setDraggingEvent,
    cellLayoutsRef,
    findDateFromPosition,
    eventHeight = 0,
    dateColumnWidth = 0,
    weekdayTextHeightsRef,
    calendarContainerRef,
    onEventDragStart,
    onEventDrop,
  } = props;

  const weekId = dates[0]?.format('YYYY-MM-DD');
  if (weekId && eventPosition) {
    eventPosition.resetResource(weekId);
  }

  return (
    <View style={styles.container}>
      {dates.map((djs, dateIndex) => {
        const text = isWeekdayHeader
          ? djs.locale(locale).format('ddd')
          : djs.format('D');
        const filteredEvents = isWeekdayHeader
          ? []
          : events
              .filter((event) => {
                const startDjs = dayjs(event.start);
                return (
                  startDjs.format('YYYY-MM-DD') === djs.format('YYYY-MM-DD') ||
                  (dateIndex === 0 && startDjs.isBefore(djs))
                );
              })
              .sort((a, b) => {
                const aStartDjs = dateIndex === 0 ? djs : dayjs(a.start);
                const bStartDjs = dateIndex === 0 ? djs : dayjs(b.start);
                const aEndDjs = dayjs(a.end);
                const bEndDjs = dayjs(b.end);
                const aDiffDays = aEndDjs.diff(aStartDjs, 'day');
                const bDiffDays = bEndDjs.diff(bStartDjs, 'day');

                return bDiffDays - aDiffDays;
              });

        const rows: (CalendarEvent | number)[] = [];
        if (weekId && eventPosition) {
          const rowNums = eventPosition.getRowNums({
            weekId,
            date: djs.toDate(),
          });
          const rowsLength = rowNums.length + filteredEvents.length;
          let eventIndex = 0;
          for (let ii = 1; ii <= rowsLength; ii++) {
            if (rowNums.includes(ii)) {
              rows.push(ii);
            } else {
              const event = filteredEvents[eventIndex];
              if (event) {
                rows.push(event);
              }
              eventIndex++;
            }
          }
        }

        rows.forEach((row, rowIndex) => {
          if (typeof row === 'number') {
            return;
          }

          if (eventPosition && weekId) {
            const startDjs = dateIndex === 0 ? djs : dayjs(row.start);
            const endDjs = dayjs(row.end);
            const diffDays = endDjs
              .startOf('day')
              .diff(startDjs.startOf('day'), 'day');

            eventPosition.push({
              weekId,
              startDate: startDjs.toDate(),
              days: diffDays + 1,
              rowNum: rowIndex + 1,
            });
          }
        });

        return (
          <MonthCalendarCell
            month={month}
            key={`${month}-${djs.format('YYYY-MM-DD')}`}
            isWeekdayHeader={isWeekdayHeader}
            djs={djs}
            weekRowMinHeight={weekRowMinHeight}
            dateIndex={dateIndex}
            onPressCell={onPressCell}
            onLongPressCell={onLongPressCell}
            delayLongPress={delayLongPress}
            dayCellContainerStyle={dayCellContainerStyle}
            dayCellTextStyle={dayCellTextStyle}
            weekdayCellContainerStyle={weekdayCellContainerStyle}
            weekdayCellTextStyle={weekdayCellTextStyle}
            todayCellTextStyle={todayCellTextStyle}
            cellText={text}
            events={rows}
            eventHeight={eventHeight}
            dateColumnWidth={dateColumnWidth}
            onPressEvent={onPressEvent}
            draggingEvent={draggingEvent}
            setIsEventDragging={setIsEventDragging}
            setDraggingEvent={setDraggingEvent}
            cellLayoutsRef={cellLayoutsRef}
            findDateFromPosition={findDateFromPosition}
            weekdayTextHeightsRef={weekdayTextHeightsRef}
            calendarContainerRef={calendarContainerRef}
            onEventDragStart={onEventDragStart}
            onEventDrop={onEventDrop}
          />
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
