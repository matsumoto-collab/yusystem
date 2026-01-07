'use client';

import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import WeeklyCalendar from './Calendar/WeeklyCalendar';
import SettingsPage from '@/app/settings/page';
import ProjectListPage from '@/app/projects/page';
import EstimateListPage from '@/app/estimates/page';
import InvoiceListPage from '@/app/invoices/page';
import CustomersPage from '@/app/customers/page';

// Placeholder component for未実装 pages
function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-600">この機能は現在開発中です</p>
            </div>
        </div>
    );
}

export default function MainContent() {
    const { activePage } = useNavigation();

    // Render content based on active page
    const renderContent = () => {
        switch (activePage) {
            case 'schedule':
                // Schedule management (calendar view)
                return (
                    <div className="flex-1 min-h-0">
                        <WeeklyCalendar />
                    </div>
                );

            case 'settings':
                // Settings page (master data management)
                return <SettingsPage />;

            case 'projects':
                return <ProjectListPage />;

            case 'estimates':
                return <EstimateListPage />;

            case 'invoices':
                return <InvoiceListPage />;

            case 'reports':
                return <PlaceholderPage title="日報一覧" />;

            case 'orders':
                return <PlaceholderPage title="発注書" />;

            case 'partners':
                return <PlaceholderPage title="協力会社" />;

            case 'customers':
                return <CustomersPage />;

            case 'company':
                return <PlaceholderPage title="自社情報" />;

            default:
                return <PlaceholderPage title="ページが見つかりません" />;
        }
    };

    return (
        <main className="
            fixed top-0 bottom-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-auto
            
            /* Mobile: Full width with top padding for header */
            left-0 right-0 pt-16
            
            /* Desktop: Offset by sidebar width, no top padding */
            lg:left-64 lg:pt-0 lg:right-0
        ">
            <div className={`${activePage === 'schedule' ? 'p-4 sm:p-6 h-full flex flex-col' : 'p-4 sm:p-6'} w-full min-w-0`}>
                {renderContent()}
            </div>
        </main>
    );
}
