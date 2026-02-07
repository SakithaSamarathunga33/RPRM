'use client';

interface AuditTabProps {
    data: any;
    loading: boolean;
}

export default function AuditTab({ data, loading }: AuditTabProps) {
    const entries = Array.isArray(data) ? data : [];
    return (
        <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm overflow-hidden">
            <div className="mb-4 sm:mb-5">
                <h2 className="text-lg sm:text-xl text-primary">Audit Log</h2>
            </div>
            {loading ? (
                <div className="text-muted">Loading...</div>
            ) : entries.length === 0 ? (
                <p className="text-center text-muted py-10">No audit entries.</p>
            ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full min-w-[640px] text-sm border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold text-primary">Time</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">User</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Role</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Action</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((e: any, i: number) => (
                            <tr key={e._id ?? e.id ?? e.timestamp ?? i} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="px-3 py-2.5">{e.timestamp ? new Date(e.timestamp).toLocaleString() : '-'}</td>
                                <td className="px-3 py-2.5">{e.actor_full_name || e.username || '-'}</td>
                                <td className="px-3 py-2.5"><span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-800">{e.actor_role ?? '-'}</span></td>
                                <td className="px-3 py-2.5 font-semibold">{e.action}</td>
                                <td className="px-3 py-2.5">{e.details ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </section>
    );
}
