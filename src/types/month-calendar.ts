export type WeekStartsOn = 0 | 1;

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor: string;
  borderColor: string;
  color: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderWidth?: number;
  borderRadius?: number;
};

export type WeekdayNum = 0 | 1 | 2 | 3 | 4 | 5 | 6;
