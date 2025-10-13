import { StyleSheet, Text } from 'react-native';
import type { CalendarEvent } from '../../../types/month-calendar';
import { CELL_BORDER_WIDTH, EVENT_GAP } from '../../../constants/size';
import { View } from 'react-native';
import dayjs from 'dayjs';

export const MonthCalendarDraggingEvent = (props: {
  month: string;
  date: Date;
  event: CalendarEvent;
  height: number;
  dateColumnWidth: number;
  dateIndex: number;
  findPositionFromDate: (
    date: Date,
    month: string
  ) => {
    x: number;
    y: number;
  } | null;
}) => {
  const {
    month,
    date,
    event,
    height,
    dateColumnWidth,
    dateIndex,
    findPositionFromDate,
  } = props;

  const startDjs = dateIndex === 0 ? dayjs(date) : dayjs(event.start);
  const endDjs = dayjs(event.end);
  const diffDays = endDjs.startOf('day').diff(startDjs.startOf('day'), 'day');
  const isPrevDateEvent =
    dateIndex === 0 && dayjs(event.start).isBefore(dayjs(date));
  let width =
    (diffDays + 1) * dateColumnWidth - EVENT_GAP * 2 - CELL_BORDER_WIDTH * 2;

  if (isPrevDateEvent) {
    width += EVENT_GAP + 1;
  }

  const position = findPositionFromDate(date, month);

  if (position === null) {
    return null;
  }

  return (
    <View
      style={[
        styles.event,
        { top: position.y, left: position.x },
        {
          backgroundColor: event.backgroundColor,
          borderColor: event.borderColor,
          width: width,
          height: height,
        },
        isPrevDateEvent ? styles.prevDateEvent : {},
      ]}
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
    position: 'absolute',
    zIndex: 999,
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
