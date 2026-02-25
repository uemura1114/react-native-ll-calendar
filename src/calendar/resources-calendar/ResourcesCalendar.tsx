import React, { useCallback, useMemo, useRef, useState } from 'react';
import type {
  CalendarEvent,
  CalendarResource,
} from '../../types/resources-calendar';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type TextStyle,
  type ViewStyle,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { View } from 'react-native';
import { generateDates, groupDatesByMonth } from '../../utils/functions';
import dayjs from 'dayjs';
import ResourcesCalendarEventPosition from '../../utils/resources-calendar-event-position';
import { EVENT_GAP } from '../../constants/size';

type ResourcesCalendarProps = {
  fromDate: Date;
  toDate: Date;
  resources: CalendarResource[];
  events: CalendarEvent[];
  renderDateLabel?: (date: Date) => React.JSX.Element;
  renderMonthLabel?: (year: number, month: number) => React.JSX.Element;
  renderResourceNameLabel?: (resource: CalendarResource) => React.JSX.Element;
  resourceColumnWidth?: number;
  dateColumnWidth?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  fixedRowCount?: number;
  onPressCell?: (resource: CalendarResource, date: Date) => void;
  onLongPressCell?: (resource: CalendarResource, date: Date) => void;
  delayLongPressCell?: number;
  onPressEvent?: (event: CalendarEvent) => void;
  onLongPressEvent?: (event: CalendarEvent) => void;
  delayLongPressEvent?: number;
  eventHeight?: number;
  bottomSpacing?: number;
  eventTextStyle?: (event: CalendarEvent) => TextStyle;
  eventEllipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  dateCellContainerStyle?: (date: Date) => ViewStyle;
  cellContainerStyle?: (resource: CalendarResource, date: Date) => ViewStyle;
  hiddenMonth?: boolean;
  allowFontScaling?: boolean;
  resourceNameLayout?: 'fixed-column' | 'inline-band';
};

const DEFAULT_DATE_COLUMN_WIDTH = 60;
const DEFAULT_RESOURCE_COLUMN_WIDTH = 80;
const DEFAULT_EVENT_HEIGHT = 22;
const CELL_BORDER_WIDTH = 0.5;

type ResourceRowProps = {
  resource: CalendarResource;
  dates: Date[];
  dateColumnWidth: number;
  eventsByResourceId: Map<string, CalendarEvent[]>;
  onPressCell?: (resource: CalendarResource, date: Date) => void;
  onLongPressCell?: (resource: CalendarResource, date: Date) => void;
  delayLongPressCell?: number;
  onPressEvent?: (event: CalendarEvent) => void;
  onLongPressEvent?: (event: CalendarEvent) => void;
  delayLongPressEvent?: number;
  eventHeight: number;
  eventTextStyle?: (event: CalendarEvent) => TextStyle;
  eventEllipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  cellContainerStyle?: (resource: CalendarResource, date: Date) => ViewStyle;
  allowFontScaling?: boolean;
  onLayout?: (height: number) => void;
  inlineBand?: {
    scrollOffset: number;
    renderResourceNameLabel?: (resource: CalendarResource) => React.JSX.Element;
  };
};

function ResourceRow({
  resource,
  dates,
  dateColumnWidth,
  eventsByResourceId,
  onPressCell,
  onLongPressCell,
  delayLongPressCell,
  onPressEvent,
  onLongPressEvent,
  delayLongPressEvent,
  eventHeight,
  eventTextStyle,
  eventEllipsizeMode,
  cellContainerStyle,
  allowFontScaling,
  onLayout,
  inlineBand,
}: ResourceRowProps) {
  const resourceEvents = eventsByResourceId.get(resource.id) ?? [];
  const eventPosition = new ResourcesCalendarEventPosition();

  return (
    <View
      style={styles.resourceRow}
      onLayout={(e) => onLayout?.(e.nativeEvent.layout.height)}
    >
      {inlineBand != null && (
        <View style={styles.resourceNameInlineBand}>
          <View style={{ marginLeft: inlineBand.scrollOffset + 4 }}>
            {inlineBand.renderResourceNameLabel ? (
              inlineBand.renderResourceNameLabel(resource)
            ) : (
              <Text
                allowFontScaling={allowFontScaling}
                style={styles.resourceNameInlineBandText}
              >
                {resource.name}
              </Text>
            )}
          </View>
        </View>
      )}
      <View style={styles.resourceRowContentArea}>
        {dates.map((date, dateIndex) => {
          const djs = dayjs(date);

          // Filter events that start on this date, or events that started before this date and continue into the first cell
          const filteredEvents = resourceEvents
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

          // Place events considering occupied row numbers to avoid overlap
          const rowNums = eventPosition.getRowNums({
            resourceId: resource.id,
            date,
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
            <TouchableOpacity
              key={date.getTime()}
              style={[
                styles.contentCellContainer,
                { width: dateColumnWidth },
                { zIndex: dates.length - dateIndex },
                cellContainerStyle?.(resource, date),
              ]}
              onPress={() => onPressCell?.(resource, date)}
              onLongPress={() => onLongPressCell?.(resource, date)}
              delayLongPress={delayLongPressCell}
              activeOpacity={1}
            >
              {cellEvents.map((event, rowIndex) => {
                if (typeof event === 'number') {
                  return (
                    <View
                      key={`spacer-${rowIndex}`}
                      style={{
                        height: eventHeight,
                        marginBottom: EVENT_GAP,
                      }}
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

                // Calculate event width based on the number of days it spans
                let width =
                  (diffDays + 1) * dateColumnWidth -
                  EVENT_GAP * 2 -
                  CELL_BORDER_WIDTH * 2;
                if (isPrevDateEvent) {
                  width += EVENT_GAP + 1;
                }

                // Record position info
                eventPosition.push({
                  resourceId: resource.id,
                  startDate: startDjs.toDate(),
                  days: diffDays + 1,
                  rowNum: rowIndex + 1,
                });

                return (
                  <TouchableOpacity
                    data-component-name="resources-calendar-event"
                    key={event.id}
                    style={[
                      styles.event,
                      {
                        backgroundColor: event.backgroundColor,
                        borderColor: event.borderColor,
                        width,
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
                    ]}
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
                );
              })}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

type ScrollViewRef = React.ComponentRef<typeof ScrollView>;

export function ResourcesCalendar(props: ResourcesCalendarProps) {
  const dateColumnWidth = props.dateColumnWidth ?? DEFAULT_DATE_COLUMN_WIDTH;
  const isInlineBand = props.resourceNameLayout === 'inline-band';
  const fixedRowCount = isInlineBand ? 0 : (props.fixedRowCount ?? 0);

  const dates = useMemo(
    () => generateDates(props.fromDate, props.toDate),
    [props.fromDate, props.toDate]
  );

  const monthGroups = useMemo(() => groupDatesByMonth(dates), [dates]);

  const eventsByResourceId = useMemo(() => {
    const deduped = new Map<string, CalendarEvent>();
    for (const event of props.events) {
      deduped.set(event.id, event);
    }
    const map = new Map<string, CalendarEvent[]>();
    for (const event of deduped.values()) {
      const list = map.get(event.resourceId) ?? [];
      list.push(event);
      map.set(event.resourceId, list);
    }
    return map;
  }, [props.events]);

  const monthGroupOffsets = useMemo(() => {
    let offset = 0;
    return monthGroups.map((group) => {
      const start = offset;
      offset += group.dates.length * dateColumnWidth;
      return { start, width: group.dates.length * dateColumnWidth };
    });
  }, [monthGroups, dateColumnWidth]);

  const fixedResources = useMemo(
    () => props.resources.slice(0, fixedRowCount),
    [props.resources, fixedRowCount]
  );
  const scrollableResources = useMemo(
    () => props.resources.slice(fixedRowCount),
    [props.resources, fixedRowCount]
  );

  const resourceColumnWidth =
    props.resourceColumnWidth ?? DEFAULT_RESOURCE_COLUMN_WIDTH;

  const [rowHeights, setRowHeights] = useState<Map<string, number>>(new Map());
  const handleRowLayout = useCallback((resourceId: string, height: number) => {
    setRowHeights((prev) => {
      if (prev.get(resourceId) === height) return prev;
      const next = new Map(prev);
      next.set(resourceId, height);
      return next;
    });
  }, []);

  const [headerHeight, setHeaderHeight] = useState(0);

  const headerScrollRef = useRef<ScrollViewRef>(null);
  const bodyScrollRef = useRef<ScrollViewRef>(null);
  const outerScrollRef = useRef<ScrollViewRef>(null);
  const resourceNameScrollRef = useRef<ScrollViewRef>(null);
  const activeScroller = useRef<'header' | 'body' | null>(null);
  const activeScrollerTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const lastScrollX = useRef(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const activeVerticalScroller = useRef<'outer' | 'resourceName' | null>(null);
  const activeVerticalScrollerTimer = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const releaseActiveVerticalScroller = useCallback(() => {
    activeVerticalScroller.current = null;
  }, []);

  // Sync the label position after scrolling stops.
  // When the activeScroller timeout fires, treat it as scroll end
  // and commit the current lastScrollX value to state.
  const releaseActiveScroller = useCallback(() => {
    activeScroller.current = null;
    setScrollOffset(lastScrollX.current);
  }, []);

  const handleHeaderScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (activeScroller.current === 'body') {
        return;
      }
      const x = event.nativeEvent.contentOffset.x;
      lastScrollX.current = x;
      activeScroller.current = 'header';

      if (activeScrollerTimer.current != null) {
        clearTimeout(activeScrollerTimer.current);
      }
      activeScrollerTimer.current = setTimeout(releaseActiveScroller, 150);

      bodyScrollRef.current?.scrollTo({ x, animated: false });
    },
    [releaseActiveScroller]
  );

  const handleBodyScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (activeScroller.current === 'header') {
        return;
      }
      const x = event.nativeEvent.contentOffset.x;
      lastScrollX.current = x;
      activeScroller.current = 'body';

      if (activeScrollerTimer.current != null) {
        clearTimeout(activeScrollerTimer.current);
      }
      activeScrollerTimer.current = setTimeout(releaseActiveScroller, 150);

      headerScrollRef.current?.scrollTo({ x, animated: false });
    },
    [releaseActiveScroller]
  );

  const handleOuterScrollBeginDrag = useCallback(() => {
    if (activeVerticalScrollerTimer.current != null) {
      clearTimeout(activeVerticalScrollerTimer.current);
    }
    activeVerticalScroller.current = 'outer';
  }, []);

  const handleResourceNameScrollBeginDrag = useCallback(() => {
    if (activeVerticalScrollerTimer.current != null) {
      clearTimeout(activeVerticalScrollerTimer.current);
    }
    activeVerticalScroller.current = 'resourceName';
  }, []);

  const handleOuterScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (activeVerticalScroller.current === 'resourceName') return;
      const y = event.nativeEvent.contentOffset.y;
      resourceNameScrollRef.current?.scrollTo({ y, animated: false });
    },
    []
  );

  const handleResourceNameScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (activeVerticalScroller.current === 'outer') return;
      const y = event.nativeEvent.contentOffset.y;
      outerScrollRef.current?.scrollTo({ y, animated: false });
    },
    []
  );

  const handleOuterScrollEnd = useCallback(() => {
    if (activeVerticalScrollerTimer.current != null) {
      clearTimeout(activeVerticalScrollerTimer.current);
    }
    activeVerticalScrollerTimer.current = setTimeout(
      releaseActiveVerticalScroller,
      100
    );
  }, [releaseActiveVerticalScroller]);

  const handleResourceNameScrollEnd = useCallback(() => {
    if (activeVerticalScrollerTimer.current != null) {
      clearTimeout(activeVerticalScrollerTimer.current);
    }
    activeVerticalScrollerTimer.current = setTimeout(
      releaseActiveVerticalScroller,
      100
    );
  }, [releaseActiveVerticalScroller]);

  const commonRowProps = {
    dates,
    dateColumnWidth,
    eventsByResourceId,
    onPressCell: props.onPressCell,
    onLongPressCell: props.onLongPressCell,
    delayLongPressCell: props.delayLongPressCell,
    onPressEvent: props.onPressEvent,
    onLongPressEvent: props.onLongPressEvent,
    delayLongPressEvent: props.delayLongPressEvent,
    eventHeight: props.eventHeight ?? DEFAULT_EVENT_HEIGHT,
    eventTextStyle: props.eventTextStyle,
    eventEllipsizeMode: props.eventEllipsizeMode,
    cellContainerStyle: props.cellContainerStyle,
    allowFontScaling: props.allowFontScaling,
    inlineBand: isInlineBand
      ? {
          scrollOffset,
          renderResourceNameLabel: props.renderResourceNameLabel,
        }
      : undefined,
  };

  const resourceNameColumn = !isInlineBand ? (
    <ScrollView
      ref={resourceNameScrollRef}
      style={[styles.resourceNameColumn, { width: resourceColumnWidth }]}
      contentContainerStyle={{ width: resourceColumnWidth }}
      stickyHeaderIndices={[0]}
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
      onScrollBeginDrag={handleResourceNameScrollBeginDrag}
      onScroll={handleResourceNameScroll}
      onScrollEndDrag={handleResourceNameScrollEnd}
      onMomentumScrollEnd={handleResourceNameScrollEnd}
      scrollEventThrottle={16}
    >
      {/* [0] sticky: header height spacer + fixed resource name rows */}
      <View style={[styles.resourceNameColumn, styles.resourceNameColumnFixed]}>
        <View
          style={[styles.resourceNameHeaderSpacer, { height: headerHeight }]}
        />
        {fixedResources.map((resource) => (
          <View
            key={resource.id}
            style={[
              styles.resourceNameCell,
              { height: rowHeights.get(resource.id) },
            ]}
          >
            {props.renderResourceNameLabel ? (
              props.renderResourceNameLabel(resource)
            ) : (
              <View>
                <Text
                  allowFontScaling={props.allowFontScaling}
                  style={styles.resourceNameFixedLabelText}
                  numberOfLines={1}
                >
                  {resource.name}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
      <View>
        {/* Scrollable resource name rows */}
        {scrollableResources.map((resource) => (
          <View
            key={resource.id}
            style={[
              styles.resourceNameCell,
              { height: rowHeights.get(resource.id) },
            ]}
          >
            {props.renderResourceNameLabel ? (
              props.renderResourceNameLabel(resource)
            ) : (
              <View>
                <Text
                  allowFontScaling={props.allowFontScaling}
                  style={styles.resourceNameFixedLabelText}
                  numberOfLines={1}
                >
                  {resource.name}
                </Text>
              </View>
            )}
          </View>
        ))}
        <View style={{ height: props.bottomSpacing }} />
      </View>
    </ScrollView>
  ) : null;

  return (
    <View style={styles.container}>
      {/* Left: fixed resource name column (fixed-column mode only) */}
      {resourceNameColumn}

      {/* Right: calendar body */}
      <ScrollView
        ref={outerScrollRef}
        style={styles.calendarBody}
        stickyHeaderIndices={[0]}
        onScrollBeginDrag={handleOuterScrollBeginDrag}
        onScroll={handleOuterScroll}
        onScrollEndDrag={handleOuterScrollEnd}
        onMomentumScrollEnd={handleOuterScrollEnd}
        scrollEventThrottle={16}
        overScrollMode="never"
        bounces={props.onRefresh != null}
        refreshControl={
          props.onRefresh != null ? (
            <RefreshControl
              refreshing={props.refreshing ?? false}
              onRefresh={props.onRefresh}
            />
          ) : undefined
        }
      >
        <ScrollView
          ref={headerScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          onScroll={handleHeaderScroll}
          scrollEventThrottle={16}
          data-component-name="resources-calendar-header-row"
        >
          <View>
            <View
              onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
            >
              {!props.hiddenMonth && (
                <View style={styles.monthHeaderRow}>
                  {monthGroups.map(({ year, month }, index) => {
                    const { start: cellStart, width: cellWidth } =
                      monthGroupOffsets[index]!;
                    const textLeft = Math.max(8, scrollOffset - cellStart + 8);
                    return (
                      <View
                        key={`${year}-${month}`}
                        style={[styles.monthHeaderCell, { width: cellWidth }]}
                      >
                        <View style={{ marginLeft: textLeft }}>
                          {props.renderMonthLabel ? (
                            props.renderMonthLabel(year, month)
                          ) : (
                            <View>
                              <Text
                                numberOfLines={1}
                                allowFontScaling={props.allowFontScaling}
                                style={styles.monthHeaderText}
                              >
                                {dayjs(`${year}-${month}-01`).format('YYYY/MM')}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              <View style={styles.headerRow}>
                {dates.map((date) => (
                  <View
                    key={date.getTime()}
                    data-component-name="resources-calendar-date-cell"
                    style={[
                      styles.dateCellContainer,
                      { width: dateColumnWidth },
                      props.dateCellContainerStyle?.(date),
                    ]}
                  >
                    {props.renderDateLabel ? (
                      props.renderDateLabel(date)
                    ) : (
                      <View>
                        <Text allowFontScaling={props.allowFontScaling}>
                          {dayjs(date).format('D(ddd)')}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            <View>
              {fixedResources.map((resource) => (
                <ResourceRow
                  key={resource.id}
                  resource={resource}
                  {...commonRowProps}
                  onLayout={(height) => handleRowLayout(resource.id, height)}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <ScrollView
          ref={bodyScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          onScroll={handleBodyScroll}
          scrollEventThrottle={16}
          data-component-name="resources-calendar-body-row"
        >
          <View>
            {scrollableResources.map((resource) => (
              <ResourceRow
                key={resource.id}
                resource={resource}
                {...commonRowProps}
                onLayout={(height) => handleRowLayout(resource.id, height)}
              />
            ))}
          </View>
        </ScrollView>
        <View style={{ height: props.bottomSpacing }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  monthHeaderRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  monthHeaderCell: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: 'lightslategrey',
    borderTopWidth: CELL_BORDER_WIDTH,
    borderTopColor: 'lightslategrey',
    height: 18,
  },
  monthHeaderText: {
    fontSize: 12,
    color: '#333',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderRightWidth: CELL_BORDER_WIDTH,
    borderBottomColor: 'lightslategrey',
    backgroundColor: 'white',
  },
  dateCellContainer: {
    width: 60,
    borderTopWidth: CELL_BORDER_WIDTH,
    borderRightWidth: CELL_BORDER_WIDTH,
    borderColor: 'lightslategrey',
  },
  resourceRow: {
    flexDirection: 'column',
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderRightWidth: CELL_BORDER_WIDTH,
    borderBottomColor: 'lightslategrey',
    backgroundColor: 'white',
  },
  resourceRowContentArea: {
    flexDirection: 'row',
    minHeight: 30,
  },
  contentCellContainer: {
    paddingBottom: EVENT_GAP,
    width: 60,
    borderRightWidth: CELL_BORDER_WIDTH,
    borderColor: 'lightslategrey',
  },
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  calendarBody: {
    flex: 1,
  },
  resourceNameColumn: {
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: 'lightslategrey',
    flexGrow: 0,
    flexShrink: 0,
  },
  resourceNameColumnFixed: {
    backgroundColor: 'white',
  },
  resourceNameHeaderSpacer: {
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderBottomColor: 'lightslategrey',
  },
  resourceNameCell: {
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderBottomColor: 'lightslategrey',
    justifyContent: 'center',
    paddingHorizontal: 4,
    minHeight: 30,
  },
  resourceNameFixedLabelText: {
    fontSize: 12,
    color: 'black',
  },
  resourceNameInlineBand: {
    width: '100%',
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderColor: 'lightslategrey',
    backgroundColor: '#EEEEEE',
  },
  resourceNameInlineBandText: {
    fontSize: 12,
    color: 'black',
  },
  event: {
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: EVENT_GAP,
    marginLeft: EVENT_GAP,
  },
  prevDateEvent: {
    marginLeft: -1,
    borderTopStartRadius: 0,
    borderBottomStartRadius: 0,
  },
  eventTitle: {
    fontSize: 12,
  },
});
