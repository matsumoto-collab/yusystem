'use client';

import React from 'react';

// タスクの型定義
interface Task {
    id: string;
    name: string;
    startDate: number; // 日付（1-31）
    endDate: number;   // 日付（1-31）
    color: string;     // Tailwind color class
}

// 社員の型定義
interface Employee {
    id: string;
    name: string;
    tasks: Task[];
}

// 2025年12月のダミーデータ
const mockData: Employee[] = [
    {
        id: 'unassigned',
        name: '未割り当て',
        tasks: [
            {
                id: 'task-u1',
                name: 'D邸 調査',
                startDate: 10,
                endDate: 12,
                color: 'bg-gray-400 hover:bg-gray-500',
            },
        ],
    },
    {
        id: 'hatta',
        name: '八田 大志',
        tasks: [
            {
                id: 'task-h1',
                name: 'A邸 改修工事',
                startDate: 3,
                endDate: 10,
                color: 'bg-blue-500 hover:bg-blue-600',
            },
            {
                id: 'task-h2',
                name: 'Bビル メンテナンス',
                startDate: 15,
                endDate: 20,
                color: 'bg-green-500 hover:bg-green-600',
            },
        ],
    },
    {
        id: 'matsumoto',
        name: '松本',
        tasks: [
            {
                id: 'task-m1',
                name: 'C邸 塗装',
                startDate: 5,
                endDate: 8,
                color: 'bg-red-500 hover:bg-red-600',
            },
        ],
    },
    {
        id: 'yamada',
        name: '山田 太郎',
        tasks: [],
    },
    {
        id: 'suzuki',
        name: '鈴木 一郎',
        tasks: [],
    },
];

// 2025年12月の日付データを生成
const generateDecemberDays = () => {
    const days = [];
    const year = 2025;
    const month = 11; // 0-indexed (December)

    for (let day = 1; day <= 31; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay(); // 0=日, 1=月, ..., 6=土
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

        days.push({
            day,
            dayOfWeek,
            dayName: dayNames[dayOfWeek],
            isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            isSaturday: dayOfWeek === 6,
            isSunday: dayOfWeek === 0,
        });
    }

    return days;
};

export default function GanttChart() {
    const days = generateDecemberDays();

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* ヘッダー */}
            <div className="border-b border-gray-200 bg-gray-50 p-4">
                <h2 className="text-lg font-semibold text-gray-900">2025年12月 スケジュール</h2>
            </div>

            {/* ガントチャート本体 */}
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                    {/* ヘッダー行: 日付と曜日 */}
                    <div className="flex border-b border-gray-200 bg-gray-50">
                        {/* 社員名カラム（固定） */}
                        <div className="sticky left-0 z-20 bg-gray-50 border-r border-gray-300 shadow-sm">
                            <div className="w-32 h-16 flex items-center justify-center font-semibold text-gray-700 text-sm">
                                社員名
                            </div>
                        </div>

                        {/* 日付カラム */}
                        {days.map((dayInfo) => (
                            <div
                                key={dayInfo.day}
                                className={`min-w-[40px] w-[40px] border-r border-gray-200 ${dayInfo.isSaturday
                                        ? 'bg-blue-50'
                                        : dayInfo.isSunday
                                            ? 'bg-red-50'
                                            : 'bg-gray-50'
                                    }`}
                            >
                                <div className="h-8 flex items-center justify-center text-xs font-semibold text-gray-700">
                                    {dayInfo.day}
                                </div>
                                <div
                                    className={`h-8 flex items-center justify-center text-xs border-t border-gray-200 ${dayInfo.isSaturday
                                            ? 'text-blue-600'
                                            : dayInfo.isSunday
                                                ? 'text-red-600'
                                                : 'text-gray-600'
                                        }`}
                                >
                                    {dayInfo.dayName}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ボディ行: 各社員のタスク */}
                    {mockData.map((employee) => (
                        <div key={employee.id} className="flex border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            {/* 社員名セル（固定） */}
                            <div className="sticky left-0 z-10 bg-white border-r border-gray-300 shadow-sm">
                                <div className="w-32 h-14 flex items-center px-3">
                                    <span className="text-sm font-medium text-gray-900 truncate">
                                        {employee.name}
                                    </span>
                                </div>
                            </div>

                            {/* タスクグリッド */}
                            <div className="flex-1 relative h-14">
                                {/* 日付グリッドの背景 */}
                                <div className="absolute inset-0 flex">
                                    {days.map((dayInfo) => (
                                        <div
                                            key={dayInfo.day}
                                            className={`min-w-[40px] w-[40px] border-r border-gray-100 ${dayInfo.isWeekend ? 'bg-gray-50' : ''
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* タスクバー */}
                                {employee.tasks.map((task) => {
                                    const duration = task.endDate - task.startDate + 1;
                                    const leftPosition = (task.startDate - 1) * 40; // 40px per day
                                    const width = duration * 40;

                                    return (
                                        <div
                                            key={task.id}
                                            className={`absolute top-2 h-10 rounded-md ${task.color} text-white text-xs font-medium flex items-center px-2 shadow-md transition-all duration-150 cursor-pointer`}
                                            style={{
                                                left: `${leftPosition}px`,
                                                width: `${width}px`,
                                            }}
                                            title={`${task.name} (${task.startDate}日 - ${task.endDate}日)`}
                                        >
                                            <span className="truncate">{task.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* フッター（凡例） */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-6 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span>改修工事</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span>メンテナンス</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500"></div>
                        <span>塗装</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-400"></div>
                        <span>調査</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
