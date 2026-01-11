import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/profit-dashboard - 全案件の利益サマリー一覧を取得
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'all';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // 案件マスター一覧を取得
        const where: Record<string, unknown> = {};
        if (status !== 'all') {
            where.status = status;
        }

        const projectMasters = await prisma.projectMaster.findMany({
            where,
            include: {
                assignments: {
                    include: {
                        dailyReportWorkItems: {
                            include: {
                                dailyReport: true,
                            },
                        },
                    },
                    where: startDate && endDate ? {
                        date: {
                            gte: new Date(startDate),
                            lte: new Date(endDate),
                        },
                    } : undefined,
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // システム設定を取得
        const settings = await prisma.systemSettings.findFirst() || {
            laborDailyRate: 15000,
            standardWorkMinutes: 480,
        };

        const minuteRate = settings.laborDailyRate / settings.standardWorkMinutes;

        // 各案件の利益を計算
        const profitSummaries = await Promise.all(
            projectMasters.map(async (pm) => {
                // 見積書を取得
                const estimates = await prisma.estimate.findMany({
                    where: { projectMasterId: pm.id },
                });
                const estimateAmount = estimates.reduce((sum, e) => sum + e.total, 0);

                // 請求書を取得
                const invoices = await prisma.invoice.findMany({
                    where: { projectMasterId: pm.id },
                });
                const revenue = invoices.reduce((sum, i) => sum + i.total, 0);

                // 日報から人件費・積込費を計算
                let laborCost = 0;
                let loadingCost = 0;

                for (const assignment of pm.assignments) {
                    const workers = assignment.workers ? JSON.parse(assignment.workers) : [];
                    const workerCount = workers.length || 1;

                    for (const workItem of assignment.dailyReportWorkItems) {
                        laborCost += Math.round(workItem.workMinutes * workerCount * minuteRate);

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

                // 車両費
                let vehicleCost = 0;
                for (const assignment of pm.assignments) {
                    const vehicles = assignment.vehicles ? JSON.parse(assignment.vehicles) : [];
                    for (const vehicleId of vehicles) {
                        const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
                        if (vehicle?.dailyRate) {
                            vehicleCost += vehicle.dailyRate;
                        }
                    }
                }

                // 手動入力の原価
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
                    assignmentCount: pm.assignments.length,
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
            })
        );

        // 集計
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

async function getTotalWorkMinutesForReport(dailyReportId: string): Promise<number> {
    const workItems = await prisma.dailyReportWorkItem.findMany({
        where: { dailyReportId },
    });
    return workItems.reduce((sum, item) => sum + item.workMinutes, 0);
}
