'use client';

import React from 'react';
import { FileText, FileDown, Printer, X, Users } from 'lucide-react';

interface PlayerActivityReportProps {
    date: string;
    onClose: () => void;
    data?: any;
}

export default function PlayerActivityReport({ date, onClose, data }: PlayerActivityReportProps) {
    // Mock data based on the screenshot, currently showing "No activity"
    const activities: any[] = [];

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
                <span className="p-1 rounded bg-purple-100 text-purple-600"><Users className="w-5 h-5" /></span>
                Player Activity — {date}
            </h3>

            {/* Activities Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-bold">ID</th>
                                <th className="px-6 py-3 font-bold">Player</th>
                                <th className="px-6 py-3 font-bold">Table</th>
                                <th className="px-6 py-3 font-bold text-center">Hours</th>
                                <th className="px-6 py-3 font-bold text-right">Buy-in</th>
                                <th className="px-6 py-3 font-bold text-right">Cash-out</th>
                                <th className="px-6 py-3 font-bold text-right">Net</th>
                                <th className="px-6 py-3 font-bold text-right">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.length > 0 ? (
                                activities.map((activty: any, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4">{activty.id}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{activty.player}</td>
                                        <td className="px-6 py-4">{activty.table}</td>
                                        <td className="px-6 py-4 text-center">{activty.hours}</td>
                                        <td className="px-6 py-4 text-right">{activty.buyIn}</td>
                                        <td className="px-6 py-4 text-right">{activty.cashOut}</td>
                                        <td className={`px-6 py-4 text-right font-medium ${activty.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {activty.net}
                                        </td>
                                        <td className="px-6 py-4 text-right">{activty.points}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                                        No activity
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
