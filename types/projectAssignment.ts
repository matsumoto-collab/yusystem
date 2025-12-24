/**
 * 案件割り当て型定義
 * 案件マスターを特定の職長に割り当てた情報を管理
 */

import { ConstructionType } from './projectMaster';

/**
 * 案件割り当て
 * 案件マスターを職長に割り当て、実際の作業日程とスタッフを管理
 */
export interface ProjectAssignment {
    id: string;
    projectMasterId: string;      // 案件マスターへの参照
    constructionType: ConstructionType; // 工事種別
    actualStartDate: string;      // 実際の開始日 (YYYY-MM-DD)
    actualEndDate?: string;       // 実際の終了日 (YYYY-MM-DD)
    leaderId: string;             // 職長ID
    memberCount: number;          // 作業員数
    assignedStaff: string[];      // 割り当てられたスタッフID
    createdAt: string;            // 作成日時 (ISO 8601)
    updatedAt: string;            // 更新日時 (ISO 8601)
}
