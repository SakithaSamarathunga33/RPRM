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
    return (
        <div className="bg-white rounded-xl p-8 min-w-[440px] max-w-[600px] shadow-xl">
            <h3 className="text-primary mb-5 text-lg">{title}</h3>
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-1">Amount</label>
                <input type="number" value={amt} onChange={(e) => setAmt(e.target.value)} className="w-full border-2 border-slate-200 rounded-md px-3 py-2 focus:border-accent outline-none" />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-1">Currency</label>
                <select value={cur} onChange={(e) => setCur(e.target.value)} className="w-full border-2 border-slate-200 rounded-md px-3 py-2 focus:border-accent outline-none">
                    {currencies.map((c: any) => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-1">Note</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full border-2 border-slate-200 rounded-md px-3 py-2 focus:border-accent outline-none" />
            </div>
            <div className="flex gap-2 justify-end mt-5">
                <button type="button" className="px-4 py-2 rounded-md font-semibold bg-slate-200 hover:bg-slate-300" onClick={onClose}>Cancel</button>
                <button type="button" className="px-4 py-2 rounded-md font-semibold bg-accent text-white hover:opacity-90" onClick={() => onSubmit({ amount: amt, currency_code: cur, notes: note })}>Submit</button>
            </div>
        </div>
    );
}
