import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import dayjs from 'dayjs';
import { useState } from 'react';
import type { WeekStartsOn } from '../../types/month-calendar';
import type { CalendarResource } from '../../types/resources-calendar';

const HALF_PANEL_LENGTH = 120;
const CELL_BORDER_WIDTH = 0.5;
const BORDER_COLOR = 'lightslategrey';

type WeekResourcesCalendarProps = {
  defaultDate: Date;
  weekStartsOn?: WeekStartsOn;
  onChangeDate?: (date: Date) => void;
  resources: CalendarResource[];
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
  resources: CalendarResource[];
};

function WeekPanel({ weekKey, width, resources }: WeekPanelProps) {
  const columnWidth = width / 8;
  const startDjs = dayjs(weekKey);
  const days = Array.from({ length: 7 }, (_, i) => startDjs.add(i, 'day'));

  return (
    <View style={[styles.panel, { width }]}>
      {/* ヘッダー行（固定） */}
      <View style={styles.headerRow}>
        <View
          style={[
            styles.headerCell,
            styles.resourceNameHeaderCell,
            { width: columnWidth },
          ]}
        />
        {days.map((day) => (
          <View
            key={day.format('YYYY-MM-DD')}
            style={[styles.headerCell, { width: columnWidth }]}
          >
            <Text style={styles.headerDayOfWeekText}>{day.format('ddd')}</Text>
            <Text style={styles.headerDateText}>{day.format('M/D')}</Text>
          </View>
        ))}
      </View>

      {/* リソース行（縦スクロール） */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {resources.map((resource) => (
          <View key={resource.id} style={styles.resourceRow}>
            <View style={[styles.resourceNameCell, { width: columnWidth }]}>
              <Text style={styles.resourceNameText} numberOfLines={2}>
                {resource.name}
              </Text>
            </View>
            {days.map((day) => (
              <View
                key={day.format('YYYY-MM-DD')}
                style={[styles.dayCell, { width: columnWidth }]}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export const WeekResourcesCalendar = ({
  defaultDate,
  weekStartsOn = 0,
  onChangeDate,
  resources,
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
        <WeekPanel weekKey={item} width={width} resources={resources} />
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

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderBottomColor: BORDER_COLOR,
  },
  headerCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: BORDER_COLOR,
  },
  resourceNameHeaderCell: {
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: BORDER_COLOR,
  },
  headerDayOfWeekText: {
    fontSize: 11,
    color: '#666',
  },
  headerDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
  },
  resourceRow: {
    flexDirection: 'row',
    minHeight: 48,
    borderBottomWidth: CELL_BORDER_WIDTH,
    borderBottomColor: BORDER_COLOR,
    backgroundColor: 'white',
  },
  resourceNameCell: {
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: BORDER_COLOR,
    backgroundColor: '#fafafa',
  },
  resourceNameText: {
    fontSize: 11,
    color: '#333',
  },
  dayCell: {
    borderRightWidth: CELL_BORDER_WIDTH,
    borderRightColor: BORDER_COLOR,
    minHeight: 48,
  },
  panel: {
    flex: 1,
  },
});
