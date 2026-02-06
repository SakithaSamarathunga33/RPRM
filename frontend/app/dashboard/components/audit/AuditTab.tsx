'use client';

interface AuditTabProps {
    data: any;
    loading: boolean;
}

export default function AuditTab({ data, loading }: AuditTabProps) {
    const entries = Array.isArray(data) ? data : [];
    return (
        <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="mb-5">
                <h2 className="text-xl text-primary">Audit Log</h2>
            </div>
            {loading ? (
                <div className="text-muted">Loading...</div>
            ) : entries.length === 0 ? (
                <p className="text-center text-muted py-10">No audit entries.</p>
            ) : (
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold text-primary">Time</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">User</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Action</th>
                            <th className="bg-slate-50 px-3 py-2.5 text-left font-semibold">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((e: any, i: number) => (
                            <tr key={e.id ?? e.timestamp ?? i} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="px-3 py-2.5">{e.timestamp ? new Date(e.timestamp).toLocaleString() : '-'}</td>
                                <td className="px-3 py-2.5">{e.username ?? '-'}</td>
                                <td className="px-3 py-2.5 font-semibold">{e.action}</td>
                                <td className="px-3 py-2.5">{e.details ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}
