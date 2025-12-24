'use client';

import React from 'react';
import { useProjects } from '../contexts/ProjectContext';
import { useProjectMaster } from '../contexts/ProjectMasterContext';
import { useProjectAssignment } from '../contexts/ProjectAssignmentContext';
import { migrateProjectData } from '../utils/dataMigration';

export default function DataMigrationButton() {
    const { projects } = useProjects();
    const { projectMasters, addProjectMaster } = useProjectMaster();
    const { addProjectAssignment } = useProjectAssignment();

    const handleMigration = () => {
        if (projectMasters.length > 0) {
            const confirm = window.confirm(
                '既に案件マスターデータが存在します。上書きしますか?'
            );
            if (!confirm) return;
        }

        try {
            const { projectMasters: masters, projectAssignments: assignments } =
                migrateProjectData(projects);

            // 案件マスターを追加
            masters.forEach((master) => {
                addProjectMaster({
                    siteName: master.siteName,
                    parentCompany: master.parentCompany,
                    constructionTypes: master.constructionTypes,
                });
            });

            // 案件割り当てを追加
            assignments.forEach((assignment) => {
                addProjectAssignment({
                    projectMasterId: assignment.projectMasterId,
                    constructionType: assignment.constructionType,
                    actualStartDate: assignment.actualStartDate,
                    actualEndDate: assignment.actualEndDate,
                    leaderId: assignment.leaderId,
                    memberCount: assignment.memberCount,
                    assignedStaff: assignment.assignedStaff,
                });
            });

            alert(
                `データ移行が完了しました!\n案件マスター: ${masters.length}件\n案件割り当て: ${assignments.length}件`
            );
        } catch (error) {
            console.error('データ移行エラー:', error);
            alert('データ移行中にエラーが発生しました。コンソールを確認してください。');
        }
    };

    return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">
                データ移行ツール
            </h3>
            <p className="text-sm text-yellow-700 mb-4">
                既存の案件データを新しい案件マスター・割り当てシステムに移行します。
                <br />
                現在の案件数: {projects.length}件
                <br />
                案件マスター数: {projectMasters.length}件
            </p>
            <button
                onClick={handleMigration}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
                データを移行する
            </button>
        </div>
    );
}
