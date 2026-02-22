import React, { useRef, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  PanResponder,
  type ListRenderItem,
} from 'react-native';
import type {
  CalendarEvent,
  CalendarResource,
} from '../../types/resources-calendar';
import { CELL_BORDER_WIDTH } from '../../constants/size';
import dayjs from 'dayjs';

type ResourcesCalendarProps = {
  fromDate: Date;
  toDate: Date;
  resources: CalendarResource[];
  events: CalendarEvent[];
  renderDateLabel?: (date: Date) => React.JSX.Element;
  renderResourceNameLabel?: (resource: CalendarResource) => React.JSX.Element;
  resourceColumnWidth?: number;
  dateColumnWidth?: number;
};

const DEFAULT_RESOURCE_COLUMN_WIDTH = 120;
const DEFAULT_DATE_COLUMN_WIDTH = 80;
const MONTH_HEADER_HEIGHT = 18;
const DAY_HEADER_HEIGHT = 18;
const TOTAL_HEADER_HEIGHT = MONTH_HEADER_HEIGHT + DAY_HEADER_HEIGHT;
const ROW_HEIGHT = 44;
const MIN_RESOURCE_COLUMN_WIDTH = 30;
const DRAG_HANDLE_HIT_WIDTH = 16;
const MONTH_TEXT_PADDING = 8;

type ScrollViewRef = React.ComponentRef<typeof ScrollView>;

type MonthGroup = {
  year: number;
  month: number;
  dates: Date[];
};

type ListItem =
  | { type: 'header' }
  | { type: 'resource'; resource: CalendarResource };

function generateDates(from: Date, to: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(from);
  current.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function groupDatesByMonth(dates: Date[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const date of dates) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const last = groups[groups.length - 1];
    if (last && last.year === year && last.month === month) {
      last.dates.push(date);
    } else {
      groups.push({ year, month, dates: [date] });
    }
  }
  return groups;
}

function formatDay(date: Date): string {
  return dayjs(date).format('D');
}

function formatMonth(year: number, month: number): string {
  const dateDjs = dayjs(`${year}-${month}-01`);
  return dateDjs.format('YYYY/MM');
}

const ResourcesCalendar = (props: ResourcesCalendarProps) => {
  const {
    fromDate,
    toDate,
    resources,
    renderDateLabel,
    renderResourceNameLabel,
    resourceColumnWidth = DEFAULT_RESOURCE_COLUMN_WIDTH,
    dateColumnWidth = DEFAULT_DATE_COLUMN_WIDTH,
  } = props;

  const dates = useMemo(
    () => generateDates(fromDate, toDate),
    [fromDate, toDate]
  );

  const monthGroups = useMemo(() => groupDatesByMonth(dates), [dates]);

  const monthGroupOffsets = useMemo(() => {
    let offset = 0;
    return monthGroups.map((group) => {
      const start = offset;
      offset += group.dates.length * dateColumnWidth;
      return { start, width: group.dates.length * dateColumnWidth };
    });
  }, [monthGroups, dateColumnWidth]);

  // Total scrollable width of the date area
  const totalDatesWidth = dates.length * dateColumnWidth;

  // Horizontal scroll state for sticky month label positioning (updated on scroll end)
  const [scrollOffset, setScrollOffset] = useState(0);

  // Master horizontal scroll position — never causes re-renders
  const scrollXRef = useRef(0);

  // ── Scroll refs ──────────────────────────────────────────────────────────
  // Ghost ScrollView: the sole horizontal touch/momentum handler
  const ghostScrollRef = useRef<ScrollViewRef>(null);
  // Header date labels: always scrollEnabled={false}, driven by ghost
  const headerScrollRef = useRef<ScrollViewRef>(null);
  // All currently-rendered row date ScrollViews: scrollEnabled={false}, driven by ghost
  const rowScrollRefs = useRef<Map<string, ScrollViewRef>>(new Map());

  // Push a new x position to every follower
  const syncScrollTo = useCallback((x: number) => {
    headerScrollRef.current?.scrollTo({ x, animated: false });
    rowScrollRefs.current.forEach((ref) => {
      ref.scrollTo({ x, animated: false });
    });
  }, []);

  // Called on every ghost onScroll event — single source of truth, no feedback loop
  const handleGhostScroll = useCallback(
    (x: number) => {
      scrollXRef.current = x;
      syncScrollTo(x);
    },
    [syncScrollTo]
  );

  const handleScrollEnd = useCallback((x: number) => {
    setScrollOffset(x);
  }, []);

  // ── Resource name column resize ──────────────────────────────────────────
  const columnWidthRef = useRef(resourceColumnWidth);
  const [columnWidth, setColumnWidth] = useState(resourceColumnWidth);
  const dragStartWidthRef = useRef(resourceColumnWidth);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        dragStartWidthRef.current = columnWidthRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const newWidth = Math.max(
          MIN_RESOURCE_COLUMN_WIDTH,
          dragStartWidthRef.current + gestureState.dx
        );
        columnWidthRef.current = newWidth;
        setColumnWidth(newWidth);
      },
    })
  ).current;

  // ── FlatList data ────────────────────────────────────────────────────────
  const listData = useMemo<ListItem[]>(
    () => [
      { type: 'header' },
      ...resources.map((r) => ({ type: 'resource' as const, resource: r })),
    ],
    [resources]
  );

  const renderItem = useCallback<ListRenderItem<ListItem>>(
    ({ item }) => {
      // ── Header row (sticky via stickyHeaderIndices) ────────────────────
      if (item.type === 'header') {
        return (
          <View style={[styles.headerRow, { height: TOTAL_HEADER_HEIGHT }]}>
            {/* Corner placeholder — aligns with resource name column */}
            <View
              style={[
                styles.cornerCell,
                { width: columnWidth, height: TOTAL_HEADER_HEIGHT },
              ]}
            />
            {/* Date labels — scrollEnabled=false, driven by ghost scroll */}
            <ScrollView
              ref={headerScrollRef}
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
            >
              <View>
                {/* Month grouping row */}
                <View style={styles.monthHeaderRow}>
                  {monthGroups.map(({ year, month }, index) => {
                    const { start: cellStart, width: cellWidth } =
                      monthGroupOffsets[index]!;
                    const textLeft = Math.max(
                      MONTH_TEXT_PADDING,
                      scrollOffset - cellStart + MONTH_TEXT_PADDING
                    );
                    return (
                      <View
                        key={`${year}-${month}`}
                        style={[
                          styles.monthHeaderCell,
                          { width: cellWidth, height: MONTH_HEADER_HEIGHT },
                        ]}
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.monthHeaderText,
                            { marginLeft: textLeft },
                          ]}
                        >
                          {formatMonth(year, month)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                {/* Day row */}
                <View style={styles.dayHeaderRow}>
                  {dates.map((date) => (
                    <View
                      key={date.getTime()}
                      style={[
                        styles.dateHeaderCell,
                        { width: dateColumnWidth, height: DAY_HEADER_HEIGHT },
                      ]}
                    >
                      {renderDateLabel ? (
                        renderDateLabel(date)
                      ) : (
                        <Text style={styles.dateHeaderText}>
                          {formatDay(date)}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        );
      }

      // ── Resource row ───────────────────────────────────────────────────
      const { resource } = item;
      return (
        <View style={styles.resourceRow}>
          {/* Fixed resource name cell */}
          <View
            style={[
              styles.resourceNameCell,
              { width: columnWidth, minHeight: ROW_HEIGHT },
            ]}
          >
            {renderResourceNameLabel ? (
              renderResourceNameLabel(resource)
            ) : (
              <Text style={styles.resourceName} numberOfLines={3}>
                {resource.name}
              </Text>
            )}
          </View>

          {/* Date cells — scrollEnabled=false, position driven by ghost scroll */}
          <ScrollView
            ref={(r) => {
              if (r) {
                rowScrollRefs.current.set(resource.id, r);
                // Newly-rendered rows must jump to current scroll position
                r.scrollTo({ x: scrollXRef.current, animated: false });
              } else {
                rowScrollRefs.current.delete(resource.id);
              }
            }}
            horizontal
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
          >
            <View style={styles.dateCellsRow}>
              {dates.map((date) => (
                <View
                  key={date.getTime()}
                  style={[
                    styles.dateCell,
                    { width: dateColumnWidth, minHeight: ROW_HEIGHT },
                  ]}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      );
    },
    [
      columnWidth,
      dates,
      dateColumnWidth,
      monthGroups,
      monthGroupOffsets,
      scrollOffset,
      renderDateLabel,
      renderResourceNameLabel,
    ]
  );

  const keyExtractor = useCallback(
    (item: ListItem) =>
      item.type === 'header' ? '__header__' : item.resource.id,
    []
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        removeClippedSubviews={false}
        extraData={useMemo(
          () => ({ columnWidth, scrollOffset }),
          [columnWidth, scrollOffset]
        )}
      />

      {/*
       * Ghost horizontal ScrollView
       *
       * This is the ONLY scrollable horizontal view — it captures all horizontal
       * touch events and momentum, then fans the x position out to the header and
       * every row via syncScrollTo. Because followers are scrollEnabled={false},
       * they never fire their own onScroll, so there is no feedback loop and no
       * competing native scroll updates (= no jitter).
       *
       * Positioned over the date area (left edge = resource column right edge).
       * Being a horizontal ScrollView, it releases vertical gestures so the
       * FlatList's native vertical scroll continues to work normally.
       */}
      <ScrollView
        ref={ghostScrollRef}
        horizontal
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        bounces={false}
        overScrollMode="never"
        onScroll={(e) => handleGhostScroll(e.nativeEvent.contentOffset.x)}
        onScrollEndDrag={(e) => handleScrollEnd(e.nativeEvent.contentOffset.x)}
        onMomentumScrollEnd={(e) =>
          handleScrollEnd(e.nativeEvent.contentOffset.x)
        }
        style={[styles.ghostHorizontalScroll, { left: columnWidth }]}
      >
        {/* Content must be wide enough to scroll the full date range */}
        <View style={{ width: totalDatesWidth, height: 1 }} />
      </ScrollView>

      {/* Drag handle overlay for resource column resize */}
      <View
        style={[
          styles.dragHandleOverlay,
          { left: columnWidth - DRAG_HANDLE_HIT_WIDTH / 2 },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragHandleIconContainer}>
          <View style={styles.dragHandleArrow}>
            <View style={styles.dragHandleArrowLeft} />
            <View style={styles.dragHandleArrowLine} />
            <View style={styles.dragHandleArrowRight} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderTopWidth: CELL_BORDER_WIDTH,
    borderBottomColor: 'lightslategrey',
    backgroundColor: '#fff',
  },
  cornerCell: {
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: 'lightslategrey',
  },
  monthHeaderRow: {
    flexDirection: 'row',
  },
  monthHeaderCell: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: 'lightslategrey',
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderBottomColor: 'lightslategrey',
    backgroundColor: 'white',
  },
  monthHeaderText: {
    fontSize: 14,
  },
  dayHeaderRow: {
    flexDirection: 'row',
  },
  dateHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: 'lightslategrey',
  },
  dateHeaderText: {
    fontSize: 13,
    color: '#333',
  },
  resourceRow: {
    flexDirection: 'row',
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderBottomColor: 'lightslategrey',
  },
  resourceNameCell: {
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: 'lightslategrey',
  },
  resourceName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  dateCellsRow: {
    flexDirection: 'row',
  },
  dateCell: {
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: 'lightslategrey',
  },
  // Transparent full-height overlay over the date area.
  // horizontal=true means it only claims horizontal gestures; vertical gestures
  // pass through to the underlying FlatList.
  ghostHorizontalScroll: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
  dragHandleOverlay: {
    position: 'absolute',
    top: MONTH_HEADER_HEIGHT,
    height: DAY_HEADER_HEIGHT,
    width: DRAG_HANDLE_HIT_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  dragHandleIconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandleArrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandleArrowLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderRightWidth: 5,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'black',
  },
  dragHandleArrowLine: {
    width: 6,
    height: 1.5,
    backgroundColor: 'transparent',
  },
  dragHandleArrowRight: {
    width: 0,
    height: 0,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 5,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'black',
  },
});

export default ResourcesCalendar;
