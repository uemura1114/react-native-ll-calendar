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
};

const DEFAULT_DATE_COLUMN_WIDTH = 60;
const EVENT_HEIGHT = 26;

export function ResourcesCalendar(props: ResourcesCalendarProps) {
  const dateColumnWidth = props.dateColumnWidth ?? DEFAULT_DATE_COLUMN_WIDTH;

  const dates = useMemo(
    () => generateDates(props.fromDate, props.toDate),
    [props.fromDate, props.toDate]
  );

  const monthGroups = useMemo(() => groupDatesByMonth(dates), [dates]);

  const eventsByResourceId = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of props.events) {
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
            const resourceEvents = eventsByResourceId.get(resource.id) ?? [];
            const eventPosition = new ResourcesCalendarEventPosition();

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
                  {dates.map((date, dateIndex) => {
                    const djs = dayjs(date);

                    // この日付が開始日のイベント、または行の先頭で前日から続くイベントを抽出
                    const filteredEvents = resourceEvents
                      .filter((event) => {
                        const startDjs = dayjs(event.start);
                        return (
                          startDjs.format('YYYY-MM-DD') ===
                            djs.format('YYYY-MM-DD') ||
                          (dateIndex === 0 && startDjs.isBefore(djs))
                        );
                      })
                      .sort((a, b) => {
                        const aStartDjs =
                          dateIndex === 0 ? djs : dayjs(a.start);
                        const bStartDjs =
                          dateIndex === 0 ? djs : dayjs(b.start);
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

                    // 行番号を考慮してイベントを配置（重複回避）
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
                      <View
                        key={date.getTime()}
                        style={[
                          styles.dateCellContainer,
                          { width: dateColumnWidth },
                        ]}
                      >
                        {cellEvents.map((event, rowIndex) => {
                          if (typeof event === 'number') {
                            return (
                              <View
                                key={event}
                                style={{
                                  height: EVENT_HEIGHT,
                                  marginBottom: EVENT_GAP,
                                }}
                              />
                            );
                          }

                          const rawStartDjs = dayjs(event.start);
                          const startDjs =
                            dateIndex === 0 ? djs : dayjs(event.start);
                          const endDjs = dayjs(event.end);
                          const diffDays = endDjs
                            .startOf('day')
                            .diff(startDjs.startOf('day'), 'day');
                          const isPrevDateEvent =
                            dateIndex === 0 && rawStartDjs.isBefore(djs);

                          // イベントの幅を日数に応じて計算
                          let width =
                            (diffDays + 1) * dateColumnWidth -
                            EVENT_GAP * 2 -
                            0.5 * 2;
                          if (isPrevDateEvent) {
                            width += EVENT_GAP + 1;
                          }

                          // 位置情報を記録
                          eventPosition.push({
                            resourceId: resource.id,
                            startDate: startDjs.toDate(),
                            days: diffDays + 1,
                            rowNum: rowIndex + 1,
                          });

                          return (
                            <TouchableOpacity
                              key={event.id}
                              style={[
                                styles.event,
                                {
                                  backgroundColor: event.backgroundColor,
                                  borderColor: event.borderColor,
                                  width,
                                  height: EVENT_HEIGHT,
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
                            >
                              <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={[
                                  styles.eventTitle,
                                  { color: event.color },
                                ]}
                              >
                                {event.title}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    );
                  })}
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
    overflow: 'hidden',
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
