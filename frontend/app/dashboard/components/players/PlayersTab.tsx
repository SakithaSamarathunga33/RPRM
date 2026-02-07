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
                <div className="bg-white rounded-xl p-4 sm:p-8 w-full max-w-[95vw] sm:min-w-[440px] shadow-xl max-h-[95vh] overflow-y-auto">
                    <h3 className="text-primary mb-4 sm:mb-5 text-base sm:text-lg">{doc.player.name} ({doc.player.membership_id})</h3>
                    <p className="text-sm sm:text-base">Net Result: {doc.totals?.net != null ? fmt2(doc.totals.net) : '-'}</p>
                    <p className="text-sm sm:text-base">Hours Played: {fmt2(doc.player?.loyalty_hours_ytd)}</p>
                    <div className="flex justify-end mt-5"><button type="button" className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-md font-semibold bg-slate-200 hover:bg-slate-300 min-h-[44px] sm:min-h-0 touch-manipulation" onClick={() => setModal(null)}>Close</button></div>
                </div>
            );
        }
    };

    return (
        <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-5 gap-3">
                <h2 className="text-lg sm:text-xl text-primary">Player Management</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" placeholder="Search players..." onChange={() => onSearchChange?.()} className="w-full sm:w-[220px] px-3 py-2.5 border-2 border-slate-200 rounded-md text-base sm:text-sm min-h-[44px] sm:min-h-0 touch-manipulation" />
                    <button type="button" className="w-full sm:w-auto px-4 py-2.5 rounded-md text-sm font-semibold bg-accent text-white hover:opacity-90 min-h-[44px] touch-manipulation" onClick={showCreatePlayerModal}>+ Register Player</button>
                </div>
            </div>
            {loading || !data || !data.players || !Array.isArray(data.players) ? (
                <div className="text-muted">
                    {loading ? 'Loading...' : 'No player data available.'}
                </div>
            ) : data.players.length === 0 ? (
                <p className="text-center text-muted py-10">No players found. Click "+ Register Player" to add one.</p>
            ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full min-w-[640px] text-sm border-collapse">
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
                                    <button type="button" className="px-3 py-2 rounded-md text-xs font-semibold bg-slate-200 hover:bg-slate-300 mr-1 min-h-[44px] sm:min-h-0 touch-manipulation" onClick={() => viewPlayer(p.id)}>View</button>
                                    <button type="button" className="px-3 py-2 rounded-md text-xs font-semibold bg-slate-200 hover:bg-slate-300 min-h-[44px] sm:min-h-0 touch-manipulation" onClick={() => showEditPlayerModal(p.id)}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </section>
    );
}
