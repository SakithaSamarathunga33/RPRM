'use client';

import { useState, useMemo } from 'react';

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
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | number>('');
    const [sn, setSn] = useState('');
    const [seatInTime, setSeatInTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    const [errors, setErrors] = useState<Record<string, string>>({});

    const filteredPlayers = useMemo(() => {
        if (!search) return players;
        const s = search.toLowerCase();
        return players.filter(p =>
            p.name.toLowerCase().includes(s) ||
            p.membership_id.toString().toLowerCase().includes(s) ||
            (p.nickname && p.nickname.toLowerCase().includes(s))
        );
    }, [players, search]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!selectedId) newErrors.player_id = 'Please select a player';

        // Seat Number: 1-10
        if (!sn.trim()) {
            newErrors.seat_number = 'Seat number is required';
        } else if (!/^\d+$/.test(sn) || parseInt(sn) < 1 || parseInt(sn) > 10) {
            newErrors.seat_number = 'Seat must be a number between 1-10';
        }

        if (!seatInTime) newErrors.seat_in_time = 'Seat-in time is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({
                player_id: selectedId,
                seat_number: sn,
                seat_in_time: seatInTime
            });
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 min-w-[500px] max-w-[600px] shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-primary mb-6 text-xl font-bold">Seat Player at {tableName}</h3>

            <form onSubmit={handleSubmit}>
                {/* Player Search & Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                        Select Player <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Type to search..."
                        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-2 focus:ring-2 focus:ring-primary/50 outline-none text-sm"
                    />
                    <div className={`h-40 overflow-y-auto border rounded-md bg-white ${errors.player_id ? 'border-red-500' : 'border-slate-200'}`}>
                        {filteredPlayers.length === 0 ? (
                            <p className="p-3 text-sm text-muted text-center">No players found.</p>
                        ) : (
                            filteredPlayers.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => {
                                        setSelectedId(p.id);
                                        if (errors.player_id) setErrors({ ...errors, player_id: '' });
                                    }}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-0 ${selectedId === p.id ? 'bg-indigo-50 text-primary font-medium' : 'text-slate-700'}`}
                                >
                                    {p.membership_id} — {p.name} {p.nickname ? `(${p.nickname})` : ''}
                                </div>
                            ))
                        )}
                    </div>
                    {errors.player_id && <p className="text-xs text-red-500 mt-1">{errors.player_id}</p>}
                </div>

                {/* Seat Number & Time */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Seat Number</label>
                        <input
                            type="text"
                            value={sn}
                            onChange={(e) => {
                                setSn(e.target.value);
                                if (errors.seat_number) setErrors({ ...errors, seat_number: '' });
                            }}
                            placeholder="1-10"
                            className={`w-full border rounded-md px-3 py-2 outline-none text-sm transition-colors ${errors.seat_number ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-primary/50'}`}
                        />
                        {errors.seat_number && <p className="text-xs text-red-500 mt-1">{errors.seat_number}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Seat-in Time</label>
                        <input
                            type="time"
                            value={seatInTime}
                            onChange={(e) => {
                                setSeatInTime(e.target.value);
                                if (errors.seat_in_time) setErrors({ ...errors, seat_in_time: '' });
                            }}
                            className={`w-full border rounded-md px-3 py-2 outline-none text-sm transition-colors ${errors.seat_in_time ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-primary/50'}`}
                        />
                        {errors.seat_in_time && <p className="text-xs text-red-500 mt-1">{errors.seat_in_time}</p>}
                    </div>
                </div>

                {/* Helper Link */}
                <div className="mb-8">
                    <span className="text-sm text-slate-500">Player not registered? </span>
                    <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Register new player first</a>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end border-t border-slate-100 pt-5">
                    <button type="button" className="px-5 py-2.5 rounded-md font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200" onClick={onClose}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 rounded-md font-semibold bg-[#2563EB] text-white hover:bg-blue-700 shadow-sm">Seat In</button>
                </div>
            </form>
        </div>
    );
}
