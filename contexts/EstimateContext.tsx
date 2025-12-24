'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Estimate, EstimateInput } from '@/types/estimate';

interface EstimateContextType {
    estimates: Estimate[];
    addEstimate: (estimate: EstimateInput) => Estimate;
    updateEstimate: (id: string, estimate: Partial<EstimateInput>) => void;
    deleteEstimate: (id: string) => void;
    getEstimate: (id: string) => Estimate | undefined;
    getEstimatesByProject: (projectId: string) => Estimate[];
}

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

const STORAGE_KEY = 'yusystem_estimates';

export function EstimateProvider({ children }: { children: ReactNode }) {
    const [estimates, setEstimates] = useState<Estimate[]>([]);

    // Load from LocalStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Convert date strings back to Date objects
                const estimatesWithDates = parsed.map((est: any) => ({
                    ...est,
                    validUntil: new Date(est.validUntil),
                    createdAt: new Date(est.createdAt),
                    updatedAt: new Date(est.updatedAt),
                }));
                setEstimates(estimatesWithDates);
            } catch (error) {
                console.error('Failed to load estimates:', error);
            }
        }
    }, []);

    // Save to LocalStorage whenever estimates change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates));
    }, [estimates]);

    const addEstimate = useCallback((input: EstimateInput): Estimate => {
        const newEstimate: Estimate = {
            ...input,
            id: `est-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setEstimates(prev => [...prev, newEstimate]);
        return newEstimate;
    }, []);

    const updateEstimate = useCallback((id: string, input: Partial<EstimateInput>) => {
        setEstimates(prev => prev.map(est =>
            est.id === id
                ? { ...est, ...input, updatedAt: new Date() }
                : est
        ));
    }, []);

    const deleteEstimate = useCallback((id: string) => {
        setEstimates(prev => prev.filter(est => est.id !== id));
    }, []);

    const getEstimate = useCallback((id: string) => {
        return estimates.find(est => est.id === id);
    }, [estimates]);

    const getEstimatesByProject = useCallback((projectId: string) => {
        return estimates.filter(est => est.projectId === projectId);
    }, [estimates]);

    return (
        <EstimateContext.Provider
            value={{
                estimates,
                addEstimate,
                updateEstimate,
                deleteEstimate,
                getEstimate,
                getEstimatesByProject,
            }}
        >
            {children}
        </EstimateContext.Provider>
    );
}

export function useEstimates() {
    const context = useContext(EstimateContext);
    if (context === undefined) {
        throw new Error('useEstimates must be used within an EstimateProvider');
    }
    return context;
}
