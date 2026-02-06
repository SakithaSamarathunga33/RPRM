'use client';

import React from 'react';
import { FileText, FileDown, Printer, X, Coins } from 'lucide-react';

interface FinancialSummaryReportProps {
    date: string;
    onClose: () => void;
    data?: any; // We might want to pass real data later
}

export default function FinancialSummaryReport({ date, onClose, data }: FinancialSummaryReportProps) {
    // Mock data based on the screenshot, or use provided data if available
    const financialData = {
        totalBuyIns: 0,
        totalCashOuts: 0,
        totalRake: 0,
        casinoShare: 0, // 50%
        houseRevenue: 0,
        expenses: 0,
        netResult: 0,
        tablesCount: 0,
        playersCount: 0,
        hoursCount: 0.00,
        pointsCount: 0
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Action Bar */}
            <div className="flex flex-wrap gap-2 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100 items-center">
                <button className="flex items-center gap-2 bg-[#1e293b] text-white px-4 py-2 rounded shadow hover:bg-slate-800 transition-colors text-sm font-medium">
                    <FileText className="w-4 h-4" /> Export CSV
                </button>
                <button className="flex items-center gap-2 bg-[#ef4444] text-white px-4 py-2 rounded shadow hover:bg-red-600 transition-colors text-sm font-medium">
                    <FileDown className="w-4 h-4" /> Export PDF
                </button>
                <button className="flex items-center gap-2 bg-[#1e293b] text-white px-4 py-2 rounded shadow hover:bg-slate-800 transition-colors text-sm font-medium">
                    <Printer className="w-4 h-4" /> Print
                </button>
                <div className="flex-1"></div>
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded shadow-sm hover:bg-slate-300 transition-colors text-sm font-medium"
                >
                    <X className="w-4 h-4" /> Close Report
                </button>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800">
                <span className="p-1 rounded bg-orange-100 text-orange-600"><Coins className="w-5 h-5" /></span>
                Financial Summary — {date}
            </h3>

            {/* Summary Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <span className="text-slate-600 font-medium h-9 flex items-center">Total Buy-ins</span>
                    <span className="font-semibold text-slate-800 h-9 flex items-center">{financialData.totalBuyIns}</span>
                </div>
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <span className="text-slate-600 font-medium h-9 flex items-center">Total Cash-outs</span>
                    <span className="font-semibold text-slate-800 h-9 flex items-center">{financialData.totalCashOuts}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-100 border-b border-green-200">
                    <span className="text-green-900 font-bold h-9 flex items-center">Total Rake</span>
                    <span className="font-bold text-green-900 h-9 flex items-center">{financialData.totalRake}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-100 border-b border-red-200">
                    <span className="text-red-900 font-medium h-9 flex items-center">Casino Share (50%)</span>
                    <span className="font-semibold text-red-900 h-9 flex items-center">-{financialData.casinoShare}</span>
                </div>
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <span className="text-slate-600 font-medium h-9 flex items-center">House Revenue</span>
                    <span className="font-semibold text-slate-800 h-9 flex items-center">{financialData.houseRevenue}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-100 border-b border-red-200">
                    <span className="text-red-900 font-medium h-9 flex items-center">Expenses</span>
                    <span className="font-semibold text-red-900 h-9 flex items-center">-{financialData.expenses}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-[#1e293b] text-white">
                    <span className="font-bold uppercase tracking-wide h-9 flex items-center">NET RESULT</span>
                    <span className="font-bold text-lg h-9 flex items-center">{financialData.netResult}</span>
                </div>
            </div>

            {/* Bottom Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-center">
                    <div className="text-2xl font-bold text-slate-800 mb-1">{financialData.tablesCount}</div>
                    <div className="text-xs text-slate-500 uppercase font-medium">Tables</div>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-center">
                    <div className="text-2xl font-bold text-slate-800 mb-1">{financialData.playersCount}</div>
                    <div className="text-xs text-slate-500 uppercase font-medium">Players</div>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-center">
                    <div className="text-2xl font-bold text-slate-800 mb-1">{financialData.hoursCount.toFixed(2)}</div>
                    <div className="text-xs text-slate-500 uppercase font-medium">Hours</div>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-center">
                    <div className="text-2xl font-bold text-slate-800 mb-1">{financialData.pointsCount}</div>
                    <div className="text-xs text-slate-500 uppercase font-medium">Points</div>
                </div>
            </div>
        </div>
    );
}
