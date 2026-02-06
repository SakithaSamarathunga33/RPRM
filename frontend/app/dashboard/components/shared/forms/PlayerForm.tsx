'use client';

import { useState } from 'react';

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
    const [d, setD] = useState(initial || { membership_id: nextId || '', name: '', phone: '' });
    return (
        <div className="bg-white rounded-xl p-8 min-w-[440px] max-w-[600px] shadow-xl">
            <h3 className="text-primary mb-5 text-lg">{initial ? 'Edit' : 'New'} Player</h3>
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-1">ID</label>
                <input value={d.membership_id} disabled={!!initial} onChange={(e) => setD({ ...d, membership_id: e.target.value })} className="w-full border-2 border-slate-200 rounded-md px-3 py-2 focus:border-accent outline-none disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-1">Name</label>
                <input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} className="w-full border-2 border-slate-200 rounded-md px-3 py-2 focus:border-accent outline-none" />
            </div>
            <div className="flex gap-2 justify-end mt-5">
                <button type="button" className="px-4 py-2 rounded-md font-semibold bg-slate-200 hover:bg-slate-300" onClick={onClose}>Cancel</button>
                <button type="button" className="px-4 py-2 rounded-md font-semibold bg-accent text-white hover:opacity-90" onClick={() => onSubmit(d)}>Save</button>
            </div>
        </div>
    );
}
