import { Employee, CalendarEvent, EmployeeRow, WeekDay } from '@/types/calendar';
import { isSameDay } from './dateUtils';

/**
 * 社員別の行データを生成（シンプル版）
 * 各社員は常に1行のみ。複数のイベントは同じセル内に縦に並べて表示
 */
export function generateEmployeeRows(
    employees: Employee[],
    events: CalendarEvent[],
    _weekDays: WeekDay[]
): EmployeeRow[] {
    const rows: EmployeeRow[] = [];

    employees.forEach(employee => {
        // この社員に割り当てられたイベントを取得
        const employeeEvents = events.filter(
            event => event.assignedEmployeeId === employee.id
        );

        // 日付ごとにイベントをグループ化
        const eventsByDate = new Map<string, CalendarEvent[]>();
        employeeEvents.forEach(event => {
            const dateKey = formatDateKey(event.startDate);
            if (!eventsByDate.has(dateKey)) {
                eventsByDate.set(dateKey, []);
            }
            eventsByDate.get(dateKey)!.push(event);
        });

        // 各日付のイベントをsortOrder順にソート
        eventsByDate.forEach((events, _dateKey) => {
            events.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        });

        // 各社員は常に1行のみ
        rows.push({
            employeeId: employee.id,
            employeeName: employee.nickname || employee.name,
            rowIndex: 0,
            events: eventsByDate,
        });
    });

    return rows;
}

/**
 * 日付をキー文字列に変換 (YYYY-MM-DD)
 */
export function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 指定した日付のイベントを取得
 */
export function getEventsForDate(
    row: EmployeeRow,
    date: Date
): CalendarEvent[] {
    const dateKey = formatDateKey(date);
    return row.events.get(dateKey) || [];
}

/**
 * 未割り当てイベントの数を取得
 */
export function getUnassignedEventCount(
    events: CalendarEvent[],
    date: Date
): number {
    return events.filter(
        event =>
            event.assignedEmployeeId === 'unassigned' &&
            isSameDay(event.startDate, date)
    ).length;
}
