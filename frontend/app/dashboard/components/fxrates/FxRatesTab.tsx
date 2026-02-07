'use client';

import React, { useState, useEffect } from 'react';
import { updateFxRate } from '@/lib/api';

interface FxRatesTabProps {
    data: any;
    loading: boolean;
    date: string;
    onDateChange: (date: string) => void;
    api?: any;
}

export default function FxRatesTab({ data, loading, date, onDateChange, api }: FxRatesTabProps) {
    // Standard currencies matching the screenshot
    const defaultCurrencies = [
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound' },
        { code: 'AUD', name: 'Australian Dollar' },
        { code: 'HKD', name: 'Hong Kong Dollar' },
        { code: 'SGD', name: 'Singapore Dollar' },
        { code: 'AED', name: 'UAE Dirham' },
        { code: 'INR', name: 'Indian Rupee' },
        { code: 'RUB', name: 'Russian Ruble' },
        { code: 'JPY', name: 'Japanese Yen' },
        { code: 'USDT', name: 'Tether (USDT)' },
    ];

    const [rates, setRates] = useState<Record<string, string>>({});

    // Populate rates from data when loaded
    useEffect(() => {
        if (data?.rates && Array.isArray(data.rates)) {
            const newRates: Record<string, string> = {};
            data.rates.forEach((r: any) => {
                newRates[r.currency_code] = String(r.rate_to_lkr ?? '');
            });
            setRates(newRates);
        } else {
            setRates({});
        }
    }, [data]);

    const handleRateChange = (code: string, value: string) => {
        setRates(prev => ({ ...prev, [code]: value }));
    };

    const handleSave = async (code: string) => {
        const val = rates[code];
        if (!val || isNaN(parseFloat(val))) {
            if (api?.showToast) api.showToast('Please enter a valid rate', 'error');
            return;
        }

        if (api?.apiCall) {
            const res = await api.apiCall(() => updateFxRate({
                currency_code: code,
                rate_to_lkr: val,
                effective_date: date
            }, api.authOpts));

            if (res.success) {
                if (api?.showToast) api.showToast(`Saved ${code} rate: ${val}`, 'success');
            }
        }
    };

    if (loading || !data) {
        return (
            <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="text-muted-foreground">Loading...</div>
            </section>
        );
    }
    if (data?.error || data?.success === false) {
        return (
            <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    <p className="font-medium">Failed to load FX rates</p>
                    <p className="text-sm mt-1">{data?.error || 'Please try again.'}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">FX Rates</h2>
                <div className="relative">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-md text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            <p className="text-slate-600 mb-6 text-sm">Enter today's exchange rates (1 unit = ? LKR):</p>

            <div className="bg-[#f8fafc] rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-700 uppercase bg-[#f1f5f9] border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold w-32">Currency</th>
                                <th className="px-6 py-4 font-bold w-64">Name</th>
                                <th className="px-6 py-4 font-bold">Rate to LKR</th>
                                <th className="px-6 py-4 font-bold text-right w-32">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {/* In a real app we might prioritize data.currencies if strictly required, 
                                 but for matching the screenshot UI exactly we use the fixed list. */}
                            {defaultCurrencies.map((currency) => (
                                <tr key={currency.code} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">{currency.code}</td>
                                    <td className="px-6 py-4 text-slate-600">{currency.name}</td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            placeholder="Rate"
                                            value={rates[currency.code] || ''}
                                            onChange={(e) => handleRateChange(currency.code, e.target.value)}
                                            className="w-full max-w-[200px] px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-400 bg-white"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleSave(currency.code)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"
                                        >
                                            Save
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
