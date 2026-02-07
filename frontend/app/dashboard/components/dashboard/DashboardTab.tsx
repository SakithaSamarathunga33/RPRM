import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fmt, fmt2 } from '../shared/utils';
import { Input } from '@/components/ui/input';

interface DashboardTabProps {
    data: any;
    loading: boolean;
    date: string;
    onDateChange: (date: string) => void;
}

export default function DashboardTab({ data, loading, date, onDateChange }: DashboardTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                <div className="flex items-center gap-2">
                    <Input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className="w-[180px]" />
                </div>
            </div>
            {loading ? (
                <div className="text-muted-foreground">Loading...</div>
            ) : data?.error || data?.success === false ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    <p className="font-medium">Failed to load dashboard</p>
                    <p className="text-sm mt-1">{data?.error || 'Please try again.'}</p>
                </div>
            ) : !data || !data.financials ? (
                <div className="text-muted-foreground">Loading...</div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="flex flex-col items-center justify-center p-6 bg-slate-50 border-none shadow-none text-center">
                            <div className="text-4xl font-bold text-slate-800 mb-1">{data.tables.count}</div>
                            <div className="text-sm text-slate-500">Tables <span className="text-slate-400 text-xs">({data.tables.open} open)</span></div>
                        </Card>
                        <Card className="flex flex-col items-center justify-center p-6 bg-slate-50 border-none shadow-none text-center">
                            <div className="text-4xl font-bold text-slate-800 mb-1">{data.players.count}</div>
                            <div className="text-sm text-slate-500">Players</div>
                        </Card>
                        <Card className="flex flex-col items-center justify-center p-6 bg-slate-50 border-none shadow-none text-center">
                            <div className="text-4xl font-bold text-slate-800 mb-1">{fmt2(data.players.total_hours)}</div>
                            <div className="text-sm text-slate-500">Total Hours</div>
                        </Card>
                        <Card className="flex flex-col items-center justify-center p-6 bg-slate-50 border-none shadow-none text-center">
                            <div className="text-4xl font-bold text-slate-800 mb-1">{fmt(data.players.total_points)}</div>
                            <div className="text-sm text-slate-500">Points Earned</div>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                        <Card className="bg-slate-50 border-none shadow-none p-4">
                            <CardHeader className="px-0 pt-0 pb-4">
                                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <span className="text-green-500">💵</span> Financial Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-0 pb-0">
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Total Buy-ins</span>
                                        <span>{fmt(data.players.total_buyin)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Total Cash-outs</span>
                                        <span>{fmt(data.players.total_cashout)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Total Rake</span>
                                        <span className="text-green-600 font-medium">{fmt(data.financials.total_rake)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Casino Share ({data.financials.casino_share_percent}%)</span>
                                        <span className="text-red-500">-{fmt(data.financials.casino_share)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Expenses</span>
                                        <span className="text-red-500">-{fmt(data.financials.total_expenses)}</span>
                                    </div>
                                    <div className="border-t border-slate-200 pt-3 flex justify-between items-center font-bold">
                                        <span className="text-slate-800">NET RESULT</span>
                                        <span className={data.financials.net_result >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {fmt(data.financials.net_result)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-50 border-none shadow-none p-4">
                            <CardHeader className="px-0 pt-0 pb-4">
                                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <span className="text-purple-500">📊</span> Player Results
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-0 pb-0">
                                <div className="space-y-0.5">
                                    <div className="bg-green-100 p-3 flex justify-between items-center rounded-t-md">
                                        <span className="font-semibold text-sm text-slate-700">{data.win_loss.winners} Winners</span>
                                        <span className="text-green-600 font-bold text-sm">+{fmt(data.win_loss.total_won)}</span>
                                    </div>
                                    <div className="bg-red-100 p-3 flex justify-between items-center">
                                        <span className="font-semibold text-sm text-slate-700">{data.win_loss.losers} Losers</span>
                                        <span className="text-red-600 font-bold text-sm">-{fmt(data.win_loss.total_lost)}</span>
                                    </div>
                                    <div className="bg-slate-200 p-3 flex justify-between items-center rounded-b-md mb-6">
                                        <span className="font-semibold text-sm text-slate-700">{data.win_loss.breakeven} Break-even</span>
                                    </div>
                                    <div className="text-center bg-slate-100 py-2 rounded-md flex items-center justify-center gap-2">
                                        <span className="text-sm font-bold text-slate-700">Day Status:</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${data.day_status?.status === 'closed' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                                            {data.day_status?.status ?? 'open'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
