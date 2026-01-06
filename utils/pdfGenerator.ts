import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Estimate } from '@/types/estimate';
import { Project } from '@/types/calendar';
import { CompanyInfo } from '@/types/company';
import { NotoSansJPFont } from './fonts/NotoSansJP-font';

/**
 * 見積書PDF（日本語フォーマット）を生成して出力
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
        });

        // 日本語フォントを追加
        doc.addFileToVFS('NotoSansJP-Regular.ttf', NotoSansJPFont);
        doc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal');
        doc.setFont('NotoSansJP');

        // PDFメタデータを設定
        doc.setProperties({
            title: `見積書 ${estimate.estimateNumber}`,
            subject: `${project.title}の見積書`,
            author: companyInfo.name,
            keywords: '見積書, estimate',
            creator: 'YuSystem'
        });

        // 見積書を生成
        generateEstimatePage(doc, estimate, project, companyInfo);

        // PDFをダウンロード
        const fileName = `見積書_${estimate.estimateNumber}_${new Date().getTime()}.pdf`;
        doc.save(fileName);

        console.log('PDF生成成功:', fileName);
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
): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // 日本語フォントを追加
            doc.addFileToVFS('NotoSansJP-Regular.ttf', NotoSansJPFont);
            doc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal');
            doc.setFont('NotoSansJP');

            doc.setProperties({
                title: `見積書 ${estimate.estimateNumber}`,
                subject: `${project.title}の見積書`,
                author: companyInfo.name,
            });

            generateEstimatePage(doc, estimate, project, companyInfo);

            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            resolve(url);
        } catch (error) {
            console.error('PDF生成エラー:', error);
            reject(error);
        }
    });
}

/**
 * 見積書ページを生成（日本語フォーマット）
 */
function generateEstimatePage(
    doc: jsPDF,
    estimate: Estimate,
    project: Project,
    companyInfo: CompanyInfo
): void {
    const pageWidth = 210;
    const margin = 15;

    let y = margin;

    // ========== ヘッダー部分 ==========
    // 左上: 会社住所
    doc.setFontSize(9);
    y += 5;
    doc.text(`〒${companyInfo.postalCode}`, margin, y);
    y += 4;

    // 住所を複数行に分割
    const addressLines = doc.splitTextToSize(companyInfo.address, 90);
    addressLines.forEach((line: string) => {
        doc.text(line, margin, y);
        y += 4;
    });
    y += 4;

    // 宛先
    doc.setFontSize(11);
    doc.setFont('NotoSansJP', 'normal');
    const customerName = project.customer || '御中';
    doc.text(`${customerName} 御中`, margin, y);
    y += 6;
    doc.setFontSize(9);
    doc.text('ご担当：様', margin + 5, y);

    // 右上: タイトルと日付
    doc.setFontSize(18);
    doc.setFont('NotoSansJP', 'normal');
    const title = '御見積書';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, pageWidth - margin - titleWidth, margin + 10);

    doc.setFontSize(10);
    const date = new Date(estimate.createdAt);
    const dateStr = `発行日： ${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    const dateWidth = doc.getTextWidth(dateStr);
    doc.text(dateStr, pageWidth - margin - dateWidth, margin + 18);

    y += 10;

    // ========== 案件情報テーブル（左側） ==========
    const infoTableX = margin;
    const infoTableWidth = 95;
    y += 5;

    doc.setFontSize(9);
    doc.text('下記の通り御見積申し上げます。', margin, y);
    y += 5;

    // 案件情報テーブル
    autoTable(doc, {
        startY: y,
        margin: { left: infoTableX },
        head: [],
        body: [
            ['件名', project.title || ''],
            ['現場住所', project.location || ''],
            ['有効期限', `発行日より${Math.ceil((new Date(estimate.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))}ヶ月`],
            ['工期', `${Math.ceil((new Date(project.endDate || new Date()).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))}ヶ月`],
            ['支払条件', '従来通り'],
        ],
        theme: 'grid',
        styles: {
            font: 'NotoSansJP',
            fontSize: 9,
            cellPadding: 2,
        },
        columnStyles: {
            0: { cellWidth: 25, fillColor: [245, 245, 245] },
            1: { cellWidth: 70 },
        },
        tableWidth: infoTableWidth,
    });

    const infoTableEndY = (doc as any).lastAutoTable.finalY;

    // ========== 会社情報ボックス（右側） ==========
    const companyBoxX = pageWidth - margin - 85;
    const companyBoxY = y;
    const companyBoxWidth = 85;
    const companyBoxHeight = 70;

    // 外枠
    doc.setLineWidth(0.5);
    doc.rect(companyBoxX, companyBoxY, companyBoxWidth, companyBoxHeight);

    let companyY = companyBoxY + 8;

    // 会社名
    doc.setFontSize(11);
    doc.text(companyInfo.name, companyBoxX + 5, companyY);
    companyY += 6;

    // 住所
    doc.setFontSize(8);
    doc.text(`〒${companyInfo.postalCode}`, companyBoxX + 5, companyY);
    companyY += 4;

    // 住所を複数行に分割
    const companyAddressLines = doc.splitTextToSize(companyInfo.address, 75);
    companyAddressLines.forEach((line: string) => {
        doc.text(line, companyBoxX + 5, companyY);
        companyY += 3.5;
    });
    companyY += 1;

    // 連絡先
    doc.text(`TEL：${companyInfo.tel}`, companyBoxX + 5, companyY);
    companyY += 4;
    if (companyInfo.fax) {
        doc.text(`FAX：${companyInfo.fax}`, companyBoxX + 5, companyY);
        companyY += 4;
    }
    if (companyInfo.email) {
        doc.text(companyInfo.email, companyBoxX + 5, companyY);
        companyY += 5;
    }

    // 担当者
    doc.text(`担当者：${companyInfo.representative}`, companyBoxX + 5, companyY);

    // 備考欄（印鑑用）
    const stampBoxY = companyBoxY + companyBoxHeight - 20;
    doc.setFontSize(8);
    doc.text('備考', companyBoxX + 5, stampBoxY);
    doc.rect(companyBoxX + 20, stampBoxY - 3, 60, 15);

    // ========== 合計金額セクション ==========
    y = Math.max(infoTableEndY, companyBoxY + companyBoxHeight) + 10;

    const totalBoxX = margin + 20;
    const totalBoxWidth = pageWidth - margin * 2 - 40;

    doc.setFontSize(12);
    doc.text('合計金額', totalBoxX, y);

    doc.setFontSize(18);
    const totalStr = `¥${estimate.total.toLocaleString()}`;
    const totalWidth = doc.getTextWidth(totalStr);
    doc.text(totalStr, totalBoxX + totalBoxWidth - totalWidth, y);
    doc.setFontSize(12);
    doc.text('(税込)', totalBoxX + totalBoxWidth + 2, y);

    y += 2;
    doc.setLineWidth(0.3);
    doc.line(totalBoxX, y, totalBoxX + totalBoxWidth, y);
    y += 5;

    // 小計・消費税
    doc.setFontSize(10);
    doc.text('小計', totalBoxX + 20, y);
    doc.text(`¥${estimate.subtotal.toLocaleString()}`, totalBoxX + totalBoxWidth - doc.getTextWidth(`¥${estimate.subtotal.toLocaleString()}`), y);
    y += 5;

    doc.text('消費税(10%)', totalBoxX + 20, y);
    doc.text(`¥${estimate.tax.toLocaleString()}`, totalBoxX + totalBoxWidth - doc.getTextWidth(`¥${estimate.tax.toLocaleString()}`), y);

    y += 10;

    // ========== 明細テーブル ==========
    const tableData: any[] = [];

    estimate.items.forEach((item, index) => {
        tableData.push([
            (index + 1).toString(),
            item.description || '',
            item.specification || '',
            item.quantity.toString(),
            item.unit || '式',
            item.unitPrice > 0 ? item.unitPrice.toLocaleString() : '',
            item.amount.toLocaleString(),
            item.notes || '',
        ]);
    });

    // 空行を追加
    const maxRows = 10;
    for (let i = estimate.items.length; i < maxRows; i++) {
        tableData.push(['', '', '', '', '', '', '', '']);
    }

    // 小計行
    tableData.push(['', '', '', '', '', '小計', estimate.subtotal.toLocaleString(), '']);

    autoTable(doc, {
        startY: y,
        head: [['No', '名称', '規格', '数量', '単位', '単価', '金額', '備考']],
        body: tableData,
        theme: 'grid',
        styles: {
            font: 'NotoSansJP',
            fontSize: 8,
            cellPadding: 1.5,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            halign: 'center',
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 45 },
            2: { cellWidth: 35 },
            3: { cellWidth: 12, halign: 'right' },
            4: { cellWidth: 12, halign: 'center' },
            5: { cellWidth: 20, halign: 'right' },
            6: { cellWidth: 22, halign: 'right' },
            7: { cellWidth: 24 },
        },
        didParseCell: (data) => {
            // 小計行を太字に
            if (data.row.index === tableData.length - 1) {
                data.cell.styles.fontStyle = 'bold';
            }
        },
    });

    // 備考
    if (estimate.notes) {
        const notesY = (doc as any).lastAutoTable.finalY + 5;
        doc.setFontSize(9);
        doc.text('備考：', margin, notesY);
        const notesLines = doc.splitTextToSize(estimate.notes, pageWidth - margin * 2);
        notesLines.forEach((line: string, index: number) => {
            doc.text(line, margin, notesY + 5 + (index * 4));
        });
    }
}
