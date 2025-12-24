'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CompanyInfo, CompanyInfoInput } from '@/types/company';

interface CompanyContextType {
    companyInfo: CompanyInfo | null;
    updateCompanyInfo: (data: CompanyInfoInput) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

    // LocalStorageから読み込み
    useEffect(() => {
        const stored = localStorage.getItem('companyInfo');
        if (stored) {
            const parsed = JSON.parse(stored);
            setCompanyInfo({
                ...parsed,
                createdAt: new Date(parsed.createdAt),
                updatedAt: new Date(parsed.updatedAt),
            });
        } else {
            // デフォルト値
            const defaultCompany: CompanyInfo = {
                id: 'company-1',
                name: '株式会社 焼伸 工業',
                postalCode: '〒799-3104',
                address: '伊予市上三谷甲3517番地',
                tel: 'TEL:089-989-7350',
                fax: 'FAX:089-989-7351',
                representative: '今井 公',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setCompanyInfo(defaultCompany);
            localStorage.setItem('companyInfo', JSON.stringify(defaultCompany));
        }
    }, []);

    // 更新
    const updateCompanyInfo = (data: CompanyInfoInput) => {
        const updated: CompanyInfo = {
            id: companyInfo?.id || 'company-1',
            ...data,
            createdAt: companyInfo?.createdAt || new Date(),
            updatedAt: new Date(),
        };
        setCompanyInfo(updated);
        localStorage.setItem('companyInfo', JSON.stringify(updated));
    };

    return (
        <CompanyContext.Provider value={{ companyInfo, updateCompanyInfo }}>
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompany() {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
}
