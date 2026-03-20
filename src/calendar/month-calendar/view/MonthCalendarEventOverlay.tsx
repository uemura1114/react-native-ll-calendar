import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

export type MonthCalendarEventOverlayPosition = Pick<
  ViewStyle,
  'top' | 'bottom' | 'left' | 'right'
>;

type MonthCalendarEventOverlayProps = {
  position: MonthCalendarEventOverlayPosition;
  children: ReactNode;
  style?: ViewStyle;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
};

/**
 * Use inside MonthCalendar’s `renderEventOverlay` to place content over an event
 * using top / right / bottom / left relative to the event row.
 */
export function MonthCalendarEventOverlay(
  props: MonthCalendarEventOverlayProps
) {
  return (
    <View
      pointerEvents={props.pointerEvents ?? 'box-none'}
      style={[styles.base, props.position, props.style]}
    >
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
  },
});
