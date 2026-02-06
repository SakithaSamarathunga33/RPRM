'use client';

import { useState } from 'react';
import { Dice5, Clock } from 'lucide-react';

export default function OpenTableForm({ onClose, onOpen }: { onClose: () => void; onOpen: (d: any) => void }) {
    const [d, setD] = useState({
        table_name: '',
        game_type: 'NLH',
        small_blind: 100,
        big_blind: 200,
        start_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        notes: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!d.table_name.trim()) newErrors.table_name = 'Table Name is required';
        if (d.small_blind <= 0 || isNaN(d.small_blind)) newErrors.small_blind = 'Enter valid positive number';
        if (d.big_blind <= 0 || isNaN(d.big_blind)) newErrors.big_blind = 'Enter valid positive number';
        if (d.big_blind < d.small_blind) newErrors.big_blind = 'Big Blind must be >= Small Blind';
        if (!d.start_time) newErrors.start_time = 'Start Time is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onOpen(d);
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 min-w-[500px] max-w-[600px] shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="text-2xl">🎰</span>
                <h3 className="text-xl font-bold">Open New Table</h3>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Table Name */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                        Table Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={d.table_name}
                        onChange={(e) => {
                            setD({ ...d, table_name: e.target.value });
                            if (errors.table_name) setErrors({ ...errors, table_name: '' });
                        }}
                        className={`w-full border rounded-md px-3 py-2 outline-none text-sm transition-colors ${errors.table_name ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-primary/50'}`}
                        placeholder="e.g. Table 1, VIP Table"
                    />
                    {errors.table_name && <p className="text-xs text-red-500 mt-1">{errors.table_name}</p>}
                </div>

                {/* Game Type */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                        Game Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={d.game_type}
                        onChange={(e) => setD({ ...d, game_type: e.target.value })}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none text-sm bg-white"
                    >
                        <option value="NLH">No Limit Hold'em (NLH)</option>
                        <option value="PLO">Pot Limit Omaha (PLO)</option>
                    </select>
                </div>

                {/* Blinds */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">
                            Small Blind <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={d.small_blind}
                            onChange={(e) => {
                                setD({ ...d, small_blind: parseFloat(e.target.value) });
                                if (errors.small_blind) setErrors({ ...errors, small_blind: '' });
                            }}
                            className={`w-full border rounded-md px-3 py-2 outline-none text-sm transition-colors ${errors.small_blind ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-primary/50'}`}
                        />
                        {errors.small_blind && <p className="text-xs text-red-500 mt-1">{errors.small_blind}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">
                            Big Blind <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={d.big_blind}
                            onChange={(e) => {
                                setD({ ...d, big_blind: parseFloat(e.target.value) });
                                if (errors.big_blind) setErrors({ ...errors, big_blind: '' });
                            }}
                            className={`w-full border rounded-md px-3 py-2 outline-none text-sm transition-colors ${errors.big_blind ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-primary/50'}`}
                        />
                        {errors.big_blind && <p className="text-xs text-red-500 mt-1">{errors.big_blind}</p>}
                    </div>
                </div>

                {/* Start Time */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Start Time</label>
                    <input
                        type="time"
                        value={d.start_time}
                        onChange={(e) => {
                            setD({ ...d, start_time: e.target.value });
                            if (errors.start_time) setErrors({ ...errors, start_time: '' });
                        }}
                        className={`w-full border rounded-md px-3 py-2 outline-none text-sm transition-colors ${errors.start_time ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-primary/50'}`}
                    />
                    {errors.start_time && <p className="text-xs text-red-500 mt-1">{errors.start_time}</p>}
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Notes</label>
                    <textarea
                        value={d.notes}
                        onChange={(e) => setD({ ...d, notes: e.target.value })}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none text-sm h-20 resize-none"
                        placeholder="Optional"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-2">
                    <button type="button" className="px-5 py-2.5 rounded-md font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200" onClick={onClose}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 rounded-md font-semibold bg-[#2563EB] text-white hover:bg-blue-700 shadow-sm">Open Table</button>
                </div>
            </form>
        </div>
    );
}
