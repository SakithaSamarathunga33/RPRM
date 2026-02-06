'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

export default function PlayerForm({
    initial,
    nextId,
    onSubmit,
    onClose,
}: {
    initial?: any;
    nextId?: string;
    onSubmit: (d: any) => void;
    onClose: () => void;
}) {
    const [d, setD] = useState(initial || {
        membership_id: nextId || '',
        name: '',
        nickname: '',
        phone: '',
        nationality: '',
        id_type: '',
        id_number: '',
        notes: ''
    });

    const idTypes = ['Passport', 'National ID', 'Driving License', 'Other'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(d);
    };

    return (
        <div className="bg-white rounded-xl p-6 min-w-[500px] max-w-[600px] shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-primary mb-6 text-xl font-bold flex items-center gap-2">
                <User className="h-6 w-6 text-indigo-900" />
                {initial ? 'Edit Player' : 'Register New Player'}
            </h3>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    {/* Row 1: Membership ID & Full Name */}
                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-600 mb-1">
                            Membership ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={d.membership_id}
                            disabled={!!initial}
                            onChange={(e) => setD({ ...d, membership_id: e.target.value })}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed bg-white text-sm"
                            placeholder="M-00001"
                            required
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-600 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={d.name}
                            onChange={(e) => setD({ ...d, name: e.target.value })}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none bg-white text-sm"
                            placeholder="Player full name"
                            required
                        />
                    </div>

                    {/* Row 2: Nickname & Phone */}
                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Nickname</label>
                        <input
                            value={d.nickname || ''}
                            onChange={(e) => setD({ ...d, nickname: e.target.value })}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none bg-white text-sm"
                            placeholder="Optional"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Phone</label>
                        <input
                            value={d.phone || ''}
                            onChange={(e) => setD({ ...d, phone: e.target.value })}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none bg-white text-sm"
                            placeholder="Optional"
                        />
                    </div>

                    {/* Row 3: Nationality & ID Type */}
                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Nationality</label>
                        <input
                            value={d.nationality || ''}
                            onChange={(e) => setD({ ...d, nationality: e.target.value })}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none bg-white text-sm"
                            placeholder="Optional"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-600 mb-1">ID Type</label>
                        <select
                            value={d.id_type || ''}
                            onChange={(e) => setD({ ...d, id_type: e.target.value })}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none bg-white text-sm"
                        >
                            <option value="">-- Select --</option>
                            {idTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Row 4: ID Number */}
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-600 mb-1">ID Number</label>
                        <input
                            value={d.id_number || ''}
                            onChange={(e) => setD({ ...d, id_number: e.target.value })}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none bg-white text-sm"
                            placeholder="Optional"
                        />
                    </div>

                    {/* Row 5: Notes */}
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Notes</label>
                        <textarea
                            value={d.notes || ''}
                            onChange={(e) => setD({ ...d, notes: e.target.value })}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none bg-white text-sm h-20 resize-none"
                            placeholder="Optional"
                        />
                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-8 border-t border-slate-100 pt-5">
                    <button type="button" className="px-5 py-2.5 rounded-md font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors" onClick={onClose}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 rounded-md font-semibold bg-[#2563EB] text-white hover:bg-blue-700 transition-colors shadow-sm">
                        {initial ? 'Update Player' : 'Register Player'}
                    </button>
                </div>
            </form>
        </div>
    );
}
