import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { CalendarEvent } from '../../../types/month-calendar';
import { EVENT_GAP } from '../../../constants/size';

export const MonthCalendarEvent = (props: {
  event: CalendarEvent;
  width: number;
  height: number;
  isPrevDateEvent: boolean;
  isLastEvent: boolean;
  onPressEvent?: (event: CalendarEvent) => void;
}) => {
  const { event, width, height, isPrevDateEvent, isLastEvent, onPressEvent } =
    props;
  return (
    <TouchableOpacity
      style={[
        styles.event,
        {
          backgroundColor: event.backgroundColor,
          borderColor: event.borderColor,
          width: width,
          height: height,
        },
        isPrevDateEvent ? styles.prevDateEvent : {},
        isLastEvent ? styles.lastRowEvent : {},
      ]}
      onPress={() => {
        onPressEvent?.(event);
      }}
    >
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[styles.eventTitle, { color: event.color }]}
      >
        {event.title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  event: {
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.1)',
    marginTop: EVENT_GAP,
    marginLeft: EVENT_GAP,
  },
  prevDateEvent: {
    marginLeft: -1,
    borderTopStartRadius: 0,
    borderBottomStartRadius: 0,
  },
  lastRowEvent: {
    marginBottom: EVENT_GAP,
  },
  eventTitle: {
    fontSize: 10,
  },
});
