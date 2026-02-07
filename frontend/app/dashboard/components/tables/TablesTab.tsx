'use client';

import { fmt } from '../shared/utils';
import { OpenTableForm, SeatInForm, TransactionForm } from '../shared/forms';
import { getTablePlayers, getTables, getPlayers, openTable, seatIn, seatOut, closeTable, buyin, cashout } from '@/lib/api';

interface TablesTabProps {
    data: any;
    loading: boolean;
    date: string;
    onDateChange: (date: string) => void;
    api: {
        showToast: (msg: string, type?: string) => void;
        setModal: (node: React.ReactNode | null) => void;
        loadSection: (sec: string) => Promise<void>;
        authOpts: { onUnauthorized: () => void };
        apiCall: <T>(fn: () => Promise<T>, fallbackUrl?: string) => Promise<T>;
    };
    allCurrencies: any[];
}

export default function TablesTab({ data, loading, date, onDateChange, api, allCurrencies }: TablesTabProps) {
    const { showToast, setModal, loadSection, authOpts, apiCall } = api;

    const manageTable = async (tid: number) => {
        const d = await apiCall(() => getTablePlayers(tid, authOpts), `/api/tables/${tid}/players`);
        const tbls = await apiCall(() => getTables(date, authOpts), `/api/tables?date=`);
        const tbl = (tbls as any).tables?.find((t: any) => t.id === tid);
        if (!(d as any).success || !tbl) return;
        setModal(
            <div className="bg-white rounded-xl p-8 min-w-[440px] max-w-[600px] max-h-[90vh] overflow-y-auto shadow-xl">
                <h3 className="text-primary mb-5 text-lg">📋 {tbl.table_name} — {tbl.game_type}</h3>
                <p className="mb-4 text-slate-500">Status: {tbl.status} | {tbl.start_time}</p>
                {(d as any).players?.length === 0 ? (
                    <p className="text-center p-4 text-muted">No players seated.</p>
                ) : (
                    <table className="w-full text-sm border-collapse">
                        <thead><tr className="border-b-2 border-slate-200"><th className="bg-slate-50 px-3 py-2.5 text-left font-semibold text-primary">Seat</th><th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">ID</th><th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Player</th><th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">In</th><th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Net</th><th className="bg-slate-50 px-3 py-2.5 text-center font-semibold">Actions</th></tr></thead>
                        <tbody>
                            {((d as any).players || []).map((p: any) => (
                                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="px-3 py-2.5">{p.seat_number || '-'}</td>
                                    <td className="px-3 py-2.5">{p.membership_id}</td>
                                    <td className="px-3 py-2.5">{p.name}</td>
                                    <td className="px-3 py-2.5">{p.seat_in_time}</td>
                                    <td className={`px-3 py-2.5 font-semibold ${(p.total_cashout_lkr - p.total_buyin_lkr) >= 0 ? 'text-success' : 'text-danger'}`}>{fmt(p.total_cashout_lkr - p.total_buyin_lkr)}</td>
                                    <td className="px-3 py-2.5 text-center">
                                        {p.status === 'active' && (
                                            <div className="flex gap-1 justify-center">
                                                <button type="button" className="px-3 py-1.5 rounded-md text-xs font-semibold bg-accent text-white hover:opacity-90" onClick={() => { setModal(null); showBuyinModal(p.id, p); }}>Buy In</button>
                                                <button type="button" className="px-3 py-1.5 rounded-md text-xs font-semibold bg-success text-white hover:opacity-90" onClick={() => { setModal(null); showCashoutModal(p.id, p); }}>Cash Out</button>
                                                <button type="button" className="px-3 py-1.5 rounded-md text-xs font-semibold bg-danger text-white hover:opacity-90" onClick={() => { setModal(null); showSeatOutModal(p.id, p); }}>Seat Out</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="flex gap-2 justify-end mt-5"><button type="button" className="px-4 py-2 rounded-md text-sm font-semibold bg-slate-200 hover:bg-slate-300" onClick={() => setModal(null)}>Close</button></div>
            </div>
        );
    };

    const showBuyinModal = (psid: number, p: any) => {
        setModal(<TransactionForm title={`Buy-in: ${p.membership_id}`} type="buyin" currencies={allCurrencies} onSubmit={async (d: any) => {
            const res = await buyin({ ...d, player_session_id: psid }, authOpts);
            if (res.success) { showToast('Buyin Recorded', 'success'); setModal(null); } else showToast((res as any).error, 'error');
        }} onClose={() => setModal(null)} />);
    };

    const showCashoutModal = (psid: number, p: any) => {
        setModal(<TransactionForm title={`Cash-out: ${p.membership_id}`} type="cashout" currencies={allCurrencies} onSubmit={async (d: any) => {
            const res = await cashout({ ...d, player_session_id: psid }, authOpts);
            if (res.success) { showToast('Cashout Recorded', 'success'); setModal(null); } else showToast((res as any).error, 'error');
        }} onClose={() => setModal(null)} />);
    };

    const showSeatOutModal = (psid: number, p: any) => {
        setModal(
            <div className="bg-white rounded-xl p-8 min-w-[440px] shadow-xl">
                <h3 className="text-primary mb-5 text-lg">Seat Out: {p.name}</h3>
                <div className="mb-4"><label className="block text-sm font-semibold text-slate-600 mb-1">Time</label><input type="time" id="mSeatOut" defaultValue={new Date().toTimeString().slice(0, 5)} className="w-full border-2 border-slate-200 rounded-md px-3 py-2 focus:border-accent outline-none" /></div>
                <div className="flex gap-2 justify-end">
                    <button type="button" className="px-4 py-2 rounded-md font-semibold bg-slate-200 hover:bg-slate-300" onClick={() => setModal(null)}>Cancel</button>
                    <button type="button" className="px-4 py-2 rounded-md font-semibold bg-danger text-white hover:opacity-90" onClick={async () => {
                        const t = (document.getElementById('mSeatOut') as HTMLInputElement).value;
                        const res = await seatOut(psid, { seat_out_time: t }, authOpts);
                        if (res.success) { showToast('Seated Out', 'success'); setModal(null); } else showToast((res as any).error, 'error');
                    }}>Confirm</button>
                </div>
            </div>
        );
    };

    const showSeatInModal = async (tid: number, tname: string) => {
        const pd = await getPlayers('active', authOpts);
        if (!(pd as any).success) return;
        setModal(<SeatInForm players={(pd as any).players} tableName={tname} onSubmit={async (d: any) => {
            const res = await seatIn(tid, d, authOpts);
            if (res.success) { showToast('Player Seated', 'success'); setModal(null); loadSection('tables'); } else showToast((res as any).error, 'error');
        }} onClose={() => setModal(null)} />);
    };

    const showCloseTableModal = (tid: number, tname: string) => {
        setModal(
            <div className="bg-white rounded-xl p-8 min-w-[440px] shadow-xl">
                <h3 className="text-primary mb-5 text-lg">Close Table: {tname}</h3>
                <div className="mb-4"><label className="block text-sm font-semibold text-slate-600 mb-1">Rake Collected</label><input type="number" id="mRake" defaultValue={0} step="100" className="w-full border-2 border-slate-200 rounded-md px-3 py-2 focus:border-accent outline-none" /></div>
                <div className="mb-4"><label className="block text-sm font-semibold text-slate-600 mb-1">End Time</label><input type="time" id="mEndTime" defaultValue={new Date().toTimeString().slice(0, 5)} className="w-full border-2 border-slate-200 rounded-md px-3 py-2 focus:border-accent outline-none" /></div>
                <div className="flex gap-2 justify-end">
                    <button type="button" className="px-4 py-2 rounded-md font-semibold bg-slate-200 hover:bg-slate-300" onClick={() => setModal(null)}>Cancel</button>
                    <button type="button" className="px-4 py-2 rounded-md font-semibold bg-danger text-white hover:opacity-90" onClick={async () => {
                        const rake = parseFloat((document.getElementById('mRake') as HTMLInputElement).value);
                        const t = (document.getElementById('mEndTime') as HTMLInputElement).value;
                        const res = await closeTable(tid, { rake_collected_lkr: rake, end_time: t }, authOpts);
                        if (res.success) { showToast('Table Closed', 'success'); setModal(null); loadSection('tables'); } else showToast((res as any).error, 'error');
                    }}>Confirm Close</button>
                </div>
            </div>
        );
    };

    return (
        <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
                <h2 className="text-xl text-primary">Table Management</h2>
                <div className="flex gap-2 items-center">
                    <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className="px-3 py-2 border-2 border-slate-200 rounded-md text-sm" />
                    <button
                        type="button"
                        className="px-4 py-2 rounded-md text-sm font-semibold bg-accent text-white hover:opacity-90"
                        onClick={() => {
                            setModal(<OpenTableForm onClose={() => setModal(null)} onOpen={async (d: any) => {
                                const res = await openTable({ session_date: date, ...d }, authOpts);
                                if (res.success) { showToast('Table opened!', 'success'); setModal(null); loadSection('tables'); }
                                else showToast((res as any).error, 'error');
                            }} />);
                        }}
                    >
                        + Open New Table
                    </button>
                </div>
            </div>
            {loading || !data ? (
                <div className="text-muted">Loading...</div>
            ) : data?.error || data?.success === false ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    <p className="font-medium">Failed to load tables</p>
                    <p className="text-sm mt-1">{data?.error || 'Please try again.'}</p>
                </div>
            ) : !data.tables || !Array.isArray(data.tables) ? (
                <div className="text-muted">Loading...</div>
            ) : data.tables.length === 0 ? (
                <p className="text-center text-black py-10">No tables for this date. Click "+ Open New Table" to start.</p>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
                    {data.tables.map((t: any) => {
                        const game = t.game_type + (t.plo_variant ? ` ${t.plo_variant}-Card` : '');
                        return (
                            <div key={t.id} className={`border-2 rounded-lg p-5 transition hover:shadow-md ${t.status === 'open' ? 'border-l-4 border-l-success border-slate-200' : 'border-slate-200'}`}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-lg font-bold text-primary">{t.table_name}</span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${t.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>{t.status.toUpperCase()}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 text-sm text-slate-900 mb-3">
                                    <span>Game: <strong className="text-slate-800">{game}</strong></span>
                                    <span>Stakes: <strong className="text-slate-800">{t.small_blind}/{t.big_blind}</strong></span>
                                    <span>Started: <strong className="text-slate-800">{t.start_time}</strong></span>
                                    <span>Players: <strong className="text-slate-800">{t.active_players} active / {t.total_players} total</strong></span>
                                    {t.status === 'closed' && (
                                        <>
                                            <span>Rake: <strong className="text-slate-800">{fmt(t.rake_collected_lkr)}</strong></span>
                                            <span>Ended: <strong className="text-slate-800">{t.end_time || '-'}</strong></span>
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-1.5 flex-wrap">
                                    {t.status === 'open' ? (
                                        <>
                                            <button type="button" className="px-3 py-1.5 rounded-md text-xs font-semibold bg-accent text-white hover:opacity-90" onClick={() => manageTable(t.id)}>📋 Manage</button>
                                            <button type="button" className="px-3 py-1.5 rounded-md text-xs font-semibold bg-success text-white hover:opacity-90" onClick={() => showSeatInModal(t.id, t.table_name)}>+ Seat Player</button>
                                            <button type="button" className="px-3 py-1.5 rounded-md text-xs font-semibold bg-danger text-white hover:opacity-90" onClick={() => showCloseTableModal(t.id, t.table_name)}>Close Table</button>
                                        </>
                                    ) : (
                                        <button type="button" className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-200 hover:bg-slate-300" onClick={() => manageTable(t.id)}>📋 View Details</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
