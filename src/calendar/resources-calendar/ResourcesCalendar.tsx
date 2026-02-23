import React, { useCallback, useMemo, useRef, useState } from 'react';
import type {
  CalendarEvent,
  CalendarResource,
} from '../../types/resources-calendar';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { View } from 'react-native';
import { generateDates, groupDatesByMonth } from '../../utils/functions';
import dayjs from 'dayjs';

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
};

const DEFAULT_DATE_COLUMN_WIDTH = 60;

export function ResourcesCalendar(props: ResourcesCalendarProps) {
  const dateColumnWidth = props.dateColumnWidth ?? DEFAULT_DATE_COLUMN_WIDTH;

  const dates = useMemo(
    () => generateDates(props.fromDate, props.toDate),
    [props.fromDate, props.toDate]
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

  const headerScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const bodyScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const isSyncing = useRef(false);
  const isMomentumScrolling = useRef(false);
  const [scrollOffset, setScrollOffset] = useState(0);

  const handleHeaderScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isSyncing.current) {
        isSyncing.current = false;
        return;
      }
      isSyncing.current = true;
      bodyScrollRef.current?.scrollTo({
        x: event.nativeEvent.contentOffset.x,
        animated: false,
      });
    },
    []
  );

  const handleBodyScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isSyncing.current) {
        isSyncing.current = false;
        return;
      }
      isSyncing.current = true;
      headerScrollRef.current?.scrollTo({
        x: event.nativeEvent.contentOffset.x,
        animated: false,
      });
    },
    []
  );

  const handleScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      // onMomentumScrollBegin が先に発火するか確認するため setTimeout で遅延
      setTimeout(() => {
        if (!isMomentumScrolling.current) {
          setScrollOffset(x);
        }
      }, 0);
    },
    []
  );

  const handleMomentumScrollBegin = useCallback(() => {
    isMomentumScrolling.current = true;
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isMomentumScrolling.current = false;
      setScrollOffset(e.nativeEvent.contentOffset.x);
    },
    []
  );

  return (
    <ScrollView
      stickyHeaderIndices={[0]}
      refreshControl={
        <RefreshControl
          refreshing={!!props.refreshing}
          onRefresh={props.onRefresh}
        />
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
          {/* Month row */}
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
                        <Text numberOfLines={1} style={styles.monthHeaderText}>
                          {dayjs(`${year}-${month}-01`).format('YYYY/MM')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
          {/* Day row */}
          <View style={styles.headerRow}>
            {dates.map((date) => (
              <View
                key={date.getTime()}
                data-component-name="resources-calendar-date-cell"
                style={[styles.dateCellContainer, { width: dateColumnWidth }]}
              >
                {props.renderDateLabel ? (
                  props.renderDateLabel(date)
                ) : (
                  <View>
                    <Text>{dayjs(date).format('D(ddd)')}</Text>
                  </View>
                )}
              </View>
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
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      >
        <View>
          {props.resources.map((resource) => {
            return (
              <View key={resource.id} style={styles.resourceRow}>
                <View style={[styles.resourceNameFixedLabel]}>
                  <View style={{ marginLeft: scrollOffset + 4 }}>
                    {props.renderResourceNameLabel ? (
                      props.renderResourceNameLabel(resource)
                    ) : (
                      <View>
                        <Text style={styles.resourceNameFixedLabelText}>
                          {resource.name}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.resourceRowContentArea}>
                  {dates.map((date) => (
                    <View
                      key={date.getTime()}
                      style={styles.dateCellContainer}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScrollView>
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
    borderRightWidth: 0.5,
    borderRightColor: 'lightslategrey',
    borderTopWidth: 0.5,
    borderTopColor: 'lightslategrey',
    height: 18,
  },
  monthHeaderText: {
    fontSize: 12,
    color: '#333',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomColor: 'lightslategrey',
    backgroundColor: 'white',
  },
  dateCellContainer: {
    width: 60,
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: 'lightslategrey',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceNameCellContainer: {
    width: 80,
    borderRightWidth: 0.5,
    borderColor: 'lightslategrey',
  },
  resourceRow: {
    flexDirection: 'column',
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomColor: 'lightslategrey',
  },
  resourceRowContentArea: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: 'lightslategrey',
    minHeight: 30,
  },
  resourceNameColumn: {
    width: 80,
  },
  resourceNameFixedLabel: {
    width: '100%',
    borderBottomWidth: 0.5,
    borderColor: 'lightslategrey',
    backgroundColor: '#EEEEEE',
  },
  resourceNameFixedLabelText: {
    fontSize: 12,
    color: 'black',
  },
});
