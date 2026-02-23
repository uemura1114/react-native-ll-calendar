class ResourcesCalendarEventPosition {
  public record: Record<string, Record<string, number[]>> = {};
  constructor() {}

  private generateKey(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  }

  public push(arg: {
    resourceId: string;
    startDate: Date;
    days: number;
    rowNum: number;
  }) {
    const { resourceId, startDate, days, rowNum } = arg;

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const key = this.generateKey(date);
      if (!this.record[resourceId]) {
        this.record[resourceId] = {};
      }
      if (!this.record[resourceId][key]) {
        this.record[resourceId][key] = [];
      }
      this.record[resourceId][key]?.push(rowNum);
    }
  }

  public getMaxRowNum(arg: { resourceId: string; date: Date }): number {
    const { resourceId, date } = arg;
    const key = this.generateKey(date);
    const resourceRecord = this.record[resourceId];
    if (!resourceRecord) {
      return 0;
    }

    const indexes = resourceRecord[key];

    if (indexes === undefined || indexes.length === 0) {
      return 0;
    }

    return Math.max(...indexes);
  }

  public getRowNums(arg: { resourceId: string; date: Date }): number[] {
    const { resourceId, date } = arg;
    const key = this.generateKey(date);
    const resourceRecord = this.record[resourceId];
    if (!resourceRecord) {
      return [];
    }
    if (!resourceRecord[key]) {
      return [];
    }
    return resourceRecord[key];
  }

  public reset(resourceId: string) {
    this.record[resourceId] = {};
  }
}
export default ResourcesCalendarEventPosition;
