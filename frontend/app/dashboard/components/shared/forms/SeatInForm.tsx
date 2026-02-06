'use client';

import { useState } from 'react';

export default function SeatInForm({
    players,
    tableName,
    onSubmit,
    onClose,
}: {
    players: any[];
    tableName: string;
    onSubmit: (d: any) => void;
    onClose: () => void;
}) {
    const [pid, setPid] = useState('');
    const [sn, setSn] = useState('');
    return (
        <div className="bg-white rounded-xl p-8 min-w-[440px] max-w-[600px] shadow-xl">
            <h3 className="text-primary mb-5 text-lg">Seat at {tableName}</h3>
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-1">Player</label>
                <select value={pid} onChange={(e) => setPid(e.target.value)} className="w-full border-2 border-slate-200 rounded-md px-3 py-2 focus:border-accent outline-none">
                    <option value="">Select</option>
                    {players.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-1">Seat #</label>
                <input type="number" value={sn} onChange={(e) => setSn(e.target.value)} className="w-full border-2 border-slate-200 rounded-md px-3 py-2 focus:border-accent outline-none" />
            </div>
            <div className="flex gap-2 justify-end mt-5">
                <button type="button" className="px-4 py-2 rounded-md font-semibold bg-slate-200 hover:bg-slate-300" onClick={onClose}>Cancel</button>
                <button type="button" className="px-4 py-2 rounded-md font-semibold bg-accent text-white hover:opacity-90" onClick={() => onSubmit({ player_id: pid, seat_number: sn })}>Seat</button>
            </div>
        </div>
    );
}
