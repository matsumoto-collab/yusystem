import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Estimate } from '@/types/estimate';
import { Project } from '@/types/calendar';
import { CompanyInfo } from '@/types/company';

/**
 * テキストをASCII安全な文字列に変換
 */
function sanitizeText(text: string): string {
    // 基本的なASCII文字のみを許可
    return text.replace(/[^\x20-\x7E]/g, '?');
}

/**
 * 見積書PDF（表紙+内訳）を生成して出力
 */
export function exportEstimatePDF(
    estimate: Estimate,
    project: Project,
    companyInfo: CompanyInfo
): void {
    try {
        // PDFドキュメントを作成
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
            precision: 2,
            userUnit: 1.0,
        });

        // PDFメタデータを設定
        doc.setProperties({
            title: `Estimate ${estimate.estimateNumber}`,
            subject: `Estimate for ${project.title}`,
            author: companyInfo.name,
            keywords: 'estimate, quotation',
            creator: 'YuSystem Estimate Manager'
        });

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;

        // ========== 1ページ目: 見積書表紙 ==========
        generateCoverPage(doc, estimate, project, companyInfo, pageWidth, pageHeight, margin);

        // ========== 2ページ目: 内訳書 ==========
        doc.addPage();
        generateBreakdownPage(doc, estimate, pageWidth, margin);

        // PDFをBlobとして出力し、ダウンロード
        const pdfBlob = doc.output('blob');

        // ファイル名を生成（ASCII文字のみ）
        const safeEstimateNumber = estimate.estimateNumber.replace(/[^a-zA-Z0-9-]/g, '_');
        const safeProjectTitle = project.title.replace(/[^a-zA-Z0-9-]/g, '_');
        const fileName = `Estimate_${safeEstimateNumber}_${safeProjectTitle}.pdf`;

        // Blobからダウンロードリンクを作成
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();

        // メモリ解放
        setTimeout(() => URL.revokeObjectURL(url), 100);

        console.log('PDF生成成功:', fileName, 'サイズ:', Math.round(pdfBlob.size / 1024), 'KB');
    } catch (error) {
        console.error('PDF生成エラー:', error);
        alert('PDFの生成に失敗しました。エラー: ' + (error as Error).message);
    }
}

/**
 * 見積書PDFをBlob URLとして生成（プレビュー用）
 */
export function generateEstimatePDFBlob(
    estimate: Estimate,
    project: Project,
    companyInfo: CompanyInfo
): string {
    try {
        // PDFドキュメントを作成
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
            precision: 2,
            userUnit: 1.0,
        });

        // PDFメタデータを設定
        doc.setProperties({
            title: `Estimate ${estimate.estimateNumber}`,
            subject: `Estimate for ${project.title}`,
            author: companyInfo.name,
            keywords: 'estimate, quotation',
            creator: 'YuSystem Estimate Manager'
        });

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;

        // ========== 1ページ目: 見積書表紙 ==========
        generateCoverPage(doc, estimate, project, companyInfo, pageWidth, pageHeight, margin);

        // ========== 2ページ目: 内訳書 ==========
        doc.addPage();
        generateBreakdownPage(doc, estimate, pageWidth, margin);

        // PDFをBlobとして出力
        const pdfBlob = doc.output('blob');

        // Blob URLを作成して返す
        return URL.createObjectURL(pdfBlob);
    } catch (error) {
        console.error('PDF生成エラー:', error);
        throw error;
    }
}

/**
 * 見積書表紙ページを生成
 */
function generateCoverPage(
    doc: jsPDF,
    estimate: Estimate,
    project: Project,
    companyInfo: CompanyInfo,
    pageWidth: number,
    pageHeight: number,
    margin: number
): void {
    // 外枠
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

    let y = margin + 10;

    // ========== ヘッダー部分 ==========
    // 左上: 現場名
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const siteText = `Site: ${project.title || 'N/A'}`;
    doc.text(siteText, margin + 5, y);

    // 中央: 御見積書
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const title = 'ESTIMATE';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, y);

    // 右上: 日付
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const date = new Date(estimate.createdAt);
    const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    doc.text(dateStr, pageWidth - margin - 5, y, { align: 'right' });

    y += 30;

    // ========== 宛先 ==========
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const customerName = project.customer || 'Customer';
    doc.text(customerName, pageWidth / 2, y, { align: 'center' });

    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('We are pleased to submit our estimate as follows:', pageWidth / 2, y, { align: 'center' });

    y += 20;

    // ========== 御見積金額ボックス ==========
    const boxX = margin + 30;
    const boxWidth = pageWidth - margin * 2 - 60;
    const boxHeight = 50;

    doc.setLineWidth(0.8);
    doc.rect(boxX, y, boxWidth, boxHeight);

    // 御見積金額
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount', boxX + 10, y + 10);

    doc.setFontSize(20);
    const totalStr = `JPY ${estimate.total.toLocaleString()}`;
    doc.text(totalStr, boxX + boxWidth - 10, y + 15, { align: 'right' });

    // 内訳
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const subtotalStr = `JPY ${estimate.subtotal.toLocaleString()}`;
    const taxStr = `JPY ${estimate.tax.toLocaleString()}`;

    doc.text('Subtotal', boxX + 20, y + 30);
    doc.text(subtotalStr, boxX + boxWidth - 10, y + 30, { align: 'right' });

    doc.text('Tax (10%)', boxX + 20, y + 38);
    doc.text(taxStr, boxX + boxWidth - 10, y + 38, { align: 'right' });

    doc.text('Adjustment', boxX + 20, y + 46);
    doc.text('-', boxX + boxWidth - 10, y + 46, { align: 'right' });

    y += boxHeight + 15;

    // ========== 案件情報 ==========
    doc.setFontSize(10);
    const infoX = margin + 10;

    doc.text(`Project: ${project.title}`, infoX, y);
    y += 6;

    doc.text(`Location: ${project.location || 'N/A'}`, infoX, y);
    y += 6;

    const startDate = project.startDate ? new Date(project.startDate) : new Date();
    const endDate = project.endDate ? new Date(project.endDate) : new Date();
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    doc.text(`Duration: ${duration} month(s)`, infoX, y);
    y += 6;

    doc.text('Payment Terms: To be discussed', infoX, y);
    y += 6;

    const validDate = new Date(estimate.validUntil);
    const validMonths = Math.ceil((validDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));
    doc.text(`Valid Until: ${validMonths} month(s)`, infoX, y);

    // ========== フッター: 会社情報 ==========
    const footerY = pageHeight - margin - 30;
    const footerX = pageWidth - margin - 60;

    doc.setFontSize(9);
    doc.text(companyInfo.name, footerX, footerY, { align: 'right' });
    doc.text(`Representative: ${companyInfo.representative}`, footerX, footerY + 5, { align: 'right' });
    doc.text(companyInfo.postalCode, footerX, footerY + 10, { align: 'right' });
    doc.text(companyInfo.address, footerX, footerY + 15, { align: 'right' });
    doc.text(`${companyInfo.tel}  ${companyInfo.fax || ''}`, footerX, footerY + 20, { align: 'right' });
}

/**
 * 内訳書ページを生成
 */
function generateBreakdownPage(
    doc: jsPDF,
    estimate: Estimate,
    pageWidth: number,
    margin: number
): void {
    // タイトル
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('BREAKDOWN', pageWidth / 2, margin, { align: 'center' });

    // テーブルデータの準備
    const tableData: any[] = [];

    // 明細行を追加
    estimate.items.forEach((item, index) => {
        tableData.push([
            (index + 1).toString(),
            item.description || '',
            item.quantity.toString(),
            'm2', // 単位は固定（必要に応じて変更可能）
            item.unitPrice > 0 ? item.unitPrice.toLocaleString() : '',
            item.amount.toLocaleString(),
            '', // 備考
        ]);
    });

    // 空行を追加（最大15行まで）
    const maxRows = 15;
    for (let i = estimate.items.length; i < maxRows; i++) {
        tableData.push([
            (i + 1).toString(),
            '',
            '',
            '',
            '',
            '0',
            '',
        ]);
    }

    // テーブル生成
    autoTable(doc, {
        startY: margin + 10,
        head: [['No.', 'Description', 'Qty', 'Unit', 'Unit Price', 'Amount', 'Notes']],
        body: tableData,
        theme: 'grid',
        styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 2,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center',
        },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 65 },
            2: { cellWidth: 18, halign: 'right' },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 25, halign: 'right' },
            5: { cellWidth: 28, halign: 'right' },
            6: { cellWidth: 27 },
        },
        didDrawPage: (data) => {
            // ページ番号を追加
            doc.setFontSize(8);
            doc.text(
                `Page ${doc.getCurrentPageInfo().pageNumber}`,
                pageWidth / 2,
                285,
                { align: 'center' }
            );
        },
    });

    // 合計行
    const finalY = (doc as any).lastAutoTable.finalY + 5;

    // 合計テーブル
    autoTable(doc, {
        startY: finalY,
        body: [
            ['', '', '', '', 'Subtotal', estimate.subtotal.toLocaleString()],
            ['', '', '', '', 'Tax (10%)', estimate.tax.toLocaleString()],
            ['', '', '', '', 'Total', estimate.total.toLocaleString()],
        ],
        theme: 'plain',
        styles: {
            fontSize: 10,
            cellPadding: 2,
            font: 'helvetica',
        },
        columnStyles: {
            0: { cellWidth: 12 },
            1: { cellWidth: 65 },
            2: { cellWidth: 18 },
            3: { cellWidth: 15 },
            4: { cellWidth: 25, fontStyle: 'bold', halign: 'right' },
            5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
        },
    });

    // 備考
    if (estimate.notes) {
        const notesY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Notes:', margin, notesY);
        doc.text(estimate.notes, margin, notesY + 5);
    }
}
