'use client';

interface ReportsTabProps {
    data: any;
    loading: boolean;
    date: string;
    onDateChange: (date: string) => void;
}

export default function ReportsTab({ data, loading, date, onDateChange }: ReportsTabProps) {
    return (
        <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
                <h2 className="text-xl text-primary">Reports</h2>
                <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className="px-3 py-2 border-2 border-slate-200 rounded-md text-sm" />
            </div>
            {loading ? (
                <div className="text-muted">Loading...</div>
            ) : (
                <div className="bg-slate-50 p-6 rounded-lg">
                    <h3 className="text-primary mb-3">📋 Report Options</h3>
                    <p className="text-muted">Daily summary, player activity, and loyalty rankings are available from the Dashboard and Players sections. Additional report types can be added here.</p>
                </div>
            )}
        </section>
    );
}
