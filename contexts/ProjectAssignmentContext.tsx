'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProjectAssignment } from '../types/projectAssignment';

interface ProjectAssignmentContextType {
    projectAssignments: ProjectAssignment[];
    addProjectAssignment: (assignment: Omit<ProjectAssignment, 'id' | 'createdAt' | 'updatedAt'>) => ProjectAssignment;
    updateProjectAssignment: (id: string, updates: Partial<Omit<ProjectAssignment, 'id' | 'createdAt' | 'updatedAt'>>) => void;
    deleteProjectAssignment: (id: string) => void;
    getProjectAssignmentById: (id: string) => ProjectAssignment | undefined;
    getAssignmentsByMasterId: (masterId: string) => ProjectAssignment[];
    getAssignmentsByLeaderId: (leaderId: string) => ProjectAssignment[];
    getAssignmentsByDateRange: (startDate: string, endDate: string) => ProjectAssignment[];
}

const ProjectAssignmentContext = createContext<ProjectAssignmentContextType | undefined>(undefined);

const STORAGE_KEY = 'yusystem_project_assignments';

export function ProjectAssignmentProvider({ children }: { children: ReactNode }) {
    const [projectAssignments, setProjectAssignments] = useState<ProjectAssignment[]>([]);

    // LocalStorageから読み込み
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setProjectAssignments(parsed);
            } catch (error) {
                console.error('Failed to parse project assignments from localStorage:', error);
            }
        }
    }, []);

    // LocalStorageに保存
    useEffect(() => {
        if (projectAssignments.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projectAssignments));
        }
    }, [projectAssignments]);

    const addProjectAssignment = (
        assignment: Omit<ProjectAssignment, 'id' | 'createdAt' | 'updatedAt'>
    ): ProjectAssignment => {
        const now = new Date().toISOString();
        const newAssignment: ProjectAssignment = {
            ...assignment,
            id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: now,
            updatedAt: now,
        };

        setProjectAssignments((prev) => [...prev, newAssignment]);
        return newAssignment;
    };

    const updateProjectAssignment = (
        id: string,
        updates: Partial<Omit<ProjectAssignment, 'id' | 'createdAt' | 'updatedAt'>>
    ) => {
        setProjectAssignments((prev) =>
            prev.map((assignment) =>
                assignment.id === id
                    ? {
                        ...assignment,
                        ...updates,
                        updatedAt: new Date().toISOString(),
                    }
                    : assignment
            )
        );
    };

    const deleteProjectAssignment = (id: string) => {
        setProjectAssignments((prev) => prev.filter((assignment) => assignment.id !== id));
    };

    const getProjectAssignmentById = (id: string): ProjectAssignment | undefined => {
        return projectAssignments.find((assignment) => assignment.id === id);
    };

    const getAssignmentsByMasterId = (masterId: string): ProjectAssignment[] => {
        return projectAssignments.filter((assignment) => assignment.projectMasterId === masterId);
    };

    const getAssignmentsByLeaderId = (leaderId: string): ProjectAssignment[] => {
        return projectAssignments.filter((assignment) => assignment.leaderId === leaderId);
    };

    const getAssignmentsByDateRange = (startDate: string, endDate: string): ProjectAssignment[] => {
        return projectAssignments.filter((assignment) => {
            const assignmentStart = assignment.actualStartDate;
            const assignmentEnd = assignment.actualEndDate || assignment.actualStartDate;

            return (
                (assignmentStart >= startDate && assignmentStart <= endDate) ||
                (assignmentEnd >= startDate && assignmentEnd <= endDate) ||
                (assignmentStart <= startDate && assignmentEnd >= endDate)
            );
        });
    };

    return (
        <ProjectAssignmentContext.Provider
            value={{
                projectAssignments,
                addProjectAssignment,
                updateProjectAssignment,
                deleteProjectAssignment,
                getProjectAssignmentById,
                getAssignmentsByMasterId,
                getAssignmentsByLeaderId,
                getAssignmentsByDateRange,
            }}
        >
            {children}
        </ProjectAssignmentContext.Provider>
    );
}

export function useProjectAssignment() {
    const context = useContext(ProjectAssignmentContext);
    if (!context) {
        throw new Error('useProjectAssignment must be used within a ProjectAssignmentProvider');
    }
    return context;
}
