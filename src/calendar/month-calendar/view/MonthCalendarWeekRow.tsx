import dayjs from 'dayjs';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import type { CalendarEvent } from '../../../types/month-calendar';
import type MonthCalendarEventPosition from '../../../utils/month-calendar-event-position';
import { CELL_BORDER_WIDTH, EVENT_GAP } from '../../../constants/size';

export const MonthCalendarWeekRow = (props: {
  dates: dayjs.Dayjs[];
  isWeekdayHeader?: boolean;
  events?: CalendarEvent[];
  eventPosition?: MonthCalendarEventPosition;
  onPressEvent?: (event: CalendarEvent) => void;
  onPressCell?: (date: Date) => void;
}) => {
  const {
    dates,
    isWeekdayHeader,
    events = [],
    eventPosition,
    onPressEvent,
    onPressCell,
  } = props;
  const eventHeight = 26;
  const { width: screenWidth } = useWindowDimensions();
  const dateColumnWidth = screenWidth / 7;
  const weekId = dates[0]?.format('YYYY-MM-DD');
  if (weekId && eventPosition) {
    eventPosition.resetResource(weekId);
  }

  return (
    <View style={styles.container}>
      {dates.map((djs, dateIndex) => {
        const text = isWeekdayHeader ? djs.format('ddd') : djs.format('D');
        const filteredEvents = events
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
        return (
          <TouchableOpacity
            key={isWeekdayHeader ? djs.get('d') : djs.get('date')}
            style={[
              styles.dayCellCountainer,
              isWeekdayHeader ? { minHeight: undefined } : {},
              { zIndex: 7 - dateIndex },
            ]}
            onPress={() => {
              onPressCell?.(djs.toDate());
            }}
          >
            <View style={styles.dayCellLabel}>
              <Text style={styles.dayCellText}>{text}</Text>
            </View>
            {rows.map((eventRow, rowIndex) => {
              if (typeof eventRow === 'number') {
                return (
                  <View
                    key={eventRow}
                    style={{ height: eventHeight, marginBottom: EVENT_GAP }}
                  />
                );
              }

              const rawStartDjs = dayjs(eventRow.start);
              const startDjs = dateIndex === 0 ? djs : dayjs(eventRow.start);
              const endDjs = dayjs(eventRow.end);
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

              const isLastRow = rowIndex === rows.length - 1;

              if (eventPosition && weekId) {
                eventPosition.push({
                  weekId,
                  startDate: startDjs.toDate(),
                  days: diffDays + 1,
                  rowNum: rowIndex + 1,
                });
              }

              return (
                <TouchableOpacity
                  key={eventRow.id}
                  style={[
                    styles.event,
                    {
                      backgroundColor: eventRow.backgroundColor,
                      borderColor: eventRow.borderColor,
                      width: width,
                      height: eventHeight,
                    },
                    isPrevDateEvent ? styles.prevDateEvent : {},
                    isLastRow ? styles.lastRowEvent : {},
                  ]}
                  onPress={() => {
                    onPressEvent?.(eventRow);
                  }}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[styles.eventTitle, { color: eventRow.color }]}
                  >
                    {eventRow.title}
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
    minHeight: 80,
    flex: 1,
    borderRightWidth: CELL_BORDER_WIDTH,
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderColor: 'lightslategrey',
    backgroundColor: 'white',
    paddingBottom: 2,
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
