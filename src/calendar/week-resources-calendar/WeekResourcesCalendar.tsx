import {
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import dayjs from 'dayjs';
import { useState } from 'react';
import type { WeekStartsOn } from '../../types/month-calendar';

const HALF_PANEL_LENGTH = 120;

type WeekResourcesCalendarProps = {
  defaultDate: Date;
  weekStartsOn?: WeekStartsOn;
  onChangeDate?: (date: Date) => void;
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

type WeekPanelProps = {
  weekKey: string;
  width: number;
};

function WeekPanel({ weekKey, width }: WeekPanelProps) {
  const startDjs = dayjs(weekKey);
  const endDjs = startDjs.add(6, 'day');

  return (
    <View style={[styles.panel, { width }]}>
      <Text style={styles.dateText}>{startDjs.format('YYYY/MM/DD')}</Text>
      <Text style={styles.separator}>〜</Text>
      <Text style={styles.dateText}>{endDjs.format('YYYY/MM/DD')}</Text>
    </View>
  );
}

export const WeekResourcesCalendar = ({
  defaultDate,
  weekStartsOn = 0,
  onChangeDate,
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
      renderItem={({ item }) => <WeekPanel weekKey={item} width={width} />}
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

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
  },
  separator: {
    fontSize: 14,
    color: '#888',
  },
});
