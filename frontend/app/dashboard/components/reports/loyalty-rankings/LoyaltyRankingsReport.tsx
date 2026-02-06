'use client';

import React from 'react';
import { FileText, FileDown, Printer, X, Trophy } from 'lucide-react';

interface LoyaltyRankingsReportProps {
    date: string;
    onClose: () => void;
    data?: any;
}

export default function LoyaltyRankingsReport({ date, onClose, data }: LoyaltyRankingsReportProps) {
    // Mock data based on the screenshot, currently showing "No data"
    const rankings: any[] = [];

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
                <span className="p-1 rounded bg-yellow-100 text-yellow-600"><Trophy className="w-5 h-5" /></span>
                Loyalty Rankings (Year-to-Date)
            </h3>

            {/* Rankings Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-bold">Rank</th>
                                <th className="px-6 py-3 font-bold">ID</th>
                                <th className="px-6 py-3 font-bold">Player</th>
                                <th className="px-6 py-3 font-bold">Tier</th>
                                <th className="px-6 py-3 font-bold text-right">Hours (YTD)</th>
                                <th className="px-6 py-3 font-bold text-right">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankings.length > 0 ? (
                                rankings.map((player: any, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4">{player.rank}</td>
                                        <td className="px-6 py-4">{player.id}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{player.name}</td>
                                        <td className="px-6 py-4">{player.tier}</td>
                                        <td className="px-6 py-4 text-right">{player.hours}</td>
                                        <td className="px-6 py-4 text-right">{player.points}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
