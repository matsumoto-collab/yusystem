/**
 * データ移行ユーティリティ
 * 既存のProjectデータを新しいProjectMaster/ProjectAssignment構造に変換
 */

import { Project } from '../types/calendar';
import { ProjectMaster, ConstructionTypeInfo } from '../types/projectMaster';
import { ProjectAssignment } from '../types/projectAssignment';

/**
 * 既存のProjectデータをProjectMasterとProjectAssignmentに分割
 */
export function migrateProjectData(projects: Project[]): {
    projectMasters: ProjectMaster[];
    projectAssignments: ProjectAssignment[];
} {
    const projectMasters: ProjectMaster[] = [];
    const projectAssignments: ProjectAssignment[] = [];
    const masterMap = new Map<string, ProjectMaster>(); // siteName -> ProjectMaster

    projects.forEach((project) => {
        const siteName = project.title;
        const parentCompany = project.customer;

        // 既存の案件マスターを探す、なければ作成
        let master = masterMap.get(siteName);
        if (!master) {
            const constructionTypes: ConstructionTypeInfo[] = [];

            // 組立の日程があれば追加
            if (project.assemblyStartDate) {
                constructionTypes.push({
                    type: 'assembly',
                    scheduledStartDate: formatDate(project.assemblyStartDate),
                    scheduledEndDate: project.assemblyEndDate
                        ? formatDate(project.assemblyEndDate)
                        : undefined,
                });
            }

            // 解体の日程があれば追加
            if (project.demolitionStartDate) {
                constructionTypes.push({
                    type: 'demolition',
                    scheduledStartDate: formatDate(project.demolitionStartDate),
                    scheduledEndDate: project.demolitionEndDate
                        ? formatDate(project.demolitionEndDate)
                        : undefined,
                });
            }

            // 工事種別が指定されている場合（旧データ）
            if (project.constructionType && constructionTypes.length === 0) {
                constructionTypes.push({
                    type: project.constructionType,
                    scheduledStartDate: formatDate(project.startDate),
                    scheduledEndDate: project.endDate
                        ? formatDate(project.endDate)
                        : undefined,
                });
            }

            master = {
                id: `master-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                siteName,
                parentCompany,
                constructionTypes,
                createdAt: project.createdAt.toISOString(),
                updatedAt: project.updatedAt.toISOString(),
            };

            masterMap.set(siteName, master);
            projectMasters.push(master);
        }

        // 案件割り当てを作成
        const constructionType = project.constructionType || 'assembly';
        const assignment: ProjectAssignment = {
            id: project.id,
            projectMasterId: master.id,
            constructionType,
            actualStartDate: formatDate(project.startDate),
            actualEndDate: project.endDate ? formatDate(project.endDate) : undefined,
            leaderId: project.assignedEmployeeId || '',
            memberCount: project.workers?.length || 0,
            assignedStaff: project.workers || [],
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
        };

        projectAssignments.push(assignment);
    });

    return { projectMasters, projectAssignments };
}

/**
 * DateをYYYY-MM-DD形式の文字列に変換
 */
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * ProjectMasterとProjectAssignmentから元のProject形式に変換
 * (カレンダー表示用)
 */
export function convertToProject(
    master: ProjectMaster,
    assignment: ProjectAssignment
): Project {
    const constructionTypeInfo = master.constructionTypes.find(
        (ct) => ct.type === assignment.constructionType
    );

    return {
        id: assignment.id,
        title: master.siteName,
        startDate: new Date(assignment.actualStartDate),
        endDate: assignment.actualEndDate
            ? new Date(assignment.actualEndDate)
            : undefined,
        category: 'construction',
        color: getColorByConstructionType(assignment.constructionType),
        customer: master.parentCompany,
        workers: assignment.assignedStaff,
        constructionType: assignment.constructionType,
        assignedEmployeeId: assignment.leaderId,
        createdAt: new Date(assignment.createdAt),
        updatedAt: new Date(assignment.updatedAt),
        projectMasterId: master.id,
        assignmentId: assignment.id,
        // 予定日情報も保持
        assemblyStartDate: constructionTypeInfo?.scheduledStartDate
            ? new Date(constructionTypeInfo.scheduledStartDate)
            : undefined,
        assemblyEndDate: constructionTypeInfo?.scheduledEndDate
            ? new Date(constructionTypeInfo.scheduledEndDate)
            : undefined,
    };
}

/**
 * 工事種別に応じた色を取得
 */
function getColorByConstructionType(type: string): string {
    switch (type) {
        case 'assembly':
            return '#3b82f6'; // 青
        case 'demolition':
            return '#ef4444'; // 赤
        case 'other':
            return '#eab308'; // 黄色
        default:
            return '#3b82f6';
    }
}
