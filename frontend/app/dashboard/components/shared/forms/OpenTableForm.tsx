'use client';

import { useState } from 'react';

export default function OpenTableForm({ onClose, onOpen }: { onClose: () => void; onOpen: (d: any) => void }) {
    const [d, setD] = useState({ table_name: '', game_type: 'NLH', small_blind: 100, big_blind: 200 });
    return (
        <div className="bg-white rounded-xl p-8 min-w-[440px] max-w-[600px] max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-primary mb-5 text-lg">Open Table</h3>
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-1">Name</label>
                <input value={d.table_name} onChange={(e) => setD({ ...d, table_name: e.target.value })} className="w-full border-2 border-slate-200 rounded-md px-3 py-2 focus:border-accent outline-none" />
            </div>
            <div className="flex gap-2 justify-end mt-5">
                <button type="button" className="px-4 py-2 rounded-md font-semibold bg-slate-200 hover:bg-slate-300" onClick={onClose}>Cancel</button>
                <button type="button" className="px-4 py-2 rounded-md font-semibold bg-accent text-white hover:opacity-90" onClick={() => onOpen(d)}>Open</button>
            </div>
        </div>
    );
}
