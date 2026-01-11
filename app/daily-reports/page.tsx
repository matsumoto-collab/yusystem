'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DailyReportForm from '@/components/DailyReport/DailyReportForm';

export default function DailyReportPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());

    // 前日
    const goPreviousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    // 翌日
    const goNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    // 今日
    const goToday = () => {
        setSelectedDate(new Date());
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-3xl mx-auto">
                {/* ヘッダー */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">日報入力</h1>

                    {/* 日付ナビゲーション */}
                    <div className="flex items-center justify-center gap-4 bg-white rounded-lg shadow p-4">
                        <button
                            onClick={goPreviousDay}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>

                        <div className="flex items-center gap-3">
                            <input
                                type="date"
                                value={selectedDate.toISOString().split('T')[0]}
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={goToday}
                                className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                                今日
                            </button>
                        </div>

                        <button
                            onClick={goNextDay}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* 日報フォーム */}
                <DailyReportForm
                    date={selectedDate}
                    key={selectedDate.toISOString().split('T')[0]} // 日付が変わったらリセット
                />
            </div>
        </div>
    );
}
