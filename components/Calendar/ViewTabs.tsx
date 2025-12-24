import React from 'react';
import { ViewType } from '@/types/calendar';

interface ViewTabsProps {
    activeView: ViewType;
    onViewChange: (view: ViewType) => void;
}

export default function ViewTabs({ activeView, onViewChange }: ViewTabsProps) {
    return (
        <div className="flex gap-2 mb-6 border-b border-slate-200">
            <button
                onClick={() => onViewChange('gantt')}
                className={`
          px-6 py-3 font-medium text-sm transition-all duration-300
          border-b-2 -mb-px rounded-t-lg
          ${activeView === 'gantt'
                        ? 'border-slate-700 text-white bg-gradient-to-r from-slate-700 to-slate-600 shadow-lg shadow-slate-900/30'
                        : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }
        `}
            >
                <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    ガントチャート
                </span>
            </button>

            <button
                onClick={() => onViewChange('calendar')}
                className={`
          px-6 py-3 font-medium text-sm transition-all duration-300
          border-b-2 -mb-px rounded-t-lg
          ${activeView === 'calendar'
                        ? 'border-slate-700 text-white bg-gradient-to-r from-slate-700 to-slate-600 shadow-lg shadow-slate-900/30'
                        : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }
        `}
            >
                <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    週間カレンダー
                </span>
            </button>
        </div>
    );
}
