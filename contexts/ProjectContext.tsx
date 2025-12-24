'use client';

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { Project, CalendarEvent, CONSTRUCTION_TYPE_COLORS } from '@/types/calendar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

interface ProjectContextType {
    projects: Project[];
    addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    updateProjects: (updates: Array<{ id: string; data: Partial<Project> }>) => void;
    deleteProject: (id: string) => void;
    getProjectById: (id: string) => Project | undefined;
    getCalendarEvents: () => CalendarEvent[]; // 案件をカレンダーイベントに展開
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);

    // 案件マスターを自動同期する関数
    const syncToProjectMaster = useCallback((project: Project) => {
        // LocalStorageから案件マスターを取得
        const mastersJson = localStorage.getItem('yusystem_project_masters');
        let masters = mastersJson ? JSON.parse(mastersJson) : [];

        // 同じ現場名・元請会社の案件マスターを検索
        const existingMaster = masters.find(
            (m: any) => m.siteName === project.title && m.parentCompany === project.customer
        );

        if (existingMaster) {
            // 既存の案件マスターを更新
            const constructionTypes: Array<{ type: string; scheduledStartDate?: string }> = [];

            if (project.assemblyStartDate) {
                constructionTypes.push({
                    type: 'assembly',
                    scheduledStartDate: project.assemblyStartDate.toISOString().split('T')[0],
                });
            }

            if (project.demolitionStartDate) {
                constructionTypes.push({
                    type: 'demolition',
                    scheduledStartDate: project.demolitionStartDate.toISOString().split('T')[0],
                });
            }

            // 既存の工事種別とマージ（重複を避ける）
            existingMaster.constructionTypes = [
                ...existingMaster.constructionTypes.filter(
                    (ct: any) => !constructionTypes.some((newCt) => newCt.type === ct.type)
                ),
                ...constructionTypes,
            ];
            existingMaster.updatedAt = new Date().toISOString();
        } else {
            // 新しい案件マスターを作成
            const constructionTypes: Array<{ type: string; scheduledStartDate?: string }> = [];

            if (project.assemblyStartDate) {
                constructionTypes.push({
                    type: 'assembly',
                    scheduledStartDate: project.assemblyStartDate.toISOString().split('T')[0],
                });
            }

            if (project.demolitionStartDate) {
                constructionTypes.push({
                    type: 'demolition',
                    scheduledStartDate: project.demolitionStartDate.toISOString().split('T')[0],
                });
            }

            const newMaster = {
                id: `master-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                siteName: project.title,
                parentCompany: project.customer || '',
                constructionTypes,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            masters.push(newMaster);
        }

        // LocalStorageに保存
        localStorage.setItem('yusystem_project_masters', JSON.stringify(masters));
    }, []);

    // 案件を追加
    const addProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newProject: Project = {
            ...projectData,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        setProjects(prev => [...prev, newProject]);

        // 案件マスターに自動同期
        syncToProjectMaster(newProject);
    }, [setProjects, syncToProjectMaster]);

    // 案件を更新
    const updateProject = useCallback((id: string, updates: Partial<Project>) => {
        setProjects(prev =>
            prev.map(project => {
                if (project.id === id) {
                    const updatedProject = { ...project, ...updates, updatedAt: new Date() };
                    // 案件マスターに自動同期
                    syncToProjectMaster(updatedProject);
                    return updatedProject;
                }
                return project;
            })
        );
    }, [setProjects, syncToProjectMaster]);

    // 複数の案件を一括更新
    const updateProjects = useCallback((updates: Array<{ id: string; data: Partial<Project> }>) => {
        setProjects(prev =>
            prev.map(project => {
                const update = updates.find(u => u.id === project.id);
                if (update) {
                    const updatedProject = { ...project, ...update.data, updatedAt: new Date() };
                    // 案件マスターに自動同期
                    syncToProjectMaster(updatedProject);
                    return updatedProject;
                }
                return project;
            })
        );
    }, [setProjects, syncToProjectMaster]);

    // 案件を削除
    const deleteProject = useCallback((id: string) => {
        setProjects(prev => prev.filter(project => project.id !== id));
    }, [setProjects]);

    // IDで案件を取得
    const getProjectById = useCallback((id: string) => {
        return projects.find(project => project.id === id);
    }, [projects]);

    // 案件をカレンダーイベントに展開
    const getCalendarEvents = useCallback((): CalendarEvent[] => {
        const events: CalendarEvent[] = [];

        projects.forEach(project => {
            // 新しい構造: workSchedules
            if (project.workSchedules && project.workSchedules.length > 0) {
                project.workSchedules.forEach(schedule => {
                    schedule.dailySchedules.forEach((daily, index) => {
                        const dateKey = daily.date.toISOString().split('T')[0];
                        events.push({
                            ...project,
                            id: `${project.id}-${schedule.type}-${dateKey}`,
                            startDate: daily.date,
                            endDate: daily.date,
                            constructionType: schedule.type,
                            color: CONSTRUCTION_TYPE_COLORS[schedule.type],
                            assignedEmployeeId: daily.assignedEmployeeId,
                            workers: daily.workers,
                            trucks: daily.trucks,
                            remarks: daily.remarks,
                            sortOrder: daily.sortOrder,
                        });
                    });
                });
            } else {
                // 後方互換性: 既存のassemblyStartDate/demolitionStartDate
                // 組立イベント
                if (project.assemblyStartDate) {
                    events.push({
                        ...project,
                        id: `${project.id}-assembly`,
                        startDate: project.assemblyStartDate,
                        endDate: project.assemblyEndDate,
                        constructionType: 'assembly',
                        color: CONSTRUCTION_TYPE_COLORS.assembly,
                    });
                }

                // 解体イベント
                if (project.demolitionStartDate) {
                    events.push({
                        ...project,
                        id: `${project.id}-demolition`,
                        startDate: project.demolitionStartDate,
                        endDate: project.demolitionEndDate,
                        constructionType: 'demolition',
                        color: CONSTRUCTION_TYPE_COLORS.demolition,
                    });
                }

                // 後方互換性: 組立・解体の日程がない場合はconstrucationTypeを使用
                if (!project.assemblyStartDate && !project.demolitionStartDate && project.constructionType) {
                    events.push({
                        ...project,
                        color: CONSTRUCTION_TYPE_COLORS[project.constructionType],
                    });
                }
            }
        });

        return events;
    }, [projects]);

    return (
        <ProjectContext.Provider
            value={{
                projects,
                addProject,
                updateProject,
                updateProjects,
                deleteProject,
                getProjectById,
                getCalendarEvents,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
}
