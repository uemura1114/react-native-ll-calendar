import dayjs from 'dayjs';
import type { WeekStartsOn } from '../types/month-calendar';

export function monthlyStartDate(args: {
  date: Date;
  weekStartsOn: WeekStartsOn;
}) {
  const { date, weekStartsOn } = args;
  const djs = dayjs(date);
  if (weekStartsOn === 0) {
    return djs.startOf('month').startOf('week').toDate();
  } else {
    const startOfMonth = djs.startOf('month');
    if (startOfMonth.day() === 1) {
      return startOfMonth.toDate();
    } else if (startOfMonth.day() === 0) {
      return startOfMonth.subtract(6, 'day').toDate();
    } else {
      return startOfMonth.subtract(startOfMonth.day() - 1, 'day').toDate();
    }
  }
}

export function monthlyEndDate(args: {
  date: Date;
  weekStartsOn: WeekStartsOn;
}) {
  const { date, weekStartsOn } = args;
  const djs = dayjs(date);
  if (weekStartsOn === 0) {
    return djs.endOf('month').endOf('week').toDate();
  } else {
    const endOfMonth = djs.endOf('month');
    if (endOfMonth.day() === 0) {
      return endOfMonth.toDate();
    } else {
      return endOfMonth.add(7 - endOfMonth.day(), 'day').toDate();
    }
  }
}

export function getWeekIds(args: {
  start: Date;
  end: Date;
  weekStartsOn: WeekStartsOn;
}) {
  const { start, end, weekStartsOn } = args;
  const startDjs = dayjs(start).startOf('day');
  const endDjs = getLastDay(start, end);
  const weekIds: string[] = [];
  let current = startDjs;
  if (weekStartsOn === 0) {
    while (current.isSame(endDjs) || current.isBefore(endDjs)) {
      const weekId = current.startOf('week').format('YYYY-MM-DD');
      if (!weekIds.includes(weekId)) {
        weekIds.push(weekId);
      }
      current = current.add(1, 'day');
    }
  } else {
    while (current.isSame(endDjs) || current.isBefore(endDjs)) {
      if (current.day() === 0) {
        const weekId = current.subtract(6, 'day').format('YYYY-MM-DD');
        if (!weekIds.includes(weekId)) {
          weekIds.push(weekId);
        }
      } else {
        const weekId = current
          .subtract(current.day() - 1, 'day')
          .format('YYYY-MM-DD');
        if (!weekIds.includes(weekId)) {
          weekIds.push(weekId);
        }
      }
      current = current.add(1, 'day');
    }
  }
  return weekIds;
}

export function isOnDayBoundary(djs: dayjs.Dayjs): boolean {
  return (
    djs.hour() === 0 &&
    djs.minute() === 0 &&
    djs.second() === 0 &&
    djs.millisecond() === 0
  );
}

/**
 * Returns the start of the last day an event occupies.
 * An event ending exactly at 00:00 does not occupy that day (same as calcDiffDays),
 * except for a zero-length event.
 */
export function getLastDay(start: Date, end: Date): dayjs.Dayjs {
  const endDjs = dayjs(end);
  if (isOnDayBoundary(endDjs) && endDjs.isAfter(dayjs(start))) {
    return endDjs.subtract(1, 'day').startOf('day');
  }
  return endDjs.startOf('day');
}

export function calcDiffDays(
  endDjs: dayjs.Dayjs,
  startDjs: dayjs.Dayjs
): number {
  return Math.max(
    0,
    endDjs.startOf('day').diff(startDjs.startOf('day'), 'day') -
      (isOnDayBoundary(endDjs) ? 1 : 0)
  );
}

export function generateDates(from: Date, to: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(from);
  current.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

type MonthGroup = {
  year: number;
  month: number;
  dates: Date[];
};

export function groupDatesByMonth(dates: Date[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const date of dates) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const last = groups[groups.length - 1];
    if (last && last.year === year && last.month === month) {
      last.dates.push(date);
    } else {
      groups.push({ year, month, dates: [date] });
    }
  }
  return groups;
}
