import React, { useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
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

type ScrollViewRef = React.ComponentRef<typeof ScrollView>;

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
        <View style={[styles.resourceCell, { width: resourceColumnWidth }]} />
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
          <View style={{ width: resourceColumnWidth }}>
            {resources.map((resource) => (
              <View
                key={resource.id}
                style={[
                  styles.resourceCell,
                  styles.resourceRow,
                  { height: ROW_HEIGHT },
                ]}
              >
                {renderResourceNameLabel ? (
                  renderResourceNameLabel(resource)
                ) : (
                  <Text style={styles.resourceName} numberOfLines={2}>
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
                  style={[styles.dateRow, { height: ROW_HEIGHT }]}
                >
                  {dates.map((date) => (
                    <View
                      key={date.getTime()}
                      style={[
                        styles.dateCell,
                        { width: dateColumnWidth, height: ROW_HEIGHT },
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
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
});

export default ResourcesCalendar;
