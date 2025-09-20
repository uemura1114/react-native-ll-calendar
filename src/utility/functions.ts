import dayjs from 'dayjs';

export function monthlyStartDate(args: { date: Date; weekStartsOn: 0 | 1 }) {
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

export function monthlyEndDate(args: { date: Date; weekStartsOn: 0 | 1 }) {
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
