import { useWindowDimensions, FlatList } from 'react-native';
import { MonthCalendarViewItem } from './view/MonthCalendarViewItem';
import dayjs from 'dayjs';

export type WeekStartsOn = 0 | 1;

const HALF_PANEL_LENGTH = 100;

export const MonthCalendar = (props: {
  date: Date;
  defaultDate?: Date;
  weekStartsOn?: WeekStartsOn;
}) => {
  const { date, defaultDate = date, weekStartsOn = 0 } = props;

  const defaultDateDjs = dayjs(defaultDate);
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
        console.log('newIndex', newIndex);
      }}
      initialScrollIndex={100}
      decelerationRate={'fast'}
      data={panels}
      renderItem={({ item }) => {
        return (
          <MonthCalendarViewItem month={item} weekStartsOn={weekStartsOn} />
        );
      }}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={true}
    />
  );
};
