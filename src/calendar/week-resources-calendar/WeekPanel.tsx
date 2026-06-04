import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import type {
  CalendarResource,
  CalendarEvent,
} from '../../types/resources-calendar';
import ResourcesCalendarEventPosition from '../../utils/resources-calendar-event-position';
import { EVENT_GAP } from '../../constants/size';

export const CELL_BORDER_WIDTH = 0.5;
export const BORDER_COLOR = 'lightslategrey';
const DEFAULT_EVENT_HEIGHT = 22;

export type WeekPanelProps = {
  weekKey: string;
  width: number;
  resources: CalendarResource[];
  events: CalendarEvent[];
  eventHeight?: number;
};

type DayCellProps = {
  resource: CalendarResource;
  date: dayjs.Dayjs;
  dateIndex: number;
  columnWidth: number;
  eventHeight: number;
  eventPosition: ResourcesCalendarEventPosition;
  eventsByResourceId: Map<string, CalendarEvent[]>;
};

function DayCell({
  resource,
  date,
  dateIndex,
  columnWidth,
  eventHeight,
  eventPosition,
  eventsByResourceId,
}: DayCellProps) {
  const resourceEvents = eventsByResourceId.get(resource.id) ?? [];

  const filteredEvents = resourceEvents
    .filter((event) => {
      const startDjs = dayjs(event.start);
      const endDjs = dayjs(event.end);
      return (
        startDjs.format('YYYY-MM-DD') === date.format('YYYY-MM-DD') ||
        (dateIndex === 0 &&
          startDjs.isBefore(date) &&
          !endDjs.startOf('day').isBefore(date.startOf('day')))
      );
    })
    .sort((a, b) => {
      const aStartDjs = dateIndex === 0 ? date : dayjs(a.start);
      const bStartDjs = dateIndex === 0 ? date : dayjs(b.start);
      const aDiffDays = dayjs(a.end)
        .startOf('day')
        .diff(aStartDjs.startOf('day'), 'day');
      const bDiffDays = dayjs(b.end)
        .startOf('day')
        .diff(bStartDjs.startOf('day'), 'day');
      if (aDiffDays !== bDiffDays) {
        return bDiffDays - aDiffDays;
      }
      return dayjs(a.start).diff(dayjs(b.start));
    });

  const rowNums = eventPosition.getRowNums({
    resourceId: resource.id,
    date: date.toDate(),
  });
  const cellEvents: (CalendarEvent | number)[] = [];
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

  return (
    <View
      style={[styles.dayCell, { width: columnWidth, zIndex: 7 - dateIndex }]}
    >
      <View style={styles.dayCellBackground} />
      {cellEvents.map((event, rowIndex) => {
        if (typeof event === 'number') {
          return (
            <View
              key={`spacer-${rowIndex}`}
              style={{ height: eventHeight, marginBottom: EVENT_GAP }}
            />
          );
        }

        const rawStartDjs = dayjs(event.start);
        const startDjs = dateIndex === 0 ? date : rawStartDjs;
        const endDjs = dayjs(event.end);
        const diffDaysRaw = endDjs
          .startOf('day')
          .diff(startDjs.startOf('day'), 'day');
        // 週の残り日数に収める
        const maxDiff = 6 - dateIndex;
        const diffDays = Math.min(diffDaysRaw, maxDiff);
        const isPrevDateEvent = dateIndex === 0 && rawStartDjs.isBefore(date);

        let width =
          (diffDays + 1) * columnWidth - EVENT_GAP * 2 - CELL_BORDER_WIDTH * 2;
        if (isPrevDateEvent) {
          width += EVENT_GAP + 1;
        }

        eventPosition.push({
          resourceId: resource.id,
          startDate: startDjs.toDate(),
          days: diffDays + 1,
          rowNum: rowIndex + 1,
        });

        return (
          <View
            key={event.id}
            style={[
              styles.eventOuter,
              { width, height: eventHeight },
              isPrevDateEvent && styles.prevDateEvent,
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
              activeOpacity={0.8}
            >
              <Text
                numberOfLines={1}
                style={[styles.eventTitle, { color: event.color }]}
              >
                {event.title}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

export function WeekPanel({
  weekKey,
  width,
  resources,
  events,
  eventHeight,
}: WeekPanelProps) {
  const columnWidth = width / 8;
  const startDjs = dayjs(weekKey);
  const days = Array.from({ length: 7 }, (_, i) => startDjs.add(i, 'day'));
  const resolvedEventHeight = eventHeight ?? DEFAULT_EVENT_HEIGHT;

  const eventsByResourceId = useMemo(() => {
    const deduped = new Map<string, CalendarEvent>();
    for (const event of events) {
      deduped.set(event.id, event);
    }
    const map = new Map<string, CalendarEvent[]>();
    for (const event of deduped.values()) {
      const list = map.get(event.resourceId) ?? [];
      list.push(event);
      map.set(event.resourceId, list);
    }
    return map;
  }, [events]);

  // パネル全体で1インスタンス（resourceIdで区別される）
  const eventPosition = new ResourcesCalendarEventPosition();

  return (
    <View style={[styles.panel, { width }]}>
      {/* ヘッダー行（固定） */}
      <View style={styles.headerRow}>
        <View
          style={[
            styles.headerCell,
            styles.resourceNameHeaderCell,
            { width: columnWidth },
          ]}
        />
        {days.map((day) => (
          <View
            key={day.format('YYYY-MM-DD')}
            style={[styles.headerCell, { width: columnWidth }]}
          >
            <Text style={styles.headerDayOfWeekText}>{day.format('ddd')}</Text>
            <Text style={styles.headerDateText}>{day.format('M/D')}</Text>
          </View>
        ))}
      </View>

      {/* リソース行（縦スクロール） */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {resources.map((resource, index) => (
          <View
            key={resource.id}
            style={[styles.resourceRow, index === 0 && styles.resourceRowFirst]}
          >
            {/* リソース名セル */}
            <View style={[styles.resourceNameCell, { width: columnWidth }]}>
              <Text style={styles.resourceNameText} numberOfLines={2}>
                {resource.name}
              </Text>
            </View>
            {/* 日付セル */}
            {days.map((day, dateIndex) => (
              <DayCell
                key={day.format('YYYY-MM-DD')}
                resource={resource}
                date={day}
                dateIndex={dateIndex}
                columnWidth={columnWidth}
                eventHeight={resolvedEventHeight}
                eventPosition={eventPosition}
                eventsByResourceId={eventsByResourceId}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderBottomColor: BORDER_COLOR,
  },
  headerCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: BORDER_COLOR,
  },
  resourceNameHeaderCell: {
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: BORDER_COLOR,
  },
  headerDayOfWeekText: {
    fontSize: 11,
    color: '#666',
  },
  headerDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
  },
  resourceRow: {
    flexDirection: 'row',
    minHeight: 48,
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderBottomColor: BORDER_COLOR,
    backgroundColor: 'white',
  },
  resourceRowFirst: {
    borderTopWidth: CELL_BORDER_WIDTH,
    borderTopColor: BORDER_COLOR,
  },
  resourceNameCell: {
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: BORDER_COLOR,
    backgroundColor: '#fafafa',
  },
  resourceNameText: {
    fontSize: 11,
    color: '#333',
  },
  dayCell: {
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: BORDER_COLOR,
    minHeight: 48,
    paddingBottom: EVENT_GAP,
    position: 'relative',
  },
  dayCellBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  eventOuter: {
    position: 'relative',
    marginTop: EVENT_GAP,
    marginLeft: EVENT_GAP,
  },
  prevDateEvent: {
    marginLeft: -1,
    borderTopStartRadius: 0,
    borderBottomStartRadius: 0,
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
    ...Platform.select({
      android: { elevation: 2 },
      default: {},
    }),
  },
  eventTitle: {
    fontSize: 11,
  },
});
