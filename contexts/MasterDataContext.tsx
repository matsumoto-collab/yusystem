'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { mockVehicles, mockWorkers, mockManagers, TOTAL_MEMBERS } from '@/data/mockResources';

export interface Vehicle {
    id: string;
    name: string;
}

export interface Worker {
    id: string;
    name: string;
}

export interface Manager {
    id: string;
    name: string;
}

export interface MasterData {
    vehicles: Vehicle[];
    workers: Worker[];
    managers: Manager[];
    totalMembers: number;
}

interface MasterDataContextType extends MasterData {
    addVehicle: (name: string) => void;
    updateVehicle: (id: string, name: string) => void;
    deleteVehicle: (id: string) => void;
    addWorker: (name: string) => void;
    updateWorker: (id: string, name: string) => void;
    deleteWorker: (id: string) => void;
    addManager: (name: string) => void;
    updateManager: (id: string, name: string) => void;
    deleteManager: (id: string) => void;
    updateTotalMembers: (count: number) => void;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

const STORAGE_KEY = 'yusystem_master_data';

export function MasterDataProvider({ children }: { children: ReactNode }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [totalMembers, setTotalMembers] = useState<number>(TOTAL_MEMBERS);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load data from LocalStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const data: MasterData = JSON.parse(stored);
                setVehicles(data.vehicles || mockVehicles);
                setWorkers(data.workers || mockWorkers);
                setManagers(data.managers || mockManagers);
                setTotalMembers(data.totalMembers || TOTAL_MEMBERS);
            } catch (error) {
                console.error('Failed to load master data:', error);
                loadDefaults();
            }
        } else {
            loadDefaults();
        }
        setIsInitialized(true);
    }, []);

    const loadDefaults = () => {
        setVehicles(mockVehicles);
        setWorkers(mockWorkers);
        setManagers(mockManagers);
        setTotalMembers(TOTAL_MEMBERS);
    };

    // Save to LocalStorage whenever data changes (but only after initialization)
    useEffect(() => {
        if (!isInitialized) return;

        const data: MasterData = {
            vehicles,
            workers,
            managers,
            totalMembers,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [vehicles, workers, managers, totalMembers, isInitialized]);

    // Vehicle operations
    const addVehicle = useCallback((name: string) => {
        const newVehicle: Vehicle = {
            id: `v${Date.now()}`,
            name,
        };
        setVehicles(prev => [...prev, newVehicle]);
    }, []);

    const updateVehicle = useCallback((id: string, name: string) => {
        setVehicles(prev => prev.map(v => v.id === id ? { ...v, name } : v));
    }, []);

    const deleteVehicle = useCallback((id: string) => {
        setVehicles(prev => prev.filter(v => v.id !== id));
    }, []);

    // Worker operations
    const addWorker = useCallback((name: string) => {
        const newWorker: Worker = {
            id: `w${Date.now()}`,
            name,
        };
        setWorkers(prev => [...prev, newWorker]);
    }, []);

    const updateWorker = useCallback((id: string, name: string) => {
        setWorkers(prev => prev.map(w => w.id === id ? { ...w, name } : w));
    }, []);

    const deleteWorker = useCallback((id: string) => {
        setWorkers(prev => prev.filter(w => w.id !== id));
    }, []);

    // Manager operations
    const addManager = useCallback((name: string) => {
        const newManager: Manager = {
            id: `m${Date.now()}`,
            name,
        };
        setManagers(prev => [...prev, newManager]);
    }, []);

    const updateManager = useCallback((id: string, name: string) => {
        setManagers(prev => prev.map(m => m.id === id ? { ...m, name } : m));
    }, []);

    const deleteManager = useCallback((id: string) => {
        setManagers(prev => prev.filter(m => m.id !== id));
    }, []);

    // Total members operations
    const updateTotalMembersCallback = useCallback((count: number) => {
        setTotalMembers(count);
    }, []);

    const value: MasterDataContextType = {
        vehicles,
        workers,
        managers,
        totalMembers,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addWorker,
        updateWorker,
        deleteWorker,
        addManager,
        updateManager,
        deleteManager,
        updateTotalMembers: updateTotalMembersCallback,
    };

    return (
        <MasterDataContext.Provider value={value}>
            {children}
        </MasterDataContext.Provider>
    );
}

export function useMasterDataContext() {
    const context = useContext(MasterDataContext);
    if (context === undefined) {
        throw new Error('useMasterDataContext must be used within a MasterDataProvider');
    }
    return context;
}
