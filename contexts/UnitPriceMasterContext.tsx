'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { UnitPriceMaster, UnitPriceMasterInput, TemplateType, CategoryType } from '@/types/unitPrice';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface UnitPriceMasterContextType {
    unitPrices: UnitPriceMaster[];
    addUnitPrice: (unitPrice: UnitPriceMasterInput) => void;
    updateUnitPrice: (id: string, unitPrice: Partial<UnitPriceMasterInput>) => void;
    deleteUnitPrice: (id: string) => void;
    getUnitPriceById: (id: string) => UnitPriceMaster | undefined;
    getUnitPricesByTemplate: (template: TemplateType) => UnitPriceMaster[];
    getUnitPricesByCategory: (category: CategoryType) => UnitPriceMaster[];
}

const UnitPriceMasterContext = createContext<UnitPriceMasterContextType | undefined>(undefined);

export function UnitPriceMasterProvider({ children }: { children: React.ReactNode }) {
    const [unitPrices, setUnitPrices] = useLocalStorage<UnitPriceMaster[]>('yusystem_unit_prices', []);

    // 単価マスターを追加
    const addUnitPrice = useCallback((unitPriceData: UnitPriceMasterInput) => {
        const newUnitPrice: UnitPriceMaster = {
            id: `unitprice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...unitPriceData,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setUnitPrices(prev => [...prev, newUnitPrice]);
    }, [setUnitPrices]);

    // 単価マスターを更新
    const updateUnitPrice = useCallback((id: string, unitPriceData: Partial<UnitPriceMasterInput>) => {
        setUnitPrices(prev => prev.map(unitPrice =>
            unitPrice.id === id
                ? { ...unitPrice, ...unitPriceData, updatedAt: new Date() }
                : unitPrice
        ));
    }, [setUnitPrices]);

    // 単価マスターを削除
    const deleteUnitPrice = useCallback((id: string) => {
        setUnitPrices(prev => prev.filter(unitPrice => unitPrice.id !== id));
    }, [setUnitPrices]);

    // IDで単価マスターを取得
    const getUnitPriceById = useCallback((id: string) => {
        return unitPrices.find(unitPrice => unitPrice.id === id);
    }, [unitPrices]);

    // テンプレートで絞り込み
    const getUnitPricesByTemplate = useCallback((template: TemplateType) => {
        return unitPrices.filter(up => up.templates.includes(template));
    }, [unitPrices]);

    // カテゴリで絞り込み
    const getUnitPricesByCategory = useCallback((category: CategoryType) => {
        return unitPrices.filter(up => up.category === category);
    }, [unitPrices]);

    return (
        <UnitPriceMasterContext.Provider
            value={{
                unitPrices,
                addUnitPrice,
                updateUnitPrice,
                deleteUnitPrice,
                getUnitPriceById,
                getUnitPricesByTemplate,
                getUnitPricesByCategory,
            }}
        >
            {children}
        </UnitPriceMasterContext.Provider>
    );
}

export function useUnitPriceMaster() {
    const context = useContext(UnitPriceMasterContext);
    if (context === undefined) {
        throw new Error('useUnitPriceMaster must be used within a UnitPriceMasterProvider');
    }
    return context;
}
