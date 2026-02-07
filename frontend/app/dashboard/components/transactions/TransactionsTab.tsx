'use client';

import { fmt, fmt2 } from '../shared/utils';
import RecordExpenseModal from './RecordExpenseModal';

interface TransactionsTabProps {
    data: any;
    loading: boolean;
    date: string;
    onDateChange: (date: string) => void;
    api?: any;
}

export default function TransactionsTab({ data, loading, date, onDateChange, api }: TransactionsTabProps) {
    const handleRecordExpense = () => {
        if (api?.setModal) {
            api.setModal(
                <RecordExpenseModal
                    date={date}
                    onClose={() => api.setModal(null)}
                    onSuccess={() => api.loadSection('transactions', true)}
                    api={api}
                />
            );
        }
    };

    return (
        <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-5 gap-3">
                <h2 className="text-lg sm:text-xl text-primary">Transactions</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className="w-full sm:w-auto px-3 py-2.5 border-2 border-slate-200 rounded-md text-base sm:text-sm min-h-[44px] touch-manipulation" />
                    <button type="button" className="w-full sm:w-auto px-4 py-2.5 rounded-md text-sm font-semibold bg-accent text-white hover:opacity-90 min-h-[44px] touch-manipulation" onClick={handleRecordExpense}>
                        + Record Expense
                    </button>
                </div>
            </div>
            {loading || !data ? (
                <div className="text-muted">Loading...</div>
            ) : data?.error || data?.success === false ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    <p className="font-medium">Failed to load transactions</p>
                    <p className="text-sm mt-1">{data?.error || 'Please try again.'}</p>
                </div>
            ) : !data?.transactions ? (
                <div className="text-muted">Loading...</div>
            ) : data.transactions.length === 0 ? (
                <p className="text-center text-muted py-10">No transactions for this date.</p>
            ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full min-w-[600px] text-sm border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-200">

                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Time</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Type</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Player</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-right font-semibold">Amount</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Currency</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-right font-semibold">FX</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-right font-semibold">LKR</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.transactions.map((t: any) => (
                            <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">

                                <td className="px-3 py-2.5">{t.transaction_time}</td>
                                <td className="px-3 py-2.5">{t.transaction_type?.toUpperCase()}</td>
                                <td className="px-3 py-2.5">{t.player_name ? `${t.membership_id} ${t.player_name}` : '-'}</td>
                                <td className="px-3 py-2.5 text-right">{fmt2(t.amount_original)}</td>
                                <td className="px-3 py-2.5">{t.currency_code}</td>
                                <td className="px-3 py-2.5 text-right">{fmt2(t.fx_rate)}</td>
                                <td className="px-3 py-2.5 text-right font-semibold">{fmt(t.amount_lkr)}</td>
                                <td className="px-3 py-2.5">{t.notes || ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </section>
    );
}
