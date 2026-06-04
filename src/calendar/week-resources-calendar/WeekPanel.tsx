import React, { useMemo, type ReactNode } from 'react';
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import dayjs from 'dayjs';
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
  onPressCell?: (resource: CalendarResource, date: Date) => void;
  onLongPressCell?: (resource: CalendarResource, date: Date) => void;
  delayLongPressCell?: number;
  onPressEvent?: (event: CalendarEvent) => void;
  onLongPressEvent?: (event: CalendarEvent) => void;
  delayLongPressEvent?: number;
  prioritizeCellInteraction?: boolean;
  eventTextStyle?: (event: CalendarEvent) => TextStyle;
  eventEllipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  allowFontScaling?: boolean;
  renderEventOverlay?: (event: CalendarEvent) => ReactNode;
  dateCellContainerStyle?: (date: Date) => ViewStyle;
  cellContainerStyle?: (resource: CalendarResource, date: Date) => ViewStyle;
  renderDateLabel?: (date: Date) => React.JSX.Element;
  renderResourceNameLabel?: (resource: CalendarResource) => React.JSX.Element;
  onRefresh?: () => void;
  refreshing?: boolean;
  bottomSpacing?: number;
  fixedRowCount?: number;
};

type DayCellProps = {
  resource: CalendarResource;
  date: dayjs.Dayjs;
  dateIndex: number;
  columnWidth: number;
  eventHeight: number;
  eventPosition: ResourcesCalendarEventPosition;
  eventsByResourceId: Map<string, CalendarEvent[]>;
  onPressCell?: (resource: CalendarResource, date: Date) => void;
  onLongPressCell?: (resource: CalendarResource, date: Date) => void;
  delayLongPressCell?: number;
  onPressEvent?: (event: CalendarEvent) => void;
  onLongPressEvent?: (event: CalendarEvent) => void;
  delayLongPressEvent?: number;
  prioritizeCellInteraction?: boolean;
  eventTextStyle?: (event: CalendarEvent) => TextStyle;
  eventEllipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  allowFontScaling?: boolean;
  renderEventOverlay?: (event: CalendarEvent) => ReactNode;
  cellContainerStyle?: (resource: CalendarResource, date: Date) => ViewStyle;
};

function DayCell({
  resource,
  date,
  dateIndex,
  columnWidth,
  eventHeight,
  eventPosition,
  eventsByResourceId,
  onPressCell,
  onLongPressCell,
  delayLongPressCell,
  onPressEvent,
  onLongPressEvent,
  delayLongPressEvent,
  prioritizeCellInteraction,
  eventTextStyle,
  eventEllipsizeMode,
  allowFontScaling,
  renderEventOverlay,
  cellContainerStyle,
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

  const showPrioritizedCellOverlay =
    prioritizeCellInteraction === true &&
    (onPressCell != null || onLongPressCell != null);

  const cellWrapperStyle = [
    styles.dayCell,
    { width: columnWidth, zIndex: 7 - dateIndex },
  ];

  const cellInner = (
    <>
      <View
        style={[
          styles.dayCellBackground,
          cellContainerStyle?.(resource, date.toDate()),
        ]}
      />
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
        const diffDays = endDjs
          .startOf('day')
          .diff(startDjs.startOf('day'), 'day');
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

        const eventOverlayNode = renderEventOverlay?.(event);
        const showEventOverlay =
          renderEventOverlay != null &&
          eventOverlayNode != null &&
          eventOverlayNode !== false;

        return (
          <View
            key={event.id}
            pointerEvents={showPrioritizedCellOverlay ? 'none' : 'auto'}
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
                isPrevDateEvent && styles.prevDateEventInner,
              ]}
              activeOpacity={0.8}
              onPress={() => onPressEvent?.(event)}
              onLongPress={() => onLongPressEvent?.(event)}
              delayLongPress={delayLongPressEvent}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode={eventEllipsizeMode ?? 'tail'}
                allowFontScaling={allowFontScaling}
                style={[
                  styles.eventTitle,
                  { color: event.color },
                  eventTextStyle?.(event),
                ]}
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
      })}
    </>
  );

  return showPrioritizedCellOverlay ? (
    <View style={cellWrapperStyle}>
      {cellInner}
      <TouchableOpacity
        accessible={false}
        style={styles.cellInteractionOverlay}
        activeOpacity={1}
        onPress={() => onPressCell?.(resource, date.toDate())}
        onLongPress={() => onLongPressCell?.(resource, date.toDate())}
        delayLongPress={delayLongPressCell}
      />
    </View>
  ) : (
    <TouchableOpacity
      activeOpacity={1}
      style={cellWrapperStyle}
      onPress={() => onPressCell?.(resource, date.toDate())}
      onLongPress={() => onLongPressCell?.(resource, date.toDate())}
      delayLongPress={delayLongPressCell}
    >
      {cellInner}
    </TouchableOpacity>
  );
}

export function WeekPanel({
  weekKey,
  width,
  resources,
  events,
  eventHeight,
  onPressCell,
  onLongPressCell,
  delayLongPressCell,
  onPressEvent,
  onLongPressEvent,
  delayLongPressEvent,
  prioritizeCellInteraction,
  eventTextStyle,
  eventEllipsizeMode,
  allowFontScaling,
  renderEventOverlay,
  dateCellContainerStyle,
  cellContainerStyle,
  renderDateLabel,
  renderResourceNameLabel,
  onRefresh,
  refreshing,
  bottomSpacing,
  fixedRowCount,
}: WeekPanelProps) {
  const columnWidth = width / 8;
  const startDjs = dayjs(weekKey);
  const days = Array.from({ length: 7 }, (_, i) => startDjs.add(i, 'day'));
  const resolvedEventHeight = eventHeight ?? DEFAULT_EVENT_HEIGHT;
  const resolvedFixedRowCount = fixedRowCount ?? 0;

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

  const fixedResources = useMemo(
    () => resources.slice(0, resolvedFixedRowCount),
    [resources, resolvedFixedRowCount]
  );
  const scrollableResources = useMemo(
    () => resources.slice(resolvedFixedRowCount),
    [resources, resolvedFixedRowCount]
  );

  const eventPosition = new ResourcesCalendarEventPosition();

  const renderResourceRow = (
    resource: CalendarResource,
    showTopBorder: boolean
  ) => (
    <View
      key={resource.id}
      style={[styles.resourceRow, showTopBorder && styles.resourceRowFirst]}
    >
      <View style={[styles.resourceNameCell, { width: columnWidth }]}>
        {renderResourceNameLabel ? (
          renderResourceNameLabel(resource)
        ) : (
          <Text
            style={styles.resourceNameText}
            numberOfLines={2}
            allowFontScaling={allowFontScaling}
          >
            {resource.name}
          </Text>
        )}
      </View>
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
          onPressCell={onPressCell}
          onLongPressCell={onLongPressCell}
          delayLongPressCell={delayLongPressCell}
          onPressEvent={onPressEvent}
          onLongPressEvent={onLongPressEvent}
          delayLongPressEvent={delayLongPressEvent}
          prioritizeCellInteraction={prioritizeCellInteraction}
          eventTextStyle={eventTextStyle}
          eventEllipsizeMode={eventEllipsizeMode}
          allowFontScaling={allowFontScaling}
          renderEventOverlay={renderEventOverlay}
          cellContainerStyle={cellContainerStyle}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.panel, { width }]}>
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
            style={[
              styles.headerCell,
              { width: columnWidth },
              dateCellContainerStyle?.(day.toDate()),
            ]}
          >
            {renderDateLabel ? (
              renderDateLabel(day.toDate())
            ) : (
              <>
                <Text style={styles.headerDayOfWeekText}>
                  {day.format('ddd')}
                </Text>
                <Text style={styles.headerDateText}>{day.format('M/D')}</Text>
              </>
            )}
          </View>
        ))}
      </View>

      {fixedResources.map((resource, index) =>
        renderResourceRow(resource, index === 0)
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
          />
        }
      >
        {scrollableResources.map((resource, index) =>
          renderResourceRow(
            resource,
            fixedResources.length === 0 && index === 0
          )
        )}
        <View style={{ height: bottomSpacing }} />
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
    minHeight: 30,
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
    minHeight: 30,
    paddingBottom: EVENT_GAP,
    position: 'relative',
  },
  dayCellBackground: {
    ...StyleSheet.absoluteFillObject,
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
  eventOuter: {
    position: 'relative',
    marginTop: EVENT_GAP,
    marginLeft: EVENT_GAP,
  },
  prevDateEvent: {
    marginLeft: -1,
  },
  prevDateEventInner: {
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
  eventOverlayHost: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none' as const,
  },
});
