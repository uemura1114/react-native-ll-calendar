import React, { useState, useMemo, type ReactNode } from 'react';
import {
  FlatList,
  useWindowDimensions,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import dayjs from 'dayjs';
import type { WeekStartsOn } from '../../types/month-calendar';
import type {
  CalendarResource,
  CalendarEvent,
} from '../../types/resources-calendar';
import { WeekPanel } from './WeekPanel';

const HALF_PANEL_LENGTH = 120;

const EMPTY_EVENTS: CalendarEvent[] = [];

type WeekResourcesCalendarProps = {
  defaultDate: Date;
  weekStartsOn?: WeekStartsOn;
  onChangeDate?: (date: Date) => void;
  resources: CalendarResource[];
  events: CalendarEvent[];
  eventHeight?: number;
  onPressCell?: (resource: CalendarResource, date: Date) => void;
  onLongPressCell?: (resource: CalendarResource, date: Date) => void;
  delayLongPressCell?: number;
  onPressEvent?: (event: CalendarEvent) => void;
  onLongPressEvent?: (event: CalendarEvent) => void;
  delayLongPressEvent?: number;
  /**
   * When true, a transparent layer is placed above events in each cell so
   * `onPressCell` / `onLongPressCell` receive touches for the full cell area.
   * Event taps are disabled while this is on (overlay captures the gesture).
   */
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

function getWeekStart(date: Date, weekStartsOn: WeekStartsOn): dayjs.Dayjs {
  const djs = dayjs(date);
  if (weekStartsOn === 0) {
    return djs.startOf('week');
  }
  const day = djs.day();
  if (day === 0) {
    return djs.subtract(6, 'day').startOf('day');
  }
  return djs.subtract(day - 1, 'day').startOf('day');
}

export const WeekResourcesCalendar = ({
  defaultDate,
  weekStartsOn = 0,
  onChangeDate,
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
}: WeekResourcesCalendarProps) => {
  const [_activeIndex, setActiveIndex] = useState(HALF_PANEL_LENGTH);
  const [dateState] = useState(defaultDate);
  const { width } = useWindowDimensions();

  const panels = useMemo(() => {
    const startOfDefaultWeek = getWeekStart(dateState, weekStartsOn);

    const prevPanels: string[] = Array.from(
      { length: HALF_PANEL_LENGTH },
      (_, i) => {
        return startOfDefaultWeek
          .subtract(HALF_PANEL_LENGTH - i, 'week')
          .format('YYYY-MM-DD');
      }
    );

    const nextPanels: string[] = Array.from(
      { length: HALF_PANEL_LENGTH },
      (_, i) => {
        return startOfDefaultWeek.add(i + 1, 'week').format('YYYY-MM-DD');
      }
    );

    return [
      ...prevPanels,
      startOfDefaultWeek.format('YYYY-MM-DD'),
      ...nextPanels,
    ];
  }, [dateState, weekStartsOn]);

  const eventsByWeek = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    if (panels.length === 0) return map;

    const panelSet = new Set(panels);
    const firstWeek = dayjs(panels[0]);
    const lastWeek = dayjs(panels[panels.length - 1]!);

    for (const event of events) {
      const startWeek = getWeekStart(new Date(event.start), weekStartsOn);
      const endWeek = getWeekStart(new Date(event.end), weekStartsOn);

      // Clamp the iteration range to the available panels.
      let cursor = startWeek.isBefore(firstWeek) ? firstWeek : startWeek;
      const last = endWeek.isAfter(lastWeek) ? lastWeek : endWeek;

      while (!cursor.isAfter(last)) {
        const weekKey = cursor.format('YYYY-MM-DD');
        if (panelSet.has(weekKey)) {
          const list = map.get(weekKey);
          if (list) {
            list.push(event);
          } else {
            map.set(weekKey, [event]);
          }
        }
        cursor = cursor.add(1, 'week');
      }
    }

    return map;
  }, [events, panels, weekStartsOn]);

  return (
    <FlatList
      horizontal
      pagingEnabled
      data={panels}
      keyExtractor={(item) => item}
      initialScrollIndex={HALF_PANEL_LENGTH}
      getItemLayout={(_data, index) => ({
        length: width,
        offset: width * index,
        index,
      })}
      renderItem={({ item }) => (
        <WeekPanel
          weekKey={item}
          width={width}
          resources={resources}
          events={eventsByWeek.get(item) ?? EMPTY_EVENTS}
          eventHeight={eventHeight}
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
          dateCellContainerStyle={dateCellContainerStyle}
          cellContainerStyle={cellContainerStyle}
          renderDateLabel={renderDateLabel}
          renderResourceNameLabel={renderResourceNameLabel}
          onRefresh={onRefresh}
          refreshing={refreshing}
          bottomSpacing={bottomSpacing}
          fixedRowCount={fixedRowCount}
        />
      )}
      onMomentumScrollEnd={(e) => {
        const scrollX = e.nativeEvent.contentOffset.x;
        const newIndex = Math.round(scrollX / width);
        setActiveIndex(newIndex);
        const weekKey = panels[newIndex];
        if (weekKey) {
          onChangeDate?.(dayjs(weekKey).toDate());
        }
      }}
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      windowSize={5}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      removeClippedSubviews={false}
    />
  );
};
