import React, { useRef, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  PanResponder,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  RefreshControl,
  type LayoutChangeEvent,
} from 'react-native';
import type {
  CalendarEvent,
  CalendarResource,
} from '../../types/resources-calendar';
import { CELL_BORDER_WIDTH } from '../../constants/size';
import dayjs from 'dayjs';

type ResourcesCalendarV0Props = {
  fromDate: Date;
  toDate: Date;
  resources: CalendarResource[];
  events: CalendarEvent[];
  renderDateLabel?: (date: Date) => React.JSX.Element;
  renderResourceNameLabel?: (resource: CalendarResource) => React.JSX.Element;
  resourceColumnWidth?: number;
  dateColumnWidth?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
};

const DEFAULT_RESOURCE_COLUMN_WIDTH = 120;
const DEFAULT_DATE_COLUMN_WIDTH = 80;
const MONTH_HEADER_HEIGHT = 18;
const DAY_HEADER_HEIGHT = 18;
const TOTAL_HEADER_HEIGHT = MONTH_HEADER_HEIGHT + DAY_HEADER_HEIGHT;
const MIN_ROW_HEIGHT = 44;
const MIN_RESOURCE_COLUMN_WIDTH = 30;
const DRAG_HANDLE_HIT_WIDTH = 16;
const MONTH_TEXT_PADDING = 8;

type ScrollViewRef = React.ComponentRef<typeof ScrollView>;

type MonthGroup = {
  year: number;
  month: number;
  dates: Date[];
};

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

const ResourcesCalendarV0 = (props: ResourcesCalendarV0Props) => {
  const {
    fromDate,
    toDate,
    resources,
    renderDateLabel,
    renderResourceNameLabel,
    resourceColumnWidth = DEFAULT_RESOURCE_COLUMN_WIDTH,
    dateColumnWidth = DEFAULT_DATE_COLUMN_WIDTH,
    onRefresh,
    refreshing,
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

  const [scrollOffset, setScrollOffset] = useState(0);

  const headerScrollRef = useRef<ScrollViewRef>(null);
  const dateScrollRef = useRef<ScrollViewRef>(null);

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

  // Track row heights
  const [rowHeights, setRowHeights] = useState<{ [key: string]: number }>({});

  // Handle row height measurement from main content
  const handleRowLayout = useCallback(
    (resourceId: string, event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      setRowHeights((prev) => {
        return { ...prev, [resourceId]: height };
      });
    },
    []
  );

  // Handle row height measurement from resource column
  const handleResourceLayout = useCallback(
    (resourceId: string, event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      setRowHeights((prev) => {
        const currentHeight = prev[resourceId] || 0;
        if (height > currentHeight) {
          return { ...prev, [resourceId]: height };
        }
        return prev;
      });
    },
    []
  );

  const handleDateScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      headerScrollRef.current?.scrollTo({ x, animated: false });
    },
    []
  );

  const handleDateScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setScrollOffset(e.nativeEvent.contentOffset.x);
    },
    []
  );

  return (
    <View style={styles.container}>
      {/* Fixed header rows (month + day) */}
      <View style={[styles.headerRow, { height: TOTAL_HEADER_HEIGHT }]}>
        <View
          style={[
            styles.resourceCell,
            { width: columnWidth, height: TOTAL_HEADER_HEIGHT },
          ]}
        />
        <ScrollView
          ref={headerScrollRef}
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
        >
          <View>
            {/* Month row */}
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
                    <View style={[{ marginLeft: textLeft }]}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.monthHeaderText,
                          // { marginLeft: textLeft },
                        ]}
                      >
                        {formatMonth(year, month)}
                      </Text>
                    </View>
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
                    <Text style={styles.dateHeaderText}>{formatDay(date)}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Scrollable body */}
      <ScrollView
        style={styles.bodyScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.bodyContent}>
          {/* Resource name column */}
          <View
            style={{ width: columnWidth }}
            data-component-name="resource-name-column"
          >
            {resources.map((resource) => (
              <View
                key={resource.id}
                style={[
                  styles.resourceCell,
                  styles.resourceRow,
                  { minHeight: rowHeights[resource.id] ?? MIN_ROW_HEIGHT },
                ]}
                data-component-name="resource-name-cell"
              >
                <View onLayout={(e) => handleResourceLayout(resource.id, e)}>
                  {renderResourceNameLabel ? (
                    renderResourceNameLabel(resource)
                  ) : (
                    <Text style={styles.resourceName} numberOfLines={9}>
                      {resource.name}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Single horizontal ScrollView for all date columns */}
          <ScrollView
            ref={dateScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleDateScroll}
            onScrollEndDrag={handleDateScrollEnd}
            onMomentumScrollEnd={handleDateScrollEnd}
            style={styles.dateScrollView}
            bounces={false}
            overScrollMode="never"
          >
            <View>
              {resources.map((resource) => (
                <View
                  key={resource.id}
                  style={[
                    styles.dateRow,
                    { minHeight: rowHeights[resource.id] ?? MIN_ROW_HEIGHT },
                  ]}
                  data-component-name="resource-dates-row"
                  onLayout={(e) => handleRowLayout(resource.id, e)}
                >
                  {dates.map((date) => (
                    <View
                      key={date.getTime()}
                      style={[styles.dateCell, { width: dateColumnWidth }]}
                      data-component-name="resource-date-cell"
                    />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Drag handle overlay */}
      <View
        style={[
          styles.dragHandleOverlay,
          {
            left: columnWidth - DRAG_HANDLE_HIT_WIDTH / 2,
          },
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
    borderBottomColor: 'lightslategrey',
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
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    flexDirection: 'row',
    borderTopWidth: CELL_BORDER_WIDTH,
    borderTopColor: 'lightslategrey',
    marginTop: -CELL_BORDER_WIDTH,
  },
  resourceCell: {
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: 'lightslategrey',
  },
  resourceRow: {
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderBottomColor: 'lightslategrey',
  },
  resourceName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
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
  dateRow: {
    flexDirection: 'row',
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderBottomColor: 'lightslategrey',
  },
  dateCell: {
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: 'lightslategrey',
  },
  dateScrollView: {
    flex: 1,
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

export default ResourcesCalendarV0;
