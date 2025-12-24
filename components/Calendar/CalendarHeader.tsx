import React from 'react';
import { formatDate, getWeekRangeString } from '@/utils/dateUtils';
import { WeekDay } from '@/types/calendar';

interface CalendarHeaderProps {
    weekDays: WeekDay[];
    onPreviousWeek: () => void;
    onNextWeek: () => void;
    onPreviousDay: () => void;
    onNextDay: () => void;
    onToday: () => void;
}

export default function CalendarHeader({
    weekDays,
    onPreviousWeek,
    onNextWeek,
    onPreviousDay,
    onNextDay,
    onToday,
}: CalendarHeaderProps) {
    const weekRangeString = getWeekRangeString(weekDays);
    const currentMonth = weekDays.length > 0 ? formatDate(weekDays[0].date, 'month') : '';

    return (
        <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 p-4 shadow-md">
            <div className="flex items-center justify-between">
                {/* 左側: 年月表示 */}
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                        {currentMonth}
                    </h2>
                    <p className="text-sm text-slate-600 mt-1 font-medium">
                        {weekRangeString}
                    </p>
                </div>

                {/* 右側: ナビゲーションボタン */}
                <div className="flex items-center gap-3">
                    {/* 今週ボタン */}
                    <button
                        onClick={onToday}
                        className="
              px-5 py-2.5 text-sm font-semibold text-white
              bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg
              hover:from-slate-800 hover:to-slate-700 hover:shadow-lg hover:shadow-slate-900/30
              active:scale-95
              transition-all duration-200
            "
                    >
                        今週
                    </button>

                    {/* 週移動ボタン */}
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm">
                        <button
                            onClick={onPreviousWeek}
                            className="
                px-3 py-2.5 text-slate-700 
                hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50
                active:scale-95
                transition-all duration-200
              "
                            aria-label="前の週"
                            title="1週間前"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="w-px h-8 bg-slate-300"></div>

                        <button
                            onClick={onNextWeek}
                            className="
                px-3 py-2.5 text-slate-700
                hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50
                active:scale-95
                transition-all duration-200
              "
                            aria-label="次の週"
                            title="1週間後"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* 日移動ボタン */}
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm">
                        <button
                            onClick={onPreviousDay}
                            className="
                px-3 py-2.5 text-slate-700
                hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50
                active:scale-95
                transition-all duration-200
              "
                            aria-label="前の日"
                            title="1日前"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="w-px h-8 bg-slate-300"></div>

                        <button
                            onClick={onNextDay}
                            className="
                px-3 py-2.5 text-slate-700
                hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50
                active:scale-95
                transition-all duration-200
              "
                            aria-label="次の日"
                            title="1日後"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
