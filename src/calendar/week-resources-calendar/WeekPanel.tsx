import { ScrollView, StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';
import type { CalendarResource } from '../../types/resources-calendar';

export const CELL_BORDER_WIDTH = 0.5;
export const BORDER_COLOR = 'lightslategrey';

export type WeekPanelProps = {
  weekKey: string;
  width: number;
  resources: CalendarResource[];
};

export function WeekPanel({ weekKey, width, resources }: WeekPanelProps) {
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

const styles = StyleSheet.create({
  panel: {
    flex: 1,
  },
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
});
