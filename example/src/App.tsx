import dayjs from 'dayjs';
import ja from 'dayjs/locale/ja';
import { useCallback, useMemo, useRef, useState } from 'react';
import { type ViewStyle } from 'react-native';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import {
  MonthCalendar,
  ResourcesCalendar,
  type CalendarEvent,
  type ResourcesCalendarEvent,
  type CalendarResource,
} from 'react-native-ll-calendar';
import type { WeekdayNum } from '../../src/types/month-calendar';
import type { TextStyle } from 'react-native';
import type { MonthCalendarRef } from '../../src/calendar/month-calendar/MonthCalendar';

type TabType = 'month' | 'resources-fixed-column' | 'resources-inline-band';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('month');
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleChangeDate = useCallback((d: Date) => {
    setDate(d);
  }, []);

  const events: CalendarEvent[] = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return [
      {
        id: '1−1',
        title: '😃!Meeting',
        start: new Date(currentYear, currentMonth, 5, 22, 0),
        end: new Date(currentYear, currentMonth, 6, 1, 0),
        backgroundColor: '#ff6b6b',
        borderColor: '#000000',
        color: '#0e0e0e',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        id: '1-2',
        title: '😃Meeting',
        start: new Date(currentYear, currentMonth, 9, 22, 0),
        end: new Date(currentYear, currentMonth, 10, 1, 0),
        backgroundColor: '#ff6b6b',
        borderColor: '#e55353',
        color: '#0e0e0e',
      },
      {
        id: '1-3',
        title: '😃Meeting',
        start: new Date(currentYear, currentMonth, 6, 22, 0),
        end: new Date(currentYear, currentMonth, 7, 1, 0),
        backgroundColor: '#ff6b6b',
        borderColor: '#e55353',
        color: '#0e0e0e',
      },
      {
        id: '2',
        title: 'Conference',
        start: new Date(currentYear, currentMonth, 10),
        end: new Date(currentYear, currentMonth, 19),
        backgroundColor: '#4ecdc4',
        borderColor: '#45b7aa',
        color: '#0e0e0e',
      },
      {
        id: '3',
        title: 'Appointment',
        start: new Date(currentYear, currentMonth, 15),
        end: new Date(currentYear, currentMonth, 15),
        backgroundColor: '#45b7d1',
        borderColor: '#3a9bc1',
        color: '#0e0e0e',
      },
      {
        id: '4',
        title: 'Workshop',
        start: new Date(currentYear, currentMonth, 20),
        end: new Date(currentYear, currentMonth, 22),
        backgroundColor: '#96ceb4',
        borderColor: '#7fb069',
        color: '#0e0e0e',
      },
      {
        id: '5',
        title: 'Review',
        start: new Date(currentYear, currentMonth, 25),
        end: new Date(currentYear, currentMonth, 25),
        backgroundColor: '#ffeaa7',
        borderColor: '#fdcb6e',
        color: '#0e0e0e',
      },
      {
        id: '6',
        title: 'Vacation',
        start: new Date(currentYear, currentMonth, 28),
        end: new Date(currentYear, currentMonth + 1, 4),
        backgroundColor: '#dda0dd',
        borderColor: '#ba68c8',
        color: '#0e0e0e',
      },

      {
        id: '7',
        title: 'Training',
        start: new Date(currentYear, currentMonth - 1, 18),
        end: new Date(currentYear, currentMonth - 1, 20),
        backgroundColor: '#74b9ff',
        borderColor: '#0984e3',
        color: '#0e0e0e',
      },
      {
        id: '8',
        title: 'Birthday',
        start: new Date(currentYear, currentMonth - 1, 25),
        end: new Date(currentYear, currentMonth - 1, 25),
        backgroundColor: '#fd79a8',
        borderColor: '#e84393',
        color: '#0e0e0e',
      },
      {
        id: '9',
        title: 'Project Deadline',
        start: new Date(currentYear, currentMonth - 1, 30),
        end: new Date(currentYear, currentMonth, 1),
        backgroundColor: '#fdcb6e',
        borderColor: '#e17055',
        color: '#0e0e0e',
      },

      {
        id: '10-1',
        title: 'Seminar',
        start: new Date(currentYear, currentMonth + 1, 3),
        end: new Date(currentYear, currentMonth + 1, 10),
        backgroundColor: '#a29bfe',
        borderColor: '#6c5ce7',
        color: '#0e0e0e',
      },
      {
        id: '10-2',
        title: 'Seminar',
        start: new Date(currentYear, currentMonth + 1, 4),
        end: new Date(currentYear, currentMonth + 1, 9),
        backgroundColor: '#a29bfe',
        borderColor: '#6c5ce7',
        color: '#0e0e0e',
      },
      {
        id: '10-3',
        title: 'Seminar',
        start: new Date(currentYear, currentMonth + 1, 10),
        end: new Date(currentYear, currentMonth + 1, 10),
        backgroundColor: '#a29bfe',
        borderColor: '#6c5ce7',
        color: '#0e0e0e',
      },
      {
        id: '10-4',
        title: 'Seminar',
        start: new Date(currentYear, currentMonth + 1, 10),
        end: new Date(currentYear, currentMonth + 1, 10),
        backgroundColor: '#a29bfe',
        borderColor: '#6c5ce7',
        color: '#0e0e0e',
      },
      {
        id: '11',
        title: 'Team Lunch',
        start: new Date(currentYear, currentMonth + 1, 14),
        end: new Date(currentYear, currentMonth + 1, 14),
        backgroundColor: '#fd79a8',
        borderColor: '#e84393',
        color: '#0e0e0e',
      },
      {
        id: '12',
        title: 'Business Trip',
        start: new Date(currentYear, currentMonth + 1, 20),
        end: new Date(currentYear, currentMonth + 1, 23),
        backgroundColor: '#00b894',
        borderColor: '#00a085',
        color: '#0e0e0e',
      },
      {
        id: '13',
        title: 'Presentation',
        start: new Date(currentYear, currentMonth + 1, 28),
        end: new Date(currentYear, currentMonth + 1, 28),
        backgroundColor: '#fab1a0',
        borderColor: '#e17055',
        color: '#0e0e0e',
      },
      {
        id: '14',
        title: 'Event 1',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#ff6b6b',
        borderColor: '#e55353',
        color: '#0e0e0e',
      },
      {
        id: '15',
        title: 'Event 2',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#4ecdc4',
        borderColor: '#45b7aa',
        color: '#0e0e0e',
      },
      {
        id: '16',
        title: 'Event 3',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#45b7d1',
        borderColor: '#3a9bc1',
        color: '#0e0e0e',
      },
      {
        id: '17',
        title: 'Event 4',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#96ceb4',
        borderColor: '#7fb069',
        color: '#0e0e0e',
      },
      {
        id: '18',
        title: 'Event 5',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#ffeaa7',
        borderColor: '#fdcb6e',
        color: '#0e0e0e',
      },
      {
        id: '19',
        title: 'Event 6',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#dda0dd',
        borderColor: '#ba68c8',
        color: '#0e0e0e',
      },
      {
        id: '20',
        title: 'Event 7',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#74b9ff',
        borderColor: '#0984e3',
        color: '#0e0e0e',
      },
      {
        id: '21',
        title: 'Event 8',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#fd79a8',
        borderColor: '#e84393',
        color: '#0e0e0e',
      },
      {
        id: '22',
        title: 'Event 9',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#fdcb6e',
        borderColor: '#e17055',
        color: '#0e0e0e',
      },
      {
        id: '23',
        title: 'Event 10',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#a29bfe',
        borderColor: '#6c5ce7',
        color: '#0e0e0e',
      },
      {
        id: '24',
        title: 'Event 11',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#fd79a8',
        borderColor: '#e84393',
        color: '#0e0e0e',
      },
      {
        id: '25',
        title: 'Event 12',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#00b894',
        borderColor: '#00a085',
        color: '#0e0e0e',
      },
      {
        id: '26',
        title: 'Event 13',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#fab1a0',
        borderColor: '#e17055',
        color: '#0e0e0e',
      },
      {
        id: '27',
        title: 'Event 14',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#ff6b6b',
        borderColor: '#e55353',
        color: '#0e0e0e',
      },
      {
        id: '28',
        title: 'Event 15',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#4ecdc4',
        borderColor: '#45b7aa',
        color: '#0e0e0e',
      },
      {
        id: '29',
        title: 'Event 16',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#45b7d1',
        borderColor: '#3a9bc1',
        color: '#0e0e0e',
      },
      {
        id: '30',
        title: 'Event 17',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#96ceb4',
        borderColor: '#7fb069',
        color: '#0e0e0e',
      },
      {
        id: '31',
        title: 'Event 18',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#ffeaa7',
        borderColor: '#fdcb6e',
        color: '#0e0e0e',
      },
      {
        id: '32',
        title: 'Event 19',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#dda0dd',
        borderColor: '#ba68c8',
        color: '#0e0e0e',
      },
      {
        id: '33',
        title: 'Event 20',
        start: new Date(currentYear, currentMonth, 8),
        end: new Date(currentYear, currentMonth, 8),
        backgroundColor: '#74b9ff',
        borderColor: '#0984e3',
        color: '#0e0e0e',
      },
    ];
  }, []);

  const { resourcesFromDate, resourcesToDate } = useMemo(() => {
    const now = new Date();
    return {
      resourcesFromDate: new Date(now.getFullYear(), now.getMonth(), -2),
      resourcesToDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  }, []);

  const resources: CalendarResource[] = useMemo(
    () => [
      { id: 'r1', name: 'Room A' },
      { id: 'r2', name: 'Room B' },
      { id: 'r3', name: 'Seminar Room' },
      { id: 'r4', name: 'Reception Room' },
      { id: 'r5', name: 'Focus Room' },
      { id: 'r6', name: 'Room C' },
      { id: 'r7', name: 'Room D' },
      { id: 'r8', name: 'Training Room' },
      { id: 'r9', name: 'Lounge' },
      { id: 'r10', name: 'Server Room' },
      { id: 'r11', name: 'Room E' },
      { id: 'r12', name: 'Executive Room' },
      { id: 'r13', name: 'Brainstorm Space' },
      { id: 'r14', name: 'Phone Booth 1' },
      { id: 'r15', name: 'Phone Booth 2' },
      { id: 'r16', name: 'Open Space' },
      { id: 'r17', name: 'Workshop Room' },
      { id: 'r18', name: 'Recording Studio' },
      { id: 'r19', name: 'Design Studio' },
      { id: 'r20', name: 'Relaxation Room' },
      { id: 'r21', name: 'Conference Room 1' },
      { id: 'r22', name: 'Conference Room 2' },
      { id: 'r23', name: 'Meeting Pod A' },
      { id: 'r24', name: 'Meeting Pod B' },
      { id: 'r25', name: 'Rooftop Space' },
      { id: 'r26', name: 'Cafeteria' },
      { id: 'r27', name: 'Library Room' },
      { id: 'r28', name: 'Innovation Lab' },
      { id: 'r29', name: 'Media Room' },
      { id: 'r30', name: 'Wellness Room' },
    ],
    []
  );

  const resourceEvents: ResourcesCalendarEvent[] = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return [
      {
        id: 're-r1-a',
        resourceId: 'r1',
        title: 'Event A (1-5)',
        start: new Date(y, m, 1),
        end: new Date(y, m, 5),
        backgroundColor: '#ff6b6b',
        borderColor: '#e55353',
        color: '#333',
      },
      {
        id: 're-r1-b',
        resourceId: 'r1',
        title: 'Event B (2-4)',
        start: new Date(y, m, 2),
        end: new Date(y, m, 4),
        backgroundColor: '#4ecdc4',
        borderColor: '#45b7aa',
        color: '#333',
      },
      {
        id: 're-r1-c',
        resourceId: 'r1',
        title: 'Event C (3-5)',
        start: new Date(y, m, 3),
        end: new Date(y, m, 5),
        backgroundColor: '#a29bfe',
        borderColor: '#6c5ce7',
        color: '#333',
      },
      {
        id: 're-r2-a',
        resourceId: 'r2',
        title: 'Meeting A (1-3)',
        start: new Date(y, m, 1),
        end: new Date(y, m, 3),
        backgroundColor: '#ff6b6b',
        borderColor: '#e55353',
        color: '#333',
      },
      {
        id: 're-r2-b',
        resourceId: 'r2',
        title: 'Meeting B (2-5)',
        start: new Date(y, m, 2),
        end: new Date(y, m, 5),
        backgroundColor: '#4ecdc4',
        borderColor: '#45b7aa',
        color: '#333',
      },
      {
        id: 're-r2-c',
        resourceId: 'r2',
        title: 'Meeting C (1)',
        start: new Date(y, m, 1),
        end: new Date(y, m, 1),
        backgroundColor: '#74b9ff',
        borderColor: '#0984e3',
        color: '#333',
      },
      {
        id: 're-r3-a',
        resourceId: 'r3',
        title: 'Step A (1-4)',
        start: new Date(y, m, 1),
        end: new Date(y, m, 4),
        backgroundColor: '#00b894',
        borderColor: '#00a085',
        color: '#333',
      },
      {
        id: 're-r3-b',
        resourceId: 'r3',
        title: 'Step B (2-5)',
        start: new Date(y, m, 2),
        end: new Date(y, m, 5),
        backgroundColor: '#fd79a8',
        borderColor: '#e84393',
        color: '#333',
      },
      {
        id: 're-r3-c',
        resourceId: 'r3',
        title: 'Step C (3-5)',
        start: new Date(y, m, 3),
        end: new Date(y, m, 5),
        backgroundColor: '#ffeaa7',
        borderColor: '#fdcb6e',
        color: '#333',
      },
    ];
  }, []);

  const calendarRef = useRef<MonthCalendarRef>(null);

  const handleScrollToTop = useCallback(() => {
    calendarRef.current?.scrollMonthViewToOffset(
      dayjs(date).format('YYYY-MM'),
      0,
      true
    );
  }, [date]);

  const handleScrollDown = useCallback(() => {
    calendarRef.current?.scrollMonthViewToOffset(
      dayjs(date).format('YYYY-MM'),
      100,
      true
    );
  }, [date]);

  const getMonthRowHeight = useCallback(
    (d: Date) => {
      return calendarRef.current?.getMonthRowHeight(
        dayjs(date).format('YYYY-MM'),
        d
      );
    },
    [date]
  );

  const handlePressEvent = useCallback(
    (_event: CalendarEvent) => {
      handleScrollToTop();
    },
    [handleScrollToTop]
  );

  const handleLongPressEvent = useCallback(
    (_event: CalendarEvent) => {
      handleScrollDown();
    },
    [handleScrollDown]
  );

  const handlePressCell = useCallback(
    (d: Date) => {
      const height = getMonthRowHeight(d);
      console.log('height', height);
    },
    [getMonthRowHeight]
  );

  const handleResourcesPressCell = useCallback(
    (resource: CalendarResource, d: Date) => {
      console.log('onPressCell', resource.name, dayjs(d).format('YYYY-MM-DD'));
    },
    []
  );

  const handleResourcesLongPressCell = useCallback(
    (resource: CalendarResource, d: Date) => {
      console.log(
        'onLongPressCell',
        resource.name,
        dayjs(d).format('YYYY-MM-DD')
      );
    },
    []
  );

  const handleResourcesPressEvent = useCallback(
    (event: ResourcesCalendarEvent) => {
      console.log('onPressEvent', event.id, event.title);
    },
    []
  );

  const handleResourcesLongPressEvent = useCallback(
    (event: ResourcesCalendarEvent) => {
      console.log('onLongPressEvent', event.id, event.title);
    },
    []
  );

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const dayCellContainerStyle: (date: Date) => ViewStyle = useCallback(
    (d) => {
      if (dayjs(d).isSame(dayjs(selectedDate), 'day')) {
        return {
          backgroundColor: 'lightgray',
        };
      }
      return {};
    },
    [selectedDate]
  );

  const dayCellTextStyle: (date: Date) => TextStyle = useCallback((d) => {
    if (d.getDay() === 0) {
      return {
        color: 'red',
        fontWeight: 'bold',
      };
    } else if (d.getDay() === 6) {
      return {
        color: 'blue',
        fontWeight: 'bold',
      };
    }
    return {};
  }, []);

  const weekdayCellContainerStyle: (weekday: WeekdayNum) => ViewStyle =
    useCallback((day) => {
      if (day === 0 || day === 6) {
        return {
          backgroundColor: 'lightgreen',
        };
      }
      return {};
    }, []);

  const weekdayCellTextStyle: (weekday: WeekdayNum) => TextStyle = useCallback(
    (day) => {
      if (day === 0) {
        return {
          color: 'red',
          fontWeight: 'bold',
        };
      } else if (day === 6) {
        return {
          color: 'blue',
          fontWeight: 'bold',
        };
      }
      return {};
    },
    []
  );

  const todayCellTextStyle: TextStyle = {
    backgroundColor: 'lightblue',
    borderRadius: 12,
  };

  const handleLongPressCell = useCallback((d: Date) => {
    setSelectedDate(d);
  }, []);

  const eventTextStyle = useCallback((_event: CalendarEvent): TextStyle => {
    return {
      fontSize: 14,
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'month' && styles.activeTab]}
          onPress={() => setActiveTab('month')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'month' && styles.activeTabText,
            ]}
          >
            Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'resources-fixed-column' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('resources-fixed-column')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'resources-fixed-column' && styles.activeTabText,
            ]}
          >
            Fixed Column
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'resources-inline-band' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('resources-inline-band')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'resources-inline-band' && styles.activeTabText,
            ]}
          >
            Inline Band
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'month' ? (
        <MonthCalendar
          ref={calendarRef}
          defaultDate={date}
          weekStartsOn={1}
          onChangeDate={handleChangeDate}
          events={events}
          onPressEvent={handlePressEvent}
          onLongPressEvent={handleLongPressEvent}
          delayLongPressEvent={1000}
          onPressCell={handlePressCell}
          onLongPressCell={handleLongPressCell}
          delayLongPressCell={1000}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          dayCellContainerStyle={dayCellContainerStyle}
          dayCellTextStyle={dayCellTextStyle}
          locale={ja}
          weekdayCellContainerStyle={weekdayCellContainerStyle}
          weekdayCellTextStyle={weekdayCellTextStyle}
          todayCellTextStyle={todayCellTextStyle}
          hiddenMonth={false}
          monthFormat={'YYYY/MM'}
          stickyHeaderEnabled={true}
          cellBorderColor="#999999"
          allowFontScaling={false}
          eventHeight={32}
          eventTextStyle={eventTextStyle}
          eventEllipsizeMode={'clip'}
          bottomSpacing={200}
        />
      ) : (
        <ResourcesCalendar
          fromDate={resourcesFromDate}
          toDate={resourcesToDate}
          resources={resources}
          events={resourceEvents}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          resourceNameLayout={
            activeTab === 'resources-inline-band'
              ? 'inline-band'
              : 'fixed-column'
          }
          renderDateLabel={(d) => {
            const todayStyle = {
              backgroundColor: 'green',
              borderRadius: 99,
            };
            const todayTextStyle = {
              color: 'white',
            };
            const isToday = dayjs(d).isSame(dayjs(new Date()), 'day');
            return (
              <View style={[styles.dateLabel, isToday ? todayStyle : {}]}>
                <Text
                  style={[styles.dateLabelText, isToday ? todayTextStyle : {}]}
                >
                  {dayjs(d).locale(ja).format('D')}
                </Text>
                <Text
                  style={[styles.dateLabelText, isToday ? todayTextStyle : {}]}
                >
                  {dayjs(d).locale(ja).format('(ddd)')}
                </Text>
              </View>
            );
          }}
          renderMonthLabel={(year, month) => (
            <View>
              <Text style={styles.monthLabelText}>
                {dayjs(`${year}-${month}-01`).locale(ja).format('YYYY年M月')}
              </Text>
            </View>
          )}
          fixedRowCount={2}
          onPressCell={handleResourcesPressCell}
          onLongPressCell={handleResourcesLongPressCell}
          delayLongPressCell={1000}
          onPressEvent={handleResourcesPressEvent}
          onLongPressEvent={handleResourcesLongPressEvent}
          delayLongPressEvent={1000}
          eventHeight={22}
          bottomSpacing={200}
          eventTextStyle={(_event) => ({ fontSize: 12 })}
          eventEllipsizeMode={'clip'}
          dateCellContainerStyle={(d) => {
            const commonStyle: ViewStyle = {};
            if (d.getDay() === 0 || d.getDay() === 6) {
              return { ...commonStyle, backgroundColor: '#f5f5f5' };
            } else {
              return { ...commonStyle, backgroundColor: '#fff' };
            }
          }}
          cellContainerStyle={(_resource, d) => {
            const commonStyle: ViewStyle = { paddingBottom: 8 };
            if (d.getDay() === 0 || d.getDay() === 6) {
              return { ...commonStyle, backgroundColor: '#f5f5f5' };
            } else {
              return { ...commonStyle, backgroundColor: '#fff' };
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60,
    width: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#888',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  dateLabel: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 2,
  },
  dateLabelText: {
    fontSize: 12,
    lineHeight: 12,
  },
  monthLabelText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
});
