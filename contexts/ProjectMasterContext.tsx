'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProjectMaster } from '../types/projectMaster';

interface ProjectMasterContextType {
    projectMasters: ProjectMaster[];
    addProjectMaster: (master: Omit<ProjectMaster, 'id' | 'createdAt' | 'updatedAt'>) => ProjectMaster;
    updateProjectMaster: (id: string, updates: Partial<Omit<ProjectMaster, 'id' | 'createdAt' | 'updatedAt'>>) => void;
    deleteProjectMaster: (id: string) => void;
    getProjectMasterById: (id: string) => ProjectMaster | undefined;
    searchProjectMasters: (query: string) => ProjectMaster[];
}

const ProjectMasterContext = createContext<ProjectMasterContextType | undefined>(undefined);

const STORAGE_KEY = 'yusystem_project_masters';

export function ProjectMasterProvider({ children }: { children: ReactNode }) {
    const [projectMasters, setProjectMasters] = useState<ProjectMaster[]>([]);

    // LocalStorageから読み込み
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setProjectMasters(parsed);
            } catch (error) {
                console.error('Failed to parse project masters from localStorage:', error);
            }
        }
    }, []);

    // LocalStorageに保存
    useEffect(() => {
        if (projectMasters.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projectMasters));
        }
    }, [projectMasters]);

    const addProjectMaster = (master: Omit<ProjectMaster, 'id' | 'createdAt' | 'updatedAt'>): ProjectMaster => {
        const now = new Date().toISOString();
        const newMaster: ProjectMaster = {
            ...master,
            id: `master-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: now,
            updatedAt: now,
        };

        setProjectMasters((prev) => [...prev, newMaster]);
        return newMaster;
    };

    const updateProjectMaster = (
        id: string,
        updates: Partial<Omit<ProjectMaster, 'id' | 'createdAt' | 'updatedAt'>>
    ) => {
        setProjectMasters((prev) =>
            prev.map((master) =>
                master.id === id
                    ? {
                        ...master,
                        ...updates,
                        updatedAt: new Date().toISOString(),
                    }
                    : master
            )
        );
    };

    const deleteProjectMaster = (id: string) => {
        setProjectMasters((prev) => prev.filter((master) => master.id !== id));
    };

    const getProjectMasterById = (id: string): ProjectMaster | undefined => {
        return projectMasters.find((master) => master.id === id);
    };

    const searchProjectMasters = (query: string): ProjectMaster[] => {
        if (!query.trim()) {
            return projectMasters;
        }

        const lowerQuery = query.toLowerCase();
        return projectMasters.filter(
            (master) =>
                master.siteName.toLowerCase().includes(lowerQuery) ||
                master.parentCompany?.toLowerCase().includes(lowerQuery)
        );
    };

    return (
        <ProjectMasterContext.Provider
            value={{
                projectMasters,
                addProjectMaster,
                updateProjectMaster,
                deleteProjectMaster,
                getProjectMasterById,
                searchProjectMasters,
            }}
        >
            {children}
        </ProjectMasterContext.Provider>
    );
}

export function useProjectMaster() {
    const context = useContext(ProjectMasterContext);
    if (!context) {
        throw new Error('useProjectMaster must be used within a ProjectMasterProvider');
    }
    return context;
}
