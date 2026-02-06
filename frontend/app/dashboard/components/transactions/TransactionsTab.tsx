'use client';

import { fmt, fmt2 } from '../shared/utils';

interface TransactionsTabProps {
    data: any;
    loading: boolean;
    date: string;
    onDateChange: (date: string) => void;
    showToast: (msg: string, type?: string) => void;
}

export default function TransactionsTab({ data, loading, date, onDateChange, showToast }: TransactionsTabProps) {
    return (
        <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
                <h2 className="text-xl text-primary">Transactions</h2>
                <div className="flex gap-2 items-center">
                    <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className="px-3 py-2 border-2 border-slate-200 rounded-md text-sm" />
                    <button type="button" className="px-4 py-2 rounded-md text-sm font-semibold bg-accent text-white hover:opacity-90" onClick={() => showToast('Use dashboard tables to record expenses/buyins.', 'info')}>
                        + Record Expense
                    </button>
                </div>
            </div>
            {loading || !data || !data.transactions ? (
                <div className="text-muted">Loading...</div>
            ) : data.transactions.length === 0 ? (
                <p className="text-center text-muted py-10">No transactions for this date.</p>
            ) : (
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold text-primary">#</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Time</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Type</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Player</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Amount</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Currency</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">FX</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">LKR</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.transactions.map((t: any) => (
                            <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="px-3 py-2.5">{t.id}</td>
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
            )}
        </section>
    );
}
