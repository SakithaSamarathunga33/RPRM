'use client';

interface SettingsTabProps {
    data: any;
    loading: boolean;
}

export default function SettingsTab({ data, loading }: SettingsTabProps) {
    const settings = data ?? {};
    return (
        <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="mb-5">
                <h2 className="text-xl text-primary">Settings</h2>
            </div>
            {loading ? (
                <div className="text-muted">Loading...</div>
            ) : (
                <div className="bg-slate-50 p-6 rounded-lg max-w-[560px]">
                    <h3 className="text-primary mb-3">⚙️ Poker Room Settings</h3>
                    <table className="w-full text-sm border-collapse">
                        <tbody>
                            <tr className="border-b border-slate-100"><td className="px-3 py-2.5">Casino Name</td><td className="px-3 py-2.5">{settings.casino_name ?? '-'}</td></tr>
                            <tr className="border-b border-slate-100"><td className="px-3 py-2.5">Poker Room Name</td><td className="px-3 py-2.5">{settings.poker_room_name ?? '-'}</td></tr>
                            <tr className="border-b border-slate-100"><td className="px-3 py-2.5">Operator Company</td><td className="px-3 py-2.5">{settings.operator_company ?? '-'}</td></tr>
                            <tr className="border-b border-slate-100"><td className="px-3 py-2.5">Base Currency</td><td className="px-3 py-2.5">{settings.base_currency ?? 'LKR'}</td></tr>
                            <tr className="border-b border-slate-100"><td className="px-3 py-2.5">Casino Share %</td><td className="px-3 py-2.5">{settings.casino_share_percent ?? 50}</td></tr>
                            <tr className="border-b border-slate-100"><td className="px-3 py-2.5">Session Timeout (min)</td><td className="px-3 py-2.5">{settings.session_timeout_minutes ?? 30}</td></tr>
                        </tbody>
                    </table>
                    <p className="mt-3 text-muted text-sm">Edit settings via API or admin panel (coming soon).</p>
                </div>
            )}
        </section>
    );
}
