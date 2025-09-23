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
  const { events, weekStartsOn } = props;

  const eventsGroupByWeekId: Record<string, CalendarEvent[]> = useMemo(() => {
    const groupedEvents: Record<string, CalendarEvent[]> = {};

    events.forEach((event) => {
      const weekIds: string[] = getWeekIds({
        start: event.start,
        end: event.end,
        weekStartsOn,
      });
      weekIds.forEach((weekId) => {
        if (!groupedEvents[weekId]) {
          groupedEvents[weekId] = [];
        }
        groupedEvents[weekId].push(event);
      });
    });

    return groupedEvents;
  }, [events, weekStartsOn]);

  return { eventsGroupByWeekId };
};
