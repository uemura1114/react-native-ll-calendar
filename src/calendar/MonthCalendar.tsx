import { useWindowDimensions, FlatList } from 'react-native';
import { MonthCalendarViewItem } from './view/MonthCalendarViewItem';
import dayjs from 'dayjs';
import { monthlyStartDate, monthlyEndDate } from '../utility/functions';

type WeekStartsOn = 0 | 1;

export const MonthCalendar = (props: {
  date: Date;
  weekStartsOn?: WeekStartsOn;
}) => {
  const { date, weekStartsOn = 0 } = props;
  const startDate = monthlyStartDate({ date, weekStartsOn });
  const endDate = monthlyEndDate({ date, weekStartsOn });
  const endDjs = dayjs(endDate);
  const rows: dayjs.Dayjs[][] = [];

  let currentDate = dayjs(startDate);
  while (currentDate.isBefore(endDjs)) {
    const row = Array.from({ length: 7 }, (_, i) => {
      return currentDate.add(i, 'day');
    });
    rows.push(row);
    currentDate = currentDate.add(7, 'day');
  }

  const { width } = useWindowDimensions();

  return (
    <FlatList
      horizontal
      pagingEnabled={true}
      snapToInterval={width}
      decelerationRate={'fast'}
      data={['', '', '', '', '', '', '', '', '', '', '', '']}
      renderItem={({}) => {
        return <MonthCalendarViewItem rows={rows} />;
      }}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={true}
    />
  );
};
