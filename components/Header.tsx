'use client';

import React from 'react';

export default function Header() {
    return (
        <header className="hidden">
            {/* Logo/Title Only */}
            <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">YuSystem</h1>
            </div>
        </header>
    );
}
