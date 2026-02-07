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

    const inputCls = 'w-full border rounded-md px-3 py-2.5 sm:py-2 outline-none text-base sm:text-sm transition-colors min-h-[44px] sm:min-h-0 touch-manipulation';
    return (
        <div className="bg-white rounded-xl p-4 sm:p-8 w-full max-w-[95vw] sm:min-w-[440px] sm:max-w-[600px] shadow-xl max-h-[95vh] overflow-y-auto">
            <h3 className="text-primary mb-4 sm:mb-5 text-base sm:text-lg">{title}</h3>
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-1">Amount <span className="text-red-500">*</span></label>
                <input
                    type="number"
                    value={amt}
                    onChange={(e) => { setAmt(e.target.value); if (errors.amount) setErrors({ ...errors, amount: '' }); }}
                    className={`${inputCls} ${errors.amount ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-accent'}`}
                />
                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-1">Currency <span className="text-red-500">*</span></label>
                <select
                    value={cur}
                    onChange={(e) => { setCur(e.target.value); if (errors.currency) setErrors({ ...errors, currency: '' }); }}
                    className={`${inputCls} ${errors.currency ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-accent'}`}
                >
                    {currencies.map((c: any) => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
                {errors.currency && <p className="text-xs text-red-500 mt-1">{errors.currency}</p>}
            </div>
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-1">Note</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} className={`${inputCls} border-2 border-slate-200 focus:border-accent`} />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end mt-5">
                <button type="button" className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-md font-semibold bg-slate-200 hover:bg-slate-300 min-h-[44px] sm:min-h-0 touch-manipulation" onClick={onClose}>Cancel</button>
                <button type="button" className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-md font-semibold bg-accent text-white hover:opacity-90 min-h-[44px] sm:min-h-0 touch-manipulation" onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    );
}
