'use client';

import React from 'react';
import { FileText, FileDown, Printer, X, LayoutGrid } from 'lucide-react';

interface TableSummaryReportProps {
    date: string;
    onClose: () => void;
    data?: any;
}

export default function TableSummaryReport({ date, onClose, data }: TableSummaryReportProps) {
    // Mock data based on the screenshot, currently showing empty state implied
    const tables: any[] = [];

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
                <span className="p-1 rounded bg-pink-100 text-pink-600"><LayoutGrid className="w-5 h-5" /></span>
                Table Summary — {date}
            </h3>

            {/* Tables Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-bold">Table</th>
                                <th className="px-6 py-3 font-bold">Game</th>
                                <th className="px-6 py-3 font-bold">Stakes</th>
                                <th className="px-6 py-3 font-bold">Start</th>
                                <th className="px-6 py-3 font-bold">End</th>
                                <th className="px-6 py-3 font-bold text-center">Players</th>
                                <th className="px-6 py-3 font-bold text-right">Rake</th>
                                <th className="px-6 py-3 font-bold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tables.length > 0 ? (
                                tables.map((table: any, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{table.name}</td>
                                        <td className="px-6 py-4">{table.game}</td>
                                        <td className="px-6 py-4">{table.stakes}</td>
                                        <td className="px-6 py-4">{table.start}</td>
                                        <td className="px-6 py-4">{table.end}</td>
                                        <td className="px-6 py-4 text-center">{table.players}</td>
                                        <td className="px-6 py-4 text-right">{table.rake}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${table.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {table.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                                        No tables found
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
