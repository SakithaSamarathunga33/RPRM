'use client';

import React, { useState, useEffect } from 'react';
import { Banknote, X, UserMinus } from 'lucide-react';
import { createExpense, getPlayers } from '@/lib/api';

interface RecordExpenseModalProps {
    date: string;
    onClose: () => void;
    onSuccess: () => void;
    api?: any;
}

type Player = { id: number; membership_id: string; name: string; [k: string]: unknown };

export default function RecordExpenseModal({ date, onClose, onSuccess, api }: RecordExpenseModalProps) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food & Beverage');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [players, setPlayers] = useState<Player[]>([]);
    const [playerSearch, setPlayerSearch] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [playersLoading, setPlayersLoading] = useState(true);

    useEffect(() => {
        if (!api?.apiCall) return;
        api.apiCall(() => getPlayers('active', api.authOpts)).then((res: any) => {
            if (res?.success && Array.isArray(res.players)) setPlayers(res.players);
        }).finally(() => setPlayersLoading(false));
    }, [api?.apiCall]);

    const filteredPlayers = playerSearch.trim()
        ? players.filter(p =>
            (p.name || '').toLowerCase().includes(playerSearch.toLowerCase()) ||
            (p.membership_id || '').toLowerCase().includes(playerSearch.toLowerCase())
        )
        : players;

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
                date,
                ...(selectedPlayer?.id && { player_id: selectedPlayer.id })
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
        <div className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] sm:w-[42rem] overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-slate-100">
                <h3 className="font-bold text-base sm:text-lg text-slate-800 flex items-center gap-2">
                    <span className="p-1 rounded bg-green-100 text-green-600"><Banknote className="w-5 h-5" /></span>
                    Record Expense
                </h3>
                <button type="button" onClick={onClose} className="p-2 -m-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Amount (LKR) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2.5 sm:py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-base sm:text-sm min-h-[44px] touch-manipulation"
                        placeholder="0.00"
                        required
                        min="0"
                        step="0.01"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Player (optional)
                    </label>
                    {selectedPlayer ? (
                        <div className="flex items-center gap-2 p-2.5 rounded-md bg-slate-100 border border-slate-200 min-h-[44px]">
                            <span className="text-sm font-medium text-slate-800 truncate flex-1">
                                {selectedPlayer.membership_id} — {selectedPlayer.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelectedPlayer(null)}
                                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                                title="Clear player"
                            >
                                <UserMinus className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <input
                                type="text"
                                value={playerSearch}
                                onChange={(e) => setPlayerSearch(e.target.value)}
                                placeholder="Search by name or membership ID..."
                                className="w-full px-3 py-2.5 sm:py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-base sm:text-sm mb-2 min-h-[44px] touch-manipulation"
                            />
                            {/* Height scales with viewport: ~2 rows at 125% zoom, ~5 at 100%, more on large screens */}
                            <div className="border border-slate-300 rounded-md overflow-y-auto bg-white overscroll-contain max-h-[clamp(5.5rem,28vh,20rem)] min-h-[5rem]">
                                {playersLoading ? (
                                    <div className="p-3 text-sm text-slate-500 text-center min-h-[5rem] flex items-center justify-center">Loading players...</div>
                                ) : filteredPlayers.length === 0 ? (
                                    <div className="p-3 text-sm text-slate-500 text-center min-h-[5rem] flex items-center justify-center">No players found</div>
                                ) : (
                                    <ul className="divide-y divide-slate-100">
                                        {filteredPlayers.map((p) => (
                                            <li key={p.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPlayer(p);
                                                        setPlayerSearch('');
                                                    }}
                                                    className="w-full text-left px-3 py-3 sm:py-2.5 text-sm hover:bg-slate-50 focus:bg-slate-50 focus:outline-none min-h-[44px] touch-manipulation flex items-center"
                                                >
                                                    <span className="font-medium text-slate-800">{p.membership_id}</span>
                                                    <span className="text-slate-600 ml-2 truncate">{p.name}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Category
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2.5 sm:py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-base sm:text-sm bg-white min-h-[44px] touch-manipulation"
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
                        className="w-full px-3 py-2.5 sm:py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-base sm:text-sm min-h-[44px] touch-manipulation"
                        placeholder="Description"
                    />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-3 sm:py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md text-sm font-medium transition-colors min-h-[44px] touch-manipulation"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-4 py-3 sm:py-2 text-white bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
                    >
                        {isSubmitting ? 'Recording...' : 'Record Expense'}
                    </button>
                </div>
            </form>
        </div>
    );
}
