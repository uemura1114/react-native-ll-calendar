import { useMemo } from 'react';
import type {
  CalendarEvent,
  WeekStartsOn,
} from '../../../types/month-calendar';
import { getWeekIds } from '../../../utils/functions';

export const useEvents = (props: {
  events: CalendarEvent[];
  weekStartsOn: WeekStartsOn;
}) => {
  const eventsGroupByWeekId: Record<string, CalendarEvent[]> = useMemo(() => {
    const groupedEvents: Record<string, CalendarEvent[]> = {};

    props.events.forEach((event) => {
      const weekIds: string[] = getWeekIds({
        start: event.start,
        end: event.end,
        weekStartsOn: props.weekStartsOn,
      });
      weekIds.forEach((weekId) => {
        if (!groupedEvents[weekId]) {
          groupedEvents[weekId] = [];
        }
        groupedEvents[weekId].push(event);
      });
    });

    return groupedEvents;
  }, [props.events, props.weekStartsOn]);

  return { eventsGroupByWeekId };
};
