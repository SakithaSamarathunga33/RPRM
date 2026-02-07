'use client';

import { useState } from 'react';
import { BarChart3, LayoutGrid, Users, Trophy, Coins } from 'lucide-react';
import FinancialSummaryReport from './financial-summary/FinancialSummaryReport';
import LoyaltyRankingsReport from './loyalty-rankings/LoyaltyRankingsReport';
import PlayerActivityReport from './player-activity/PlayerActivityReport';
import TableSummaryReport from './table-summary/TableSummaryReport';
import DailySummaryReport from './daily-summary/DailySummaryReport';


interface ReportsTabProps {
    data: any;
    loading: boolean;
    date: string;
    onDateChange: (date: string) => void;
}

export default function ReportsTab({ data, loading, date, onDateChange }: ReportsTabProps) {
    const [activeReport, setActiveReport] = useState<string | null>(null);

    const reports = [
        {
            title: 'Daily Summary (EOD)',
            description: 'Complete EOD report',
            icon: <BarChart3 className="w-10 h-10 text-blue-500 mb-2" />,
            id: 'daily-summary'
        },
        {
            title: 'Table Summary',
            description: 'All tables with rake',
            icon: <LayoutGrid className="w-10 h-10 text-red-500 mb-2" />,
            id: 'table-summary'
        },
        {
            title: 'Player Activity',
            description: 'Sessions, buy-ins, results',
            icon: <Users className="w-10 h-10 text-purple-600 mb-2" />,
            id: 'player-activity'
        },
        {
            title: 'Loyalty Rankings',
            description: 'Player rankings YTD',
            icon: <Trophy className="w-10 h-10 text-yellow-500 mb-2" />,
            id: 'loyalty-rankings'
        },
        {
            title: 'Financial Summary',
            description: 'Rake, share, P&L',
            icon: <Coins className="w-10 h-10 text-green-600 mb-2" />,
            id: 'financial-summary'
        }
    ];

    if (activeReport === 'financial-summary') {
        return (
            <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-5">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800">Reports</h2>
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-slate-300 rounded-md text-base sm:text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px] sm:min-h-0 touch-manipulation"
                        />
                    </div>
                </div>
                <FinancialSummaryReport
                    date={date}
                    onClose={() => setActiveReport(null)}
                    data={data}
                />
            </section>
        );
    }

    if (activeReport === 'loyalty-rankings') {
        return (
            <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-5">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800">Reports</h2>
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-slate-300 rounded-md text-base sm:text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px] sm:min-h-0 touch-manipulation"
                        />
                    </div>
                </div>
                <LoyaltyRankingsReport
                    date={date}
                    onClose={() => setActiveReport(null)}
                    data={data}
                />
            </section>
        );
    }

    if (activeReport === 'player-activity') {
        return (
            <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-5">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800">Reports</h2>
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-slate-300 rounded-md text-base sm:text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px] sm:min-h-0 touch-manipulation"
                        />
                    </div>
                </div>
                <PlayerActivityReport
                    date={date}
                    onClose={() => setActiveReport(null)}
                    data={data}
                />
            </section>
        );
    }

    if (activeReport === 'table-summary') {
        return (
            <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-5">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800">Reports</h2>
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-slate-300 rounded-md text-base sm:text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px] sm:min-h-0 touch-manipulation"
                        />
                    </div>
                </div>
                <TableSummaryReport
                    date={date}
                    onClose={() => setActiveReport(null)}
                    data={data}
                />
            </section>
        );
    }

    if (activeReport === 'daily-summary') {
        return (
            <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-5">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800">Reports</h2>
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-slate-300 rounded-md text-base sm:text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px] sm:min-h-0 touch-manipulation"
                        />
                    </div>
                </div>
                <DailySummaryReport
                    date={date}
                    onClose={() => setActiveReport(null)}
                    data={data}
                />
            </section>
        );
    }

    return (
        <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">Reports</h2>
                <div className="relative w-full sm:w-auto">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-slate-300 rounded-md text-base sm:text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px] sm:min-h-0 touch-manipulation"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                {reports.map((report) => (
                    <div
                        key={report.id}
                        onClick={() => setActiveReport(report.id)}
                        className="border border-slate-200 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white hover:border-primary/30 min-h-[44px] touch-manipulation"
                    >
                        <div className="bg-slate-50 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-200">
                            {report.icon}
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">{report.title}</h3>
                        <p className="text-xs text-slate-500 font-medium">{report.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
