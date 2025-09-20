import { monthlyEndDate, monthlyStartDate } from '../utility/functions';

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
    console.log();
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
    console.log();
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
