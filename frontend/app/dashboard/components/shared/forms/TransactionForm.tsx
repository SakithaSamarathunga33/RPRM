'use client';

import { useState } from 'react';

export default function TransactionForm({
    title,
    currencies,
    onSubmit,
    onClose,
}: {
    title: string;
    type: string;
    currencies: any[];
    onSubmit: (d: any) => void;
    onClose: () => void;
}) {
    const [amt, setAmt] = useState('');
    const [cur, setCur] = useState('LKR');
    const [note, setNote] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!amt || isNaN(parseFloat(amt)) || parseFloat(amt) <= 0) {
            newErrors.amount = 'Enter a valid positive amount';
        }
        if (!cur) {
            newErrors.currency = 'Currency is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSubmit({ amount: amt, currency_code: cur, notes: note });
        }
    };

    return (
        <div className="bg-white rounded-xl p-8 min-w-[440px] max-w-[600px] shadow-xl">
            <h3 className="text-primary mb-5 text-lg">{title}</h3>
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                    Amount <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    value={amt}
                    onChange={(e) => {
                        setAmt(e.target.value);
                        if (errors.amount) setErrors({ ...errors, amount: '' });
                    }}
                    className={`w-full border rounded-md px-3 py-2 outline-none transition-colors ${errors.amount ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-accent'}`}
                />
                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                    Currency <span className="text-red-500">*</span>
                </label>
                <select
                    value={cur}
                    onChange={(e) => {
                        setCur(e.target.value);
                        if (errors.currency) setErrors({ ...errors, currency: '' });
                    }}
                    className={`w-full border rounded-md px-3 py-2 outline-none transition-colors ${errors.currency ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-accent'}`}
                >
                    {currencies.map((c: any) => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                </select>
                {errors.currency && <p className="text-xs text-red-500 mt-1">{errors.currency}</p>}
            </div>
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-1">Note</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full border-2 border-slate-200 rounded-md px-3 py-2 focus:border-accent outline-none" />
            </div>
            <div className="flex gap-2 justify-end mt-5">
                <button type="button" className="px-4 py-2 rounded-md font-semibold bg-slate-200 hover:bg-slate-300" onClick={onClose}>Cancel</button>
                <button type="button" className="px-4 py-2 rounded-md font-semibold bg-accent text-white hover:opacity-90" onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    );
}
