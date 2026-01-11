import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/profit-dashboard - 全案件の利益サマリー一覧を取得（最適化版）
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'all';

        // 案件マスター一覧を取得（配置数のみカウント）
        const where: Record<string, unknown> = {};
        if (status !== 'all') {
            where.status = status;
        }

        // 1. 全案件を一括取得
        const projectMasters = await prisma.projectMaster.findMany({
            where,
            select: {
                id: true,
                title: true,
                customerName: true,
                status: true,
                materialCost: true,
                subcontractorCost: true,
                otherExpenses: true,
                updatedAt: true,
                _count: {
                    select: { assignments: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        const projectIds = projectMasters.map(pm => pm.id);

        // 2. 見積書を一括取得してグループ化
        const estimates = await prisma.estimate.findMany({
            where: { projectMasterId: { in: projectIds } },
            select: { projectMasterId: true, total: true },
        });
        const estimateByProject = new Map<string, number>();
        for (const e of estimates) {
            if (e.projectMasterId) {
                estimateByProject.set(
                    e.projectMasterId,
                    (estimateByProject.get(e.projectMasterId) || 0) + e.total
                );
            }
        }

        // 3. 請求書を一括取得してグループ化
        const invoices = await prisma.invoice.findMany({
            where: { projectMasterId: { in: projectIds } },
            select: { projectMasterId: true, total: true },
        });
        const revenueByProject = new Map<string, number>();
        for (const i of invoices) {
            revenueByProject.set(
                i.projectMasterId,
                (revenueByProject.get(i.projectMasterId) || 0) + i.total
            );
        }

        // 4. システム設定を取得
        const settings = await prisma.systemSettings.findFirst();
        const laborDailyRate = settings?.laborDailyRate ?? 15000;
        const standardWorkMinutes = settings?.standardWorkMinutes ?? 480;
        const minuteRate = laborDailyRate / standardWorkMinutes;

        // 5. 日報作業明細を一括取得（配置経由でプロジェクトに紐づけ）
        const workItems = await prisma.dailyReportWorkItem.findMany({
            where: {
                assignment: {
                    projectMasterId: { in: projectIds },
                },
            },
            select: {
                workMinutes: true,
                dailyReport: {
                    select: {
                        morningLoadingMinutes: true,
                        eveningLoadingMinutes: true,
                    },
                },
                assignment: {
                    select: {
                        projectMasterId: true,
                        workers: true,
                    },
                },
            },
        });

        // 日報データをプロジェクトごとに集計
        const laborCostByProject = new Map<string, number>();
        const loadingCostByProject = new Map<string, number>();

        for (const item of workItems) {
            const projectId = item.assignment.projectMasterId;
            const workers = item.assignment.workers ? JSON.parse(item.assignment.workers) : [];
            const workerCount = workers.length || 1;

            // 人件費
            const laborCost = Math.round(item.workMinutes * workerCount * minuteRate);
            laborCostByProject.set(
                projectId,
                (laborCostByProject.get(projectId) || 0) + laborCost
            );

            // 積込費（簡易計算: 作業時間に比例）
            if (item.dailyReport) {
                const loadingMinutes = item.dailyReport.morningLoadingMinutes + item.dailyReport.eveningLoadingMinutes;
                // 積込費は作業時間ベースで按分（簡易版）
                const loadingCost = Math.round(loadingMinutes * 0.5 * workerCount * minuteRate);
                loadingCostByProject.set(
                    projectId,
                    (loadingCostByProject.get(projectId) || 0) + loadingCost
                );
            }
        }

        // 6. 車両費を一括取得（配置から車両IDを取得し、車両日額を合計）
        const assignments = await prisma.projectAssignment.findMany({
            where: { projectMasterId: { in: projectIds } },
            select: { projectMasterId: true, vehicles: true },
        });

        const vehicles = await prisma.vehicle.findMany({
            select: { id: true, dailyRate: true },
        });
        const vehicleRates = new Map<string, number>();
        for (const v of vehicles) {
            vehicleRates.set(v.id, v.dailyRate || 0);
        }

        const vehicleCostByProject = new Map<string, number>();
        for (const a of assignments) {
            const vehicleIds: string[] = a.vehicles ? JSON.parse(a.vehicles) : [];
            let cost = 0;
            for (const vid of vehicleIds) {
                cost += vehicleRates.get(vid) || 0;
            }
            if (cost > 0) {
                vehicleCostByProject.set(
                    a.projectMasterId,
                    (vehicleCostByProject.get(a.projectMasterId) || 0) + cost
                );
            }
        }

        // 7. 結果を組み立て
        const profitSummaries = projectMasters.map(pm => {
            const estimateAmount = estimateByProject.get(pm.id) || 0;
            const revenue = revenueByProject.get(pm.id) || 0;
            const laborCost = laborCostByProject.get(pm.id) || 0;
            const loadingCost = loadingCostByProject.get(pm.id) || 0;
            const vehicleCost = vehicleCostByProject.get(pm.id) || 0;
            const materialCost = pm.materialCost || 0;
            const subcontractorCost = pm.subcontractorCost || 0;
            const otherExpenses = pm.otherExpenses || 0;

            const totalCost = laborCost + loadingCost + vehicleCost + materialCost + subcontractorCost + otherExpenses;
            const grossProfit = revenue - totalCost;
            const profitMargin = revenue > 0 ? Math.round((grossProfit / revenue) * 1000) / 10 : 0;

            return {
                id: pm.id,
                title: pm.title,
                customerName: pm.customerName,
                status: pm.status,
                assignmentCount: pm._count.assignments,
                estimateAmount,
                revenue,
                laborCost,
                loadingCost,
                vehicleCost,
                materialCost,
                subcontractorCost,
                otherExpenses,
                totalCost,
                grossProfit,
                profitMargin,
                updatedAt: pm.updatedAt,
            };
        });

        // 8. 集計
        const summary = {
            totalProjects: profitSummaries.length,
            totalRevenue: profitSummaries.reduce((sum, p) => sum + p.revenue, 0),
            totalCost: profitSummaries.reduce((sum, p) => sum + p.totalCost, 0),
            totalGrossProfit: profitSummaries.reduce((sum, p) => sum + p.grossProfit, 0),
            averageProfitMargin: profitSummaries.length > 0
                ? Math.round(profitSummaries.reduce((sum, p) => sum + p.profitMargin, 0) / profitSummaries.length * 10) / 10
                : 0,
        };

        return NextResponse.json({
            projects: profitSummaries,
            summary,
        });
    } catch (error) {
        console.error('Failed to fetch profit dashboard:', error);
        return NextResponse.json({ error: 'Failed to fetch profit dashboard' }, { status: 500 });
    }
}
