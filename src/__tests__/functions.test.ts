import dayjs from 'dayjs';
import {
  monthlyStartDate,
  monthlyEndDate,
  getWeekIds,
  calcDiffDays,
} from '../utils/functions';

describe('monthlyStartDate', () => {
  it('should return the start of the week for the month when weekStartsOn is 0 (Sunday)', () => {
    const date = new Date('2025-09-15');
    const result = monthlyStartDate({ date, weekStartsOn: 0 });

    const expected = new Date('2025-08-31');
    expect(result.toDateString()).toBe(expected.toDateString());
  });

  it('should return the correct date when weekStartsOn is 1 (Monday)', () => {
    const date = new Date('2025-09-15');
    const result = monthlyStartDate({ date, weekStartsOn: 1 });
    const expected = new Date('2025-09-01');
    expect(result.toDateString()).toBe(expected.toDateString());
  });

  it('should handle month starting on Sunday with weekStartsOn 1', () => {
    const date = new Date('2025-06-15');
    const result = monthlyStartDate({ date, weekStartsOn: 1 });
    const expected = new Date('2025-05-26');
    expect(result.toDateString()).toBe(expected.toDateString());
  });

  it('should handle month starting on Monday with weekStartsOn 0', () => {
    const date = new Date('2025-09-15');
    const result = monthlyStartDate({ date, weekStartsOn: 0 });
    const expected = new Date('2025-08-31');
    expect(result.toDateString()).toBe(expected.toDateString());
  });
});

describe('monthlyEndDate', () => {
  it('should return the start of the week for the month when weekStartsOn is 0 (Sunday)', () => {
    const date = new Date('2025-09-15');
    const result = monthlyEndDate({ date, weekStartsOn: 0 });

    const expected = new Date('2025-10-04');
    expect(result.toDateString()).toBe(expected.toDateString());
  });

  it('should return the correct date when weekStartsOn is 1 (Monday)', () => {
    const date = new Date('2025-09-15');
    const result = monthlyEndDate({ date, weekStartsOn: 1 });
    const expected = new Date('2025-10-05');
    expect(result.toDateString()).toBe(expected.toDateString());
  });

  it('should handle January month end with weekStartsOn 0', () => {
    const date = new Date('2025-01-15');
    const result = monthlyEndDate({ date, weekStartsOn: 0 });
    const expected = new Date('2025-02-01');
    expect(result.toDateString()).toBe(expected.toDateString());
  });

  it('should handle January month end with weekStartsOn 1', () => {
    const date = new Date('2025-01-15');
    const result = monthlyEndDate({ date, weekStartsOn: 1 });
    const expected = new Date('2025-02-02');
    expect(result.toDateString()).toBe(expected.toDateString());
  });
});

describe('getWeekIds', () => {
  it('should not include the next week when the event ends exactly at 00:00 of the first day of the week (weekStartsOn 1)', () => {
    // Sun 2026-11-22 22:00 - Mon 2026-11-23 00:00
    const start = new Date(2026, 10, 22, 22, 0);
    const end = new Date(2026, 10, 23, 0, 0);
    expect(getWeekIds({ start, end, weekStartsOn: 1 })).toEqual(['2026-11-16']);
  });

  it('should not include the next week when the event ends exactly at 00:00 of the first day of the week (weekStartsOn 0)', () => {
    // Sat 2026-11-21 22:00 - Sun 2026-11-22 00:00
    const start = new Date(2026, 10, 21, 22, 0);
    const end = new Date(2026, 10, 22, 0, 0);
    expect(getWeekIds({ start, end, weekStartsOn: 0 })).toEqual(['2026-11-15']);
  });

  it('should include the next week when the event ends after 00:00 of the first day of the week', () => {
    const start = new Date(2026, 10, 22, 22, 0);
    const end = new Date(2026, 10, 23, 0, 1);
    expect(getWeekIds({ start, end, weekStartsOn: 1 })).toEqual([
      '2026-11-16',
      '2026-11-23',
    ]);
  });

  it('should keep the day of a zero-length event at 00:00', () => {
    const start = new Date(2026, 10, 23, 0, 0);
    const end = new Date(2026, 10, 23, 0, 0);
    expect(getWeekIds({ start, end, weekStartsOn: 1 })).toEqual(['2026-11-23']);
  });
});

describe('calcDiffDays', () => {
  it('should treat an end exactly at 00:00 as the previous day', () => {
    const start = dayjs(new Date(2026, 10, 22, 22, 0));
    const end = dayjs(new Date(2026, 10, 23, 0, 0));
    expect(calcDiffDays(end, start)).toBe(0);
  });

  it('should count the next day when the end is after 00:00', () => {
    const start = dayjs(new Date(2026, 10, 22, 22, 0));
    const end = dayjs(new Date(2026, 10, 23, 0, 1));
    expect(calcDiffDays(end, start)).toBe(1);
  });
});
