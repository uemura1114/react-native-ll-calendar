import dayjs from 'dayjs';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Text, TouchableOpacity, View, type ViewStyle } from 'react-native';
import type { CalendarEvent, WeekdayNum } from '../../../types/month-calendar';
import type MonthCalendarEventPosition from '../../../utils/month-calendar-event-position';
import { CELL_BORDER_WIDTH, EVENT_GAP } from '../../../constants/size';
import type { TextStyle } from 'react-native';

export const MonthCalendarWeekRow = (props: {
  dates: dayjs.Dayjs[];
  events: CalendarEvent[];
  eventPosition?: MonthCalendarEventPosition;
  onPressEvent?: (event: CalendarEvent) => void;
  onLongPressEvent?: (event: CalendarEvent) => void;
  delayLongPressEvent?: number;
  onPressCell?: (date: Date) => void;
  onLongPressCell?: (date: Date) => void;
  delayLongPressCell?: number;
  dayCellContainerStyle?: (date: Date) => ViewStyle;
  dayCellTextStyle?: (date: Date) => TextStyle;
  weekdayCellContainerStyle?: (weekDayNum: WeekdayNum) => ViewStyle;
  weekdayCellTextStyle?: (weekDayNum: WeekdayNum) => TextStyle;
  weekRowMinHeight?: number;
  todayCellTextStyle?: TextStyle;
}) => {
  const eventHeight = 26;
  const { width: screenWidth } = useWindowDimensions();
  const dateColumnWidth = screenWidth / 7;
  const weekId = props.dates[0]?.format('YYYY-MM-DD');
  if (weekId && props.eventPosition) {
    props.eventPosition.resetResource(weekId);
  }

  return (
    <View style={styles.container}>
      {props.dates.map((djs, dateIndex) => {
        const text = djs.format('D');
        const filteredEvents = props.events
          ?.filter((event) => {
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

        const events: (CalendarEvent | number)[] = [];
        if (weekId && props.eventPosition) {
          const rowNums = props.eventPosition.getRowNums({
            weekId,
            date: djs.toDate(),
          });
          const rowsLength = rowNums.length + filteredEvents.length;
          let eventIndex = 0;
          for (let ii = 1; ii <= rowsLength; ii++) {
            if (rowNums.includes(ii)) {
              events.push(ii);
            } else {
              const event = filteredEvents[eventIndex];
              if (event) {
                events.push(event);
              }
              eventIndex++;
            }
          }
        }
        return (
          <TouchableOpacity
            key={djs.get('date')}
            style={[
              styles.dayCellCountainer,
              { minHeight: props.weekRowMinHeight },
              { zIndex: 7 - dateIndex },
            ]}
            onPress={() => {
              props.onPressCell?.(djs.toDate());
            }}
            onLongPress={() => {
              props.onLongPressCell?.(djs.toDate());
            }}
            delayLongPress={props.delayLongPressCell}
          >
            <View
              style={[
                styles.dayCellInner,
                props.dayCellContainerStyle?.(djs.toDate()),
              ]}
            />
            <View style={styles.dayCellLabel}>
              <Text
                style={[
                  styles.dayCellText,
                  props.dayCellTextStyle?.(djs.toDate()),
                  dayjs(djs).isSame(dayjs(), 'day')
                    ? props.todayCellTextStyle
                    : {},
                ]}
              >
                {text}
              </Text>
            </View>
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
              const isPrevDateEvent =
                dateIndex === 0 && rawStartDjs.isBefore(djs);
              let width =
                (diffDays + 1) * dateColumnWidth -
                EVENT_GAP * 2 -
                CELL_BORDER_WIDTH * 2;

              if (isPrevDateEvent) {
                width += EVENT_GAP + 1;
              }

              const isLastRow = rowIndex === events.length - 1;

              if (props.eventPosition && weekId) {
                props.eventPosition.push({
                  weekId,
                  startDate: startDjs.toDate(),
                  days: diffDays + 1,
                  rowNum: rowIndex + 1,
                });
              }

              return (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.event,
                    {
                      backgroundColor: event.backgroundColor,
                      borderColor: event.borderColor,
                      width: width,
                      height: eventHeight,
                      ...(event.borderStyle !== undefined && {
                        borderStyle: event.borderStyle,
                      }),
                      ...(event.borderWidth !== undefined && {
                        borderWidth: event.borderWidth,
                      }),
                      ...(event.borderRadius !== undefined && {
                        borderRadius: event.borderRadius,
                      }),
                    },
                    isPrevDateEvent ? styles.prevDateEvent : {},
                    isLastRow ? styles.lastRowEvent : {},
                  ]}
                  onPress={() => {
                    props.onPressEvent?.(event);
                  }}
                  onLongPress={() => {
                    props.onLongPressEvent?.(event);
                  }}
                  delayLongPress={props.delayLongPressEvent}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[styles.eventTitle, { color: event.color }]}
                  >
                    {event.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </TouchableOpacity>
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
  dayCellLabel: {
    paddingVertical: 1,
    paddingHorizontal: 2,
  },
  dayCellText: {
    textAlign: 'center',
    fontSize: 12,
  },
  event: {
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.1)',
    marginTop: EVENT_GAP,
    marginLeft: EVENT_GAP,
  },
  prevDateEvent: {
    marginLeft: -1,
    borderTopStartRadius: 0,
    borderBottomStartRadius: 0,
  },
  lastRowEvent: {
    marginBottom: EVENT_GAP,
  },
  eventTitle: {
    fontSize: 10,
  },
});
