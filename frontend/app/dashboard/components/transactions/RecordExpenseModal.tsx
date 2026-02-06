'use client';

import React, { useState } from 'react';
import { Banknote, X } from 'lucide-react';
import { createExpense } from '@/lib/api';

interface RecordExpenseModalProps {
    date: string;
    onClose: () => void;
    onSuccess: () => void;
    api?: any;
}

export default function RecordExpenseModal({ date, onClose, onSuccess, api }: RecordExpenseModalProps) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food & Beverage');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        'Food & Beverage',
        'Staff',
        'Supplies',
        'Transport',
        'Flight',
        'Hotel',
        'Flight & Hotel',
        'Rakeback',
        'Tips',
        'General',
        'Other'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || isNaN(parseFloat(amount))) {
            if (api?.showToast) api.showToast('Please enter a valid amount', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.apiCall(() => createExpense({
                amount: parseFloat(amount),
                category,
                notes,
                date
            }, api.authOpts));

            if (res.success) {
                if (api?.showToast) api.showToast('Expense recorded successfully', 'success');
                onSuccess();
                onClose();
            } else {
                if (api?.showToast) api.showToast(res.error || 'Failed to record expense', 'error');
            }
        } catch (error) {
            console.error(error);
            if (api?.showToast) api.showToast('An error occurred', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <span className="p-1 rounded bg-green-100 text-green-600"><Banknote className="w-5 h-5" /></span>
                    Record Expense
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Amount (LKR) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        placeholder="0.00"
                        required
                        min="0"
                        step="0.01"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Category
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Notes
                    </label>
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        placeholder="Description"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Recording...' : 'Record Expense'}
                    </button>
                </div>
            </form>
        </div>
    );
}
