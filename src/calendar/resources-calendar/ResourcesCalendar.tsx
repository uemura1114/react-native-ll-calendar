import React from 'react';
import type {
  CalendarEvent,
  CalendarResource,
} from '../../types/resources-calendar';

type ResourcesCalendarProps = {
  fromDate: Date;
  toDate: Date;
  resources: CalendarResource[];
  events: CalendarEvent[];
  renderDateLabel?: (date: Date) => React.JSX.Element;
  renderResourceNameLabel?: (resource: CalendarResource) => React.JSX.Element;
  resourceColumnWidth?: number;
  dateColumnWidth?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export function ResourcesCalendar(_props: ResourcesCalendarProps) {
  return null;
}
