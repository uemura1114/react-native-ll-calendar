import React, { useCallback, useMemo, useRef, useState } from 'react';
import type {
  CalendarEvent,
  CalendarResource,
} from '../../types/resources-calendar';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { View } from 'react-native';
import { generateDates } from '../../utils/functions';
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
  onRefresh?: () => void;
  refreshing?: boolean;
};

export function ResourcesCalendar(props: ResourcesCalendarProps) {
  const dates = useMemo(
    () => generateDates(props.fromDate, props.toDate),
    [props.fromDate, props.toDate]
  );

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
    <ScrollView stickyHeaderIndices={[0]}>
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
        <View style={[styles.headerRow]}>
          {dates.map((date) => (
            <View
              key={date.getTime()}
              data-component-name="resources-calendar-date-cell"
              style={styles.dateCellContainer}
            >
              <Text>{dayjs(date).format('D(ddd)')}</Text>
            </View>
          ))}
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
                  <Text style={{ marginLeft: scrollOffset }}>
                    {resource.name}
                  </Text>
                </View>
                {dates.map((date) => (
                  <View key={date.getTime()} style={styles.dateCellContainer} />
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'lightslategrey',
    backgroundColor: 'white',
  },
  dateCellContainer: {
    width: 60,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: 'lightslategrey',
  },
  resourceNameCellContainer: {
    width: 80,
    borderRightWidth: 1,
    borderColor: 'lightslategrey',
  },
  resourceRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'lightslategrey',
    minHeight: 32,
  },
  resourceNameColumn: {
    width: 80,
  },
  resourceNameFixedLabel: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 10,
    backgroundColor: 'white',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'lightslategrey',
  },
});
