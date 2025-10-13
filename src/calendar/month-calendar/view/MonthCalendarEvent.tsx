import { PanResponder, StyleSheet, Text } from 'react-native';
import type { CalendarEvent } from '../../../types/month-calendar';
import { EVENT_GAP } from '../../../constants/size';
import { useRef } from 'react';
import { View } from 'react-native';
import dayjs from 'dayjs';

export const MonthCalendarEvent = (props: {
  event: CalendarEvent;
  width: number;
  height: number;
  isPrevDateEvent: boolean;
  isLastEvent: boolean;
  onPressEvent?: (event: CalendarEvent) => void;
  setIsEventDragging?: (bool: boolean) => void;
  draggingEvent?: CalendarEvent | null;
  setDraggingEvent?: (event: CalendarEvent | null) => void;
  findDateFromPosition?: (x: number, y: number) => Date | null;
  calendarContainerRef?: React.RefObject<any>;
}) => {
  const {
    event,
    width,
    height,
    isPrevDateEvent,
    isLastEvent,
    onPressEvent,
    setIsEventDragging,
    draggingEvent,
    setDraggingEvent,
    findDateFromPosition,
    calendarContainerRef,
  } = props;

  const touchStartTime = useRef(0);
  const dragStartDate = useRef<Date | null>(null);
  const currentOverDate = useRef<Date | null>(null);
  const isDragging = useRef(false);
  const dragStartTimer = useRef<NodeJS.Timeout | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt, _gestureState) => {
        touchStartTime.current = Date.now();

        calendarContainerRef?.current?.measureInWindow(
          (containerX: number, containerY: number) => {
            const tapX = evt.nativeEvent.pageX;
            const tapY = evt.nativeEvent.pageY;

            const relativeX = tapX - containerX;
            const relativeY = tapY - containerY;
            dragStartTimer.current = setTimeout(() => {
              dragStartDate.current =
                findDateFromPosition?.(relativeX, relativeY) ?? null;
              currentOverDate.current = dragStartDate.current;
              isDragging.current = true;

              setDraggingEvent?.(event);
              setIsEventDragging?.(true);
            }, 500);
          }
        );
      },

      onPanResponderMove: (evt, gestureState) => {
        const dx = gestureState.dx;
        const dy = gestureState.dy;
        const move = Math.sqrt(dx ** 2 + dy ** 2);
        if (dragStartTimer.current && move > 1) {
          clearTimeout(dragStartTimer.current);
          dragStartTimer.current = null;
        }

        if (!isDragging.current) {
          return;
        }

        calendarContainerRef?.current?.measureInWindow(
          (containerX: number, containerY: number) => {
            const overX = evt.nativeEvent.pageX;
            const overY = evt.nativeEvent.pageY;

            const relativeX = overX - containerX;
            const relativeY = overY - containerY;

            const overDate = findDateFromPosition?.(relativeX, relativeY);
            if (overDate && overDate !== currentOverDate.current) {
              const diff = dayjs(overDate).diff(
                dayjs(dragStartDate.current),
                'day'
              );
              const newStart = dayjs(event.start).add(diff, 'days').toDate();
              const newEnd = dayjs(event.end).add(diff, 'days').toDate();
              setDraggingEvent?.({
                ...event,
                start: newStart,
                end: newEnd,
              });
            }
            currentOverDate.current = overDate ?? null;
          }
        );
      },

      onPanResponderRelease: (evt, gestureState) => {
        if (dragStartTimer.current) {
          clearTimeout(dragStartTimer.current);
          dragStartTimer.current = null;
        }

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
        touchStartTime.current = 0;
        isDragging.current = false;
        dragStartDate.current = null;
        currentOverDate.current = null;
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
        event.id === draggingEvent?.id ? styles.draggingEvent : {},
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
  draggingEvent: {
    opacity: 0.5,
  },
  eventTitle: {
    fontSize: 10,
  },
});
