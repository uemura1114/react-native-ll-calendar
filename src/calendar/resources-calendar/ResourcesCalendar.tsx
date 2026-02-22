import React, { useRef, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  PanResponder,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import type {
  CalendarEvent,
  CalendarResource,
} from '../../types/resources-calendar';
import { CELL_BORDER_WIDTH } from '../../constants/size';

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
const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 44;
const MIN_RESOURCE_COLUMN_WIDTH = 30;
const DRAG_HANDLE_HIT_WIDTH = 16;

type ScrollViewRef = React.ComponentRef<typeof ScrollView>;

type RowMeasurement = { nameHeight: number; datesHeight: number };

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

function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
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

  const [rowMeasurements, setRowMeasurements] = useState<
    Record<string, RowMeasurement>
  >({});

  const updateRowMeasurement = useCallback(
    (resourceId: string, side: keyof RowMeasurement, height: number) => {
      setRowMeasurements((prev) => {
        if (prev[resourceId]?.[side] === height) {
          return prev;
        }

        return {
          ...prev,
          [resourceId]: {
            nameHeight: 0,
            datesHeight: 0,
            ...prev[resourceId],
            [side]: height,
          },
        };
      });
    },
    []
  );

  const getRowMinHeight = useCallback(
    (resourceId: string) => {
      const m = rowMeasurements[resourceId];
      if (!m) {
        return ROW_HEIGHT;
      }

      return Math.max(ROW_HEIGHT, m.nameHeight, m.datesHeight);
    },
    [rowMeasurements]
  );

  const handleDateScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      headerScrollRef.current?.scrollTo({ x, animated: false });
    },
    []
  );

  return (
    <View style={styles.container}>
      {/* Fixed header row */}
      <View style={[styles.headerRow, { height: HEADER_HEIGHT }]}>
        <View style={[styles.resourceCell, { width: columnWidth }]} />
        <ScrollView
          ref={headerScrollRef}
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
        >
          {dates.map((date) => (
            <View
              key={date.getTime()}
              style={[
                styles.dateHeaderCell,
                { width: dateColumnWidth, height: HEADER_HEIGHT },
              ]}
            >
              {renderDateLabel ? (
                renderDateLabel(date)
              ) : (
                <Text style={styles.dateHeaderText}>{formatDate(date)}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Scrollable body */}
      <ScrollView
        style={styles.bodyScroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
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
                  { minHeight: getRowMinHeight(resource.id) },
                ]}
                onLayout={(e) =>
                  updateRowMeasurement(
                    resource.id,
                    'nameHeight',
                    e.nativeEvent.layout.height
                  )
                }
                data-component-name="resource-name-cell"
              >
                {renderResourceNameLabel ? (
                  renderResourceNameLabel(resource)
                ) : (
                  <Text style={styles.resourceName} numberOfLines={3}>
                    {resource.name}
                  </Text>
                )}
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
                    { minHeight: getRowMinHeight(resource.id) },
                  ]}
                  onLayout={(e) =>
                    updateRowMeasurement(
                      resource.id,
                      'datesHeight',
                      e.nativeEvent.layout.height
                    )
                  }
                  data-component-name="resource-dates-row"
                >
                  {dates.map((date) => (
                    <View
                      key={date.getTime()}
                      style={[
                        styles.dateCell,
                        { width: dateColumnWidth, minHeight: ROW_HEIGHT },
                      ]}
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
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    flexDirection: 'row',
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
    fontWeight: '600',
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
    top: 0,
    height: HEADER_HEIGHT,
    width: DRAG_HANDLE_HIT_WIDTH,
    alignItems: 'center',
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
    borderRightColor: 'lightslategrey',
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
    borderLeftColor: 'lightslategrey',
  },
});

export default ResourcesCalendar;
