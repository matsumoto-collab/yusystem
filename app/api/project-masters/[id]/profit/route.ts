import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/project-masters/[id]/profit - 案件の利益サマリーを取得
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 案件マスターを取得
        const projectMaster = await prisma.projectMaster.findUnique({
            where: { id },
            include: {
                assignments: {
                    include: {
                        dailyReportWorkItems: {
                            include: {
                                dailyReport: true,
                            },
                        },
                    },
                },
            },
        });

        if (!projectMaster) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // システム設定を取得
        const settings = await prisma.systemSettings.findFirst() || {
            laborDailyRate: 15000,
            standardWorkMinutes: 480,
        };

        // 見積書を取得
        const estimates = await prisma.estimate.findMany({
            where: { projectMasterId: id },
        });
        const estimateAmount = estimates.reduce((sum, e) => sum + e.total, 0);

        // 請求書を取得
        const invoices = await prisma.invoice.findMany({
            where: { projectMasterId: id },
        });
        const revenue = invoices.reduce((sum, i) => sum + i.total, 0);

        // 日報から人件費・積込費を計算
        let laborCost = 0;
        let loadingCost = 0;
        const minuteRate = settings.laborDailyRate / settings.standardWorkMinutes;

        for (const assignment of projectMaster.assignments) {
            // 配置の作業者数
            const workers = assignment.workers ? JSON.parse(assignment.workers) : [];
            const workerCount = workers.length || 1;

            for (const workItem of assignment.dailyReportWorkItems) {
                // 作業時間から人件費を計算
                laborCost += Math.round(workItem.workMinutes * workerCount * minuteRate);

                // 積込時間（日報単位で計算、作業割合で按分）
                if (workItem.dailyReport) {
                    const totalWorkMinutes = await getTotalWorkMinutesForReport(workItem.dailyReport.id);
                    if (totalWorkMinutes > 0) {
                        const ratio = workItem.workMinutes / totalWorkMinutes;
                        const morningLoading = workItem.dailyReport.morningLoadingMinutes * ratio;
                        const eveningLoading = workItem.dailyReport.eveningLoadingMinutes * ratio;
                        loadingCost += Math.round((morningLoading + eveningLoading) * workerCount * minuteRate);
                    }
                }
            }
        }

        // 車両費を計算（配置の車両数 × 車両日額）
        let vehicleCost = 0;
        for (const assignment of projectMaster.assignments) {
            const vehicles = assignment.vehicles ? JSON.parse(assignment.vehicles) : [];
            for (const vehicleId of vehicles) {
                const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
                if (vehicle?.dailyRate) {
                    vehicleCost += vehicle.dailyRate;
                }
            }
        }

        // 手動入力の原価
        const materialCost = projectMaster.materialCost || 0;
        const subcontractorCost = projectMaster.subcontractorCost || 0;
        const otherExpenses = projectMaster.otherExpenses || 0;

        // 合計原価
        const totalCost = laborCost + loadingCost + vehicleCost + materialCost + subcontractorCost + otherExpenses;

        // 粗利・利益率
        const grossProfit = revenue - totalCost;
        const profitMargin = revenue > 0 ? Math.round((grossProfit / revenue) * 1000) / 10 : 0;

        return NextResponse.json({
            projectMasterId: id,
            projectTitle: projectMaster.title,
            revenue,
            estimateAmount,
            costBreakdown: {
                laborCost,
                loadingCost,
                vehicleCost,
                materialCost,
                subcontractorCost,
                otherExpenses,
                totalCost,
            },
            grossProfit,
            profitMargin,
        });
    } catch (error) {
        console.error('Failed to calculate profit:', error);
        return NextResponse.json({ error: 'Failed to calculate profit' }, { status: 500 });
    }
}

// 日報の総作業時間を取得（按分計算用）
async function getTotalWorkMinutesForReport(dailyReportId: string): Promise<number> {
    const workItems = await prisma.dailyReportWorkItem.findMany({
        where: { dailyReportId },
    });
    return workItems.reduce((sum, item) => sum + item.workMinutes, 0);
}
