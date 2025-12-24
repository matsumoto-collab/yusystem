'use client';

import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { Menu } from 'lucide-react';

export default function Header() {
    const { toggleMobileMenu } = useNavigation();

    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 flex items-center px-4 z-30 shadow-lg">
            {/* Hamburger Menu Button */}
            <button
                onClick={toggleMobileMenu}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="メニューを開く"
            >
                <Menu className="w-6 h-6 text-slate-200" />
            </button>

            {/* Logo/Title */}
            <div className="flex-1 flex items-center justify-center">
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-50 to-slate-300 bg-clip-text text-transparent">
                    YuSystem
                </h1>
            </div>

            {/* Spacer for symmetry */}
            <div className="w-10" />
        </header>
    );
}
