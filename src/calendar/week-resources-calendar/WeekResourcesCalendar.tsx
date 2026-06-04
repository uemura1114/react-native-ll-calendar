import { FlatList, useWindowDimensions } from 'react-native';
import dayjs from 'dayjs';
import { useState } from 'react';
import type { WeekStartsOn } from '../../types/month-calendar';
import type {
  CalendarResource,
  CalendarEvent,
} from '../../types/resources-calendar';
import { WeekPanel } from './WeekPanel';

const HALF_PANEL_LENGTH = 120;

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
}: WeekResourcesCalendarProps) => {
  const [_activeIndex, setActiveIndex] = useState(HALF_PANEL_LENGTH);
  const { width } = useWindowDimensions();

  const startOfDefaultWeek = getWeekStart(defaultDate, weekStartsOn);

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

  const panels: string[] = [
    ...prevPanels,
    startOfDefaultWeek.format('YYYY-MM-DD'),
    ...nextPanels,
  ];

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
          events={events}
          eventHeight={eventHeight}
          onPressCell={onPressCell}
          onLongPressCell={onLongPressCell}
          delayLongPressCell={delayLongPressCell}
          onPressEvent={onPressEvent}
          onLongPressEvent={onLongPressEvent}
          delayLongPressEvent={delayLongPressEvent}
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
