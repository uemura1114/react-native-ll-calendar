import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import {
  Platform,
  StyleSheet,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
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
  cellBorderColor?: string;
  allowFontScaling?: boolean;
  eventHeight?: number;
  eventTextStyle?: (event: CalendarEvent) => TextStyle;
  eventEllipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  renderEventOverlay?: (event: CalendarEvent) => ReactNode;
  onLayout?: (event: LayoutChangeEvent) => void;
  prioritizeCellInteraction?: boolean;
}) => {
  const eventHeight = props.eventHeight || 26;
  const { width: screenWidth } = useWindowDimensions();
  const dateColumnWidth = screenWidth / 7;
  const weekId = props.dates[0]?.format('YYYY-MM-DD');
  if (weekId && props.eventPosition) {
    props.eventPosition.resetResource(weekId);
  }

  return (
    <View style={styles.container} onLayout={props.onLayout}>
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
            const aDiffDays = aEndDjs
              .startOf('day')
              .diff(aStartDjs.startOf('day'), 'day');
            const bDiffDays = bEndDjs
              .startOf('day')
              .diff(bStartDjs.startOf('day'), 'day');

            if (aDiffDays !== bDiffDays) {
              return bDiffDays - aDiffDays;
            }

            return dayjs(a.start).diff(dayjs(b.start));
          });

        const cellEvents: (CalendarEvent | number)[] = [];
        if (weekId && props.eventPosition) {
          const rowNums = props.eventPosition.getRowNums({
            weekId,
            date: djs.toDate(),
          });
          const rowsLength = rowNums.length + filteredEvents.length;
          let eventIndex = 0;
          for (let ii = 1; ii <= rowsLength; ii++) {
            if (rowNums.includes(ii)) {
              cellEvents.push(ii);
            } else {
              const event = filteredEvents[eventIndex];
              if (event) {
                cellEvents.push(event);
              }
              eventIndex++;
            }
          }
        }

        const showPrioritizedCellOverlay =
          props.prioritizeCellInteraction === true &&
          (props.onPressCell != null || props.onLongPressCell != null);

        const cellWrapperStyle = [
          styles.dayCellCountainer,
          { minHeight: props.weekRowMinHeight },
          { zIndex: 7 - dateIndex },
          { borderColor: props.cellBorderColor ?? 'lightslategrey' },
        ];

        const eventRows = cellEvents.map((event, rowIndex) => {
          if (typeof event === 'number') {
            return (
              <View
                key={`spacer-${rowIndex}`}
                style={{ height: eventHeight, marginBottom: EVENT_GAP }}
              />
            );
          }

          const rawStartDjs = dayjs(event.start);
          const startDjs = dateIndex === 0 ? djs : dayjs(event.start);
          const endDjs = dayjs(event.end);
          const isEndOnDayBoundary =
            endDjs.hour() === 0 &&
            endDjs.minute() === 0 &&
            endDjs.second() === 0 &&
            endDjs.millisecond() === 0;
          const diffDays = Math.max(
            0,
            endDjs.startOf('day').diff(startDjs.startOf('day'), 'day') -
              (isEndOnDayBoundary ? 1 : 0)
          );

          const isPrevDateEvent = dateIndex === 0 && rawStartDjs.isBefore(djs);
          let width =
            (diffDays + 1) * dateColumnWidth -
            EVENT_GAP * 2 -
            CELL_BORDER_WIDTH * 2;

          if (isPrevDateEvent) {
            width += EVENT_GAP + 1;
          }

          const isLastRow = rowIndex === cellEvents.length - 1;

          if (props.eventPosition && weekId) {
            props.eventPosition.push({
              weekId,
              startDate: startDjs.toDate(),
              days: diffDays + 1,
              rowNum: rowIndex + 1,
            });
          }

          const eventOverlayNode = props.renderEventOverlay?.(event);
          const showEventOverlay =
            props.renderEventOverlay != null &&
            eventOverlayNode != null &&
            eventOverlayNode !== false;

          return (
            <View
              key={event.id}
              pointerEvents={showPrioritizedCellOverlay ? 'none' : 'auto'}
              style={[
                styles.eventOuter,
                {
                  width,
                  height: eventHeight,
                },
                isPrevDateEvent ? styles.prevDateEvent : {},
                isLastRow ? styles.lastRowEvent : {},
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.event,
                  {
                    backgroundColor: event.backgroundColor,
                    borderColor: event.borderColor,
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
                  ellipsizeMode={props.eventEllipsizeMode ?? 'tail'}
                  style={[
                    styles.eventTitle,
                    { color: event.color },
                    props.eventTextStyle?.(event),
                  ]}
                  allowFontScaling={props.allowFontScaling}
                >
                  {event.title}
                </Text>
              </TouchableOpacity>
              {showEventOverlay ? (
                <View style={styles.eventOverlayHost} pointerEvents="box-none">
                  {eventOverlayNode}
                </View>
              ) : null}
            </View>
          );
        });

        const cellInner = (
          <>
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
                allowFontScaling={props.allowFontScaling}
              >
                {text}
              </Text>
            </View>
            {eventRows}
          </>
        );

        return showPrioritizedCellOverlay ? (
          <View key={djs.valueOf()} style={cellWrapperStyle}>
            {cellInner}
            <TouchableOpacity
              accessible={false}
              style={styles.cellInteractionOverlay}
              activeOpacity={1}
              onPress={() => {
                props.onPressCell?.(djs.toDate());
              }}
              onLongPress={() => {
                props.onLongPressCell?.(djs.toDate());
              }}
              delayLongPress={props.delayLongPressCell}
            />
          </View>
        ) : (
          <TouchableOpacity
            key={djs.valueOf()}
            style={cellWrapperStyle}
            onPress={() => {
              props.onPressCell?.(djs.toDate());
            }}
            onLongPress={() => {
              props.onLongPressCell?.(djs.toDate());
            }}
            delayLongPress={props.delayLongPressCell}
          >
            {cellInner}
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
    fontSize: 14,
  },
  eventOuter: {
    position: 'relative',
    marginTop: EVENT_GAP,
    marginLeft: EVENT_GAP,
  },
  event: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.1)',
  },
  eventOverlayHost: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
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
    fontSize: 12,
  },
  cellInteractionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: 'transparent',
    ...Platform.select({
      android: { elevation: 12 },
      default: {},
    }),
  },
});
