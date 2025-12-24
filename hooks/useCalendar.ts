import { useState, useMemo } from 'react';
import { WeekDay, CalendarEvent } from '@/types/calendar';
import { getWeekDays, addWeeks, addDays, isSameDay } from '@/utils/dateUtils';

interface UseCalendarReturn {
    currentDate: Date;
    weekDays: WeekDay[];
    goToPreviousWeek: () => void;
    goToNextWeek: () => void;
    goToPreviousDay: () => void;
    goToNextDay: () => void;
    goToToday: () => void;
    setEvents: (events: CalendarEvent[]) => void;
}

/**
 * カレンダーのロジックを管理するカスタムフック
 */
export function useCalendar(initialEvents: CalendarEvent[] = []): UseCalendarReturn {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [events, setEventsState] = useState<CalendarEvent[]>(initialEvents);

    // 現在の週の日付を取得
    const weekDays = useMemo(() => {
        const days = getWeekDays(currentDate);

        // 各日付にイベントを割り当て
        return days.map(day => ({
            ...day,
            events: events.filter(event => isSameDay(event.startDate, day.date)),
        }));
    }, [currentDate, events]);

    // 前の週へ移動
    const goToPreviousWeek = () => {
        setCurrentDate(prevDate => addWeeks(prevDate, -1));
    };

    // 次の週へ移動
    const goToNextWeek = () => {
        setCurrentDate(prevDate => addWeeks(prevDate, 1));
    };

    // 前の日へ移動
    const goToPreviousDay = () => {
        setCurrentDate(prevDate => addDays(prevDate, -1));
    };

    // 次の日へ移動
    const goToNextDay = () => {
        setCurrentDate(prevDate => addDays(prevDate, 1));
    };

    // 今週へ戻る
    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // イベントを設定
    const setEvents = (newEvents: CalendarEvent[]) => {
        setEventsState(newEvents);
    };

    return {
        currentDate,
        weekDays,
        goToPreviousWeek,
        goToNextWeek,
        goToPreviousDay,
        goToNextDay,
        goToToday,
        setEvents,
    };
}
