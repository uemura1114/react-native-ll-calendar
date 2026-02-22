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
  const endDjs = dayjs(end).startOf('day');
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
