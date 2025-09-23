class MonthCalendarEventPosition {
  public record: Record<string, Record<string, number[]>> = {};
  constructor() {}

  private generateKey(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  }

  public push(arg: {
    weekId: string;
    startDate: Date;
    days: number;
    rowNum: number;
  }) {
    const { weekId, startDate, days, rowNum } = arg;

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const key = this.generateKey(date);
      if (!this.record[weekId]) {
        this.record[weekId] = {};
      }
      if (!this.record[weekId][key]) {
        this.record[weekId][key] = [];
      }
      this.record[weekId][key]?.push(rowNum);
    }
  }

  public getMaxRowNum(arg: { weekId: string; date: Date }): number {
    const { weekId, date } = arg;
    const key = this.generateKey(date);
    const resourceRecord = this.record[weekId];
    if (!resourceRecord) {
      return 0;
    }

    const indexes = resourceRecord[key];

    if (indexes === undefined || indexes.length === 0) {
      return 0;
    }

    return Math.max(...indexes);
  }

  public getRowNums(arg: { weekId: string; date: Date }): number[] {
    const { weekId, date } = arg;
    const key = this.generateKey(date);
    const resourceRecord = this.record[weekId];
    if (!resourceRecord) {
      return [];
    }
    if (!resourceRecord[key]) {
      return [];
    }
    return resourceRecord[key];
  }

  public resetResource(weekId: string) {
    this.record[weekId] = {};
  }
}
export default MonthCalendarEventPosition;
