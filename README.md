# react-native-ll-calendar

A horizontally scrollable monthly calendar component for React Native with event support.

<img src="assets/screen-shot.png" width="320px">

## Installation

```sh
npm install react-native-ll-calendar
```

or

```sh
yarn add react-native-ll-calendar
```

## Usage

```tsx
import { MonthCalendar, CalendarEvent } from 'react-native-ll-calendar';

const events: CalendarEvent[] = [
  {
    id: '1',
    title: 'Meeting',
    start: new Date(2025, 9, 5),
    end: new Date(2025, 9, 5),
    backgroundColor: '#ff6b6b',
    borderColor: '#e55353',
    color: '#0e0e0e',
  },
  {
    id: '2',
    title: 'Conference',
    start: new Date(2025, 9, 10),
    end: new Date(2025, 9, 12),
    backgroundColor: '#4ecdc4',
    borderColor: '#45b7aa',
    color: '#0e0e0e',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderRadius: 8,
  },
];

function App() {
  const [date, setDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Fetch new events or data
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <MonthCalendar
      defaultDate={date}
      weekStartsOn={1}
      onChangeDate={(newDate) => setDate(newDate)}
      events={events}
      onPressEvent={(event) => console.log('Event pressed:', event.title)}
      onLongPressEvent={(event) => console.log('Event long pressed:', event.title)}
      delayLongPressEvent={500}
      onPressCell={(date) => console.log('Cell pressed:', date)}
      onLongPressCell={(date) => console.log('Cell long pressed:', date)}
      delayLongPressCell={500}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      todayCellTextStyle={{ fontWeight: 'bold', color: '#007AFF' }}
      dayCellTextStyle={(date) => ({
        color: date.getDay() === 0 ? '#FF3B30' : '#000000',
      })}
      stickyHeaderEnabled={true}
      cellBorderColor="#CCCCCC"
    />
  );
}
```

## API

### MonthCalendar Props

| Prop                        | Type                                    | Required | Default | Description                                |
| --------------------------- | --------------------------------------- | -------- | ------- | ------------------------------------------ |
| `defaultDate`               | `Date`                                  | Yes      | -       | Initial date to display                    |
| `weekStartsOn`              | `0 \| 1`                                | No       | `0`     | Week start day (0 = Sunday, 1 = Monday)    |
| `onChangeDate`              | `(date: Date) => void`                  | No       | -       | Callback when month changes                |
| `events`                    | `CalendarEvent[]`                       | Yes      | -       | Array of calendar events                   |
| `onPressEvent`              | `(event: CalendarEvent) => void`        | No       | -       | Callback when event is pressed             |
| `onLongPressEvent`          | `(event: CalendarEvent) => void`        | No       | -       | Callback when event is long pressed        |
| `delayLongPressEvent`       | `number`                                | No       | -       | Delay in ms before long press is triggered |
| `onPressCell`               | `(date: Date) => void`                  | No       | -       | Callback when date cell is pressed         |
| `onLongPressCell`           | `(date: Date) => void`                  | No       | -       | Callback when date cell is long pressed    |
| `delayLongPressCell`        | `number`                                | No       | -       | Delay in ms before long press is triggered |
| `onRefresh`                 | `() => void`                            | No       | -       | Callback for pull-to-refresh               |
| `refreshing`                | `boolean`                               | No       | -       | Whether the calendar is refreshing         |
| `dayCellContainerStyle`     | `(date: Date) => ViewStyle`             | No       | -       | Style function for day cell container      |
| `dayCellTextStyle`          | `(date: Date) => TextStyle`             | No       | -       | Style function for day cell text           |
| `todayCellTextStyle`        | `TextStyle`                             | No       | -       | Style for today's cell text                |
| `locale`                    | `ILocale`                               | No       | -       | Locale configuration for date formatting   |
| `weekdayCellContainerStyle` | `(weekDayNum: WeekdayNum) => ViewStyle` | No       | -       | Style function for weekday cell container  |
| `weekdayCellTextStyle`      | `(weekDayNum: WeekdayNum) => TextStyle` | No       | -       | Style function for weekday cell text       |
| `hiddenMonth`               | `boolean`                               | No       | `false` | Hide month header display                  |
| `monthFormat`               | `string`                                | No       | -       | Custom format string for month display     |
| `stickyHeaderEnabled`       | `boolean`                               | No       | `false` | Enable sticky headers for month and week   |
| `cellBorderColor`           | `string`                                | No       | `'lightslategrey'` | Color for calendar cell borders |
| `allowFontScaling`          | `boolean`                               | No       | -       | Enable font scaling for text elements      |
| `eventHeight`               | `number`                                | No       | `26`    | Height of event items in pixels            |
| `eventTextStyle`            | `(event: CalendarEvent) => TextStyle`   | No       | -       | Style function for event text              |

### CalendarEvent

| Property          | Type                                    | Required | Description                    |
| ----------------- | --------------------------------------- | -------- | ------------------------------ |
| `id`              | `string`                                | Yes      | Unique identifier              |
| `title`           | `string`                                | Yes      | Event title                    |
| `start`           | `Date`                                  | Yes      | Start date                     |
| `end`             | `Date`                                  | Yes      | End date                       |
| `backgroundColor` | `string`                                | Yes      | Background color               |
| `borderColor`     | `string`                                | Yes      | Border color                   |
| `color`           | `string`                                | Yes      | Text color                     |
| `borderStyle`     | `'solid' \| 'dashed' \| 'dotted'`       | No       | Border style                   |
| `borderWidth`     | `number`                                | No       | Border width                   |
| `borderRadius`    | `number`                                | No       | Border radius                  |

## Features

- Horizontally scrollable month view
- Multi-day event support
- Customizable event colors and border styles
- Event press handlers (tap and long press)
- Date cell press handlers (tap and long press)
- Configurable week start day (Sunday or Monday)
- Customizable styling for day cells, weekday cells, and today's cell
- Pull-to-refresh support
- Locale support for internationalization
- Optional month header visibility control
- Custom month format display
- Sticky header support for month and week rows
- Customizable cell border colors
- Font scaling control for text elements
- Customizable event height and text styles
- Spans 10 years before and after the default date

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
