import { EstimateItem } from './estimate';

// 請求書
export interface Invoice {
    id: string;
    projectId: string;
    estimateId?: string; // 見積書から変換した場合
    invoiceNumber: string;
    title: string;
    items: EstimateItem[];
    subtotal: number;
    tax: number;
    total: number;
    dueDate: Date;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    paidDate?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// 請求書作成時の入力データ
export type InvoiceInput = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>;
