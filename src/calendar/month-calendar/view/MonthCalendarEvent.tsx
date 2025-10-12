import { PanResponder, StyleSheet, Text } from 'react-native';
import type { CalendarEvent } from '../../../types/month-calendar';
import { EVENT_GAP } from '../../../constants/size';
import { useRef } from 'react';
import { View } from 'react-native';

export const MonthCalendarEvent = (props: {
  event: CalendarEvent;
  width: number;
  height: number;
  isPrevDateEvent: boolean;
  isLastEvent: boolean;
  onPressEvent?: (event: CalendarEvent) => void;
  setIsEventDragging?: (bool: boolean) => void;
  setDraggingEvent?: (event: CalendarEvent | null) => void;
}) => {
  const {
    event,
    width,
    height,
    isPrevDateEvent,
    isLastEvent,
    onPressEvent,
    setIsEventDragging,
    setDraggingEvent,
  } = props;

  const touchStartTime = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt, _gestureState) => {
        touchStartTime.current = Date.now();
        setIsEventDragging?.(true);
        setDraggingEvent?.(event);
        console.log(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },

      onPanResponderMove: (_evt, gestureState) => {
        console.log(gestureState.dx, gestureState.dy);
      },

      onPanResponderRelease: (evt, gestureState) => {
        setIsEventDragging?.(false);
        setDraggingEvent?.(null);
        console.log(evt.nativeEvent.locationX, evt.nativeEvent.locationY);

        const touchDuration = Date.now() - touchStartTime.current;
        const moveDistance = Math.sqrt(
          gestureState.dx ** 2 + gestureState.dy ** 2
        );

        if (touchDuration < 200 && moveDistance < 10) {
          onPressEvent?.(event);
        }
      },
    })
  ).current;

  return (
    <View
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
      {...panResponder.panHandlers}
    >
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[styles.eventTitle, { color: event.color }]}
      >
        {event.title}
      </Text>
    </View>
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
