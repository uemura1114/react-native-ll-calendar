import { useWindowDimensions, FlatList } from 'react-native';
import { MonthCalendarViewItem } from './view/MonthCalendarViewItem';
import dayjs from 'dayjs';
import { useState } from 'react';

export type WeekStartsOn = 0 | 1;

const HALF_PANEL_LENGTH = 120; // 10 years

export const MonthCalendar = (props: {
  defaultDate: Date;
  weekStartsOn?: WeekStartsOn;
  onChangeDate?: (date: Date) => void;
}) => {
  const { defaultDate, weekStartsOn = 0, onChangeDate } = props;
  const [dateState] = useState(defaultDate);
  const [_activeIndex, setActiveIndex] = useState(HALF_PANEL_LENGTH);
  const defaultDateDjs = dayjs(dateState);
  const startOfDefaultDateDjs = defaultDateDjs.startOf('month');
  const prevPanels: string[] = Array.from(
    { length: HALF_PANEL_LENGTH },
    (_, i) => {
      return startOfDefaultDateDjs
        .subtract(HALF_PANEL_LENGTH - i, 'month')
        .format('YYYY-MM');
    }
  );
  const nextPanels: string[] = Array.from(
    { length: HALF_PANEL_LENGTH },
    (_, i) => {
      return startOfDefaultDateDjs.add(i + 1, 'month').format('YYYY-MM');
    }
  );
  const panels: string[] = [
    ...prevPanels,
    startOfDefaultDateDjs.format('YYYY-MM'),
    ...nextPanels,
  ];

  const { width } = useWindowDimensions();

  return (
    <FlatList
      horizontal
      pagingEnabled={true}
      getItemLayout={(_data, index) => {
        return {
          length: width,
          offset: width * index,
          index,
        };
      }}
      onMomentumScrollEnd={(e) => {
        const scrollX = e.nativeEvent.contentOffset.x;
        const newIndex = Math.round(scrollX / width);
        const month = panels[newIndex];
        if (month) {
          const newDate = new Date(month);
          onChangeDate?.(newDate);
        }
        setActiveIndex(newIndex);
      }}
      initialScrollIndex={HALF_PANEL_LENGTH}
      decelerationRate={'fast'}
      data={panels}
      renderItem={({ item }) => {
        return (
          <MonthCalendarViewItem month={item} weekStartsOn={weekStartsOn} />
        );
      }}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={true}
      windowSize={5}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
    />
  );
};
