// 単価マスターの型定義

// テンプレートタイプ
export type TemplateType = 'frequent' | 'large' | 'medium' | 'residential';

// テンプレートラベル
export const TEMPLATE_LABELS: Record<TemplateType, string> = {
    frequent: 'よく使う項目',
    large: '大規模見積用',
    medium: '中規模見積用',
    residential: '住宅見積用',
};

// 単価マスター
export interface UnitPriceMaster {
    id: string;
    description: string;    // 品目・内容
    unit: string;          // 単位（例: 式、m、個、日）
    unitPrice: number;     // 単価
    templates: TemplateType[]; // 所属するテンプレート（複数可）
    notes?: string;        // 備考
    createdAt: Date;
    updatedAt: Date;
}

// 単価マスター作成時の入力データ
export type UnitPriceMasterInput = Omit<UnitPriceMaster, 'id' | 'createdAt' | 'updatedAt'>;
