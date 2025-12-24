/**
 * 案件マスター型定義
 * 案件の基本情報(現場名、元請会社、工事種別、予定日など)を管理
 */

export type ConstructionType = 'assembly' | 'demolition' | 'other';

/**
 * 工事種別情報(予定日を含む)
 */
export interface ConstructionTypeInfo {
    type: ConstructionType;
    scheduledStartDate?: string; // 予定開始日 (YYYY-MM-DD)
    scheduledEndDate?: string;   // 予定終了日 (YYYY-MM-DD)
}

/**
 * 案件マスター
 * 案件の基本情報を保持し、複数の割り当てで再利用可能
 */
export interface ProjectMaster {
    id: string;
    siteName: string;                          // 現場名
    parentCompany?: string;                    // 元請会社
    constructionTypes: ConstructionTypeInfo[]; // 工事種別と予定日
    createdAt: string;                         // 作成日時 (ISO 8601)
    updatedAt: string;                         // 更新日時 (ISO 8601)
}
