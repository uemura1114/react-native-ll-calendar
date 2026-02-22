import React, { useCallback, useMemo, useRef } from 'react';
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
        <View style={styles.headerRow}>
          <View
            data-component-name="resources-calendar-resource-name-column"
            style={[
              styles.resourceNameCellContainer,
              styles.resourceNameColumn,
            ]}
          />
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
      >
        <View>
          {props.resources.map((resource) => {
            return (
              <View style={styles.resourceRow}>
                <View
                  style={[
                    styles.resourceNameCellContainer,
                    styles.resourceNameColumn,
                  ]}
                >
                  <Text>{resource.name}</Text>
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
  },
  resourceNameColumn: {
    width: 80,
  },
});
