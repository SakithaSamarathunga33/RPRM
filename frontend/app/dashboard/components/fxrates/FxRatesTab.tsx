'use client';

import { fmt2 } from '../shared/utils';

interface FxRatesTabProps {
    data: any;
    loading: boolean;
    date: string;
    onDateChange: (date: string) => void;
}

export default function FxRatesTab({ data, loading, date, onDateChange }: FxRatesTabProps) {
    return (
        <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
                <h2 className="text-xl text-primary">FX Rates</h2>
                <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className="px-3 py-2 border-2 border-slate-200 rounded-md text-sm" />
            </div>
            {loading || !data ? (
                <div className="text-muted">Loading...</div>
            ) : !data.rates?.length && !data.currencies?.length ? (
                <p className="text-center text-muted py-10">No FX rates for this date.</p>
            ) : (
                <div className="bg-slate-50 p-5 rounded-lg">
                    <h3 className="text-primary mb-3">💱 Exchange Rates to LKR</h3>
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold text-primary">Currency</th>
                                <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Rate to LKR</th>
                                <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Array.isArray(data.rates) ? data.rates : []).map((r: any, i: number) => (
                                <tr key={r.id ?? i} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="px-3 py-2.5 font-semibold">{r.currency_code}</td>
                                    <td className="px-3 py-2.5 text-right">{fmt2(r.rate_to_lkr)}</td>
                                    <td className="px-3 py-2.5">{r.effective_date ?? date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!data.rates?.length && data.currencies?.length) ? (
                        <p className="mt-3 text-muted text-sm">Currencies configured: {data.currencies.map((c: any) => c.code).join(', ')}. Add rates for the selected date.</p>
                    ) : null}
                </div>
            )}
        </section>
    );
}
