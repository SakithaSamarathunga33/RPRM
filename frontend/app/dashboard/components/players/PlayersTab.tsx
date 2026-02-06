'use client';

import { fmt, fmt2, tierClass } from '../shared/utils';
import { PlayerForm } from '../shared/forms';
import { getPlayerReport, getNextPlayerId, createPlayer, updatePlayer, getPlayer } from '@/lib/api';

interface PlayersTabProps {
    data: any;
    loading: boolean;
    onSearchChange?: () => void;
    api: {
        showToast?: (msg: string, type?: string) => void;
        setModal: (node: React.ReactNode | null) => void;
        loadSection: (sec: string) => Promise<void>;
        authOpts: { onUnauthorized: () => void };
    };
}

export default function PlayersTab({ data, loading, onSearchChange, api }: PlayersTabProps) {
    const { setModal, loadSection, authOpts } = api;

    const showCreatePlayerModal = async () => {
        const nd = await getNextPlayerId(authOpts);
        setModal(<PlayerForm nextId={(nd as any).next_id} onSubmit={async (d: any) => {
            const res = await createPlayer(d, authOpts);
            if (res.success) { api.showToast?.('Player Created', 'success'); setModal(null); loadSection('players'); } else api.showToast?.((res as any).error, 'error');
        }} onClose={() => setModal(null)} />);
    };

    const showEditPlayerModal = async (pid: number) => {
        const d = await getPlayer(pid, authOpts);
        if (d.success && d.player) {
            setModal(<PlayerForm initial={d.player} onSubmit={async (upd: any) => {
                const res = await updatePlayer(pid, upd, authOpts);
                if (res.success) {
                    api.showToast?.('Player Updated', 'success');
                    setModal(null);
                    loadSection('players');
                } else {
                    api.showToast?.((res as any).error || 'Update failed', 'error');
                }
            }} onClose={() => setModal(null)} />);
        } else {
            api.showToast?.('Failed to load player data', 'error');
        }
    };

    const viewPlayer = async (pid: number) => {
        const d = await getPlayerReport(pid, authOpts);
        if ((d as any).success) {
            const doc = d as any;
            setModal(
                <div className="bg-white rounded-xl p-8 min-w-[440px] shadow-xl">
                    <h3 className="text-primary mb-5 text-lg">{doc.player.name} ({doc.player.membership_id})</h3>
                    <p>Net Result: {doc.totals?.net != null ? fmt2(doc.totals.net) : '-'}</p>
                    <p>Hours Played: {fmt2(doc.player?.loyalty_hours_ytd)}</p>
                    <div className="flex justify-end mt-5"><button type="button" className="px-4 py-2 rounded-md font-semibold bg-slate-200 hover:bg-slate-300" onClick={() => setModal(null)}>Close</button></div>
                </div>
            );
        }
    };

    return (
        <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
                <h2 className="text-xl text-primary">Player Management</h2>
                <div className="flex gap-2 items-center">
                    <input type="text" placeholder="Search players..." onChange={() => onSearchChange?.()} className="px-3 py-2 border-2 border-slate-200 rounded-md text-sm w-[220px]" />
                    <button type="button" className="px-4 py-2 rounded-md text-sm font-semibold bg-accent text-white hover:opacity-90" onClick={showCreatePlayerModal}>+ Register Player</button>
                </div>
            </div>
            {loading || !data || !data.players || !Array.isArray(data.players) ? (
                <div className="text-muted">
                    {loading ? 'Loading...' : 'No player data available.'}
                </div>
            ) : data.players.length === 0 ? (
                <p className="text-center text-muted py-10">No players found. Click "+ Register Player" to add one.</p>
            ) : (
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold text-primary">Membership ID</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Name</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Nickname</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Phone</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Tier</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Hours (YTD)</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Points</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.players.map((p: any) => (
                            <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="px-3 py-2.5 font-semibold">{p.membership_id}</td>
                                <td className="px-3 py-2.5">{p.name}</td>
                                <td className="px-3 py-2.5">{p.nickname || '-'}</td>
                                <td className="px-3 py-2.5">{p.phone || '-'}</td>
                                <td className={`px-3 py-2.5 ${tierClass(p.loyalty_tier)}`}>{p.loyalty_tier_name}</td>
                                <td className="px-3 py-2.5">{fmt2(p.loyalty_hours_ytd)}</td>
                                <td className="px-3 py-2.5">{fmt(p.loyalty_points)}</td>
                                <td className="px-3 py-2.5">
                                    <button type="button" className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-200 hover:bg-slate-300 mr-1" onClick={() => viewPlayer(p.id)}>View</button>
                                    <button type="button" className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-200 hover:bg-slate-300" onClick={() => showEditPlayerModal(p.id)}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}
