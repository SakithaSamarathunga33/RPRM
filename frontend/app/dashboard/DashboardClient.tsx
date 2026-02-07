'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast as sonnerToast } from 'sonner';
import {
    getSession,
    getCurrencies,
    getDailySummary,
    getTables,
    getTablePlayers,
    getPlayers,
    getTransactions,
    getFxRates,
    getSettings,
    getUsers,
    getAuditLog,
    logout,
    getMockData,
    getMockDataForSection,
} from '@/lib/api';
import {
    DashboardTab,
    TablesTab,
    PlayersTab,
    TransactionsTab,
    FxRatesTab,
    ReportsTab,
    SettingsTab,
    UsersTab,
    AuditTab,
} from './components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';

type User = { id: number; username: string; full_name: string; role: string };
type SessionSettings = { session_timeout_minutes: number };

export default function DashboardClient() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [section, setSection] = useState('dashboard');
    const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
    const [modal, setModal] = useState<React.ReactNode | null>(null);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [allCurrencies, setAllCurrencies] = useState<any[]>([]);
    const [sessionSettings, setSessionSettings] = useState<SessionSettings>({ session_timeout_minutes: 30 });
    const [dataCache, setDataCache] = useState<Record<string, any>>({});

    const today = new Date().toISOString().split('T')[0];
    const [dates, setDates] = useState({ dashboard: today, tables: today, transactions: today, fx: today, report: today });
    const previousSectionRef = useRef<string | null>(null);

    const authOpts = { onUnauthorized: () => router.push('/login') };
    const isDemo = () => typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true';

    async function apiCall<T = any>(fn: () => Promise<T>, fallbackUrl?: string): Promise<T> {
        try {
            const d = await fn();
            const out = d as T & { error?: string; authenticated?: boolean };
            if (out?.error === 'Not authenticated') {
                if (isDemo()) return getMockData('/api/session') as T;
                router.push('/login');
            }
            return d;
        } catch {
            if (isDemo() && fallbackUrl) return getMockData(fallbackUrl) as T;
            showToast('Connection error', 'error');
            return { success: false } as T;
        }
    }

    const TAB_PERMISSIONS: Record<string, string[]> = {
        dashboard: ['admin'],
        tables: ['admin', 'manager', 'cashier', 'floor'],
        players: ['admin', 'manager', 'cashier', 'floor'],
        transactions: ['admin', 'manager', 'cashier'],
        fxrates: ['admin'],
        reports: ['admin', 'manager', 'cashier', 'account'],
        settings: ['admin'],
        users: ['admin'],
        audit: ['admin'],
    };

    const getAllowedTabs = (role: string) => {
        return Object.keys(TAB_PERMISSIONS).filter(tab => TAB_PERMISSIONS[tab].includes(role));
    };

    const showToast = (msg: string, type = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const latestSectionRef = useRef(section);

    const loadSection = async (sec: string, forceReload = false) => {
        // Update ref to ensure we only process the latest request
        latestSectionRef.current = sec;

        // Cache key logic
        const getCacheKey = (s: string) => {
            if (s === 'dashboard') return `dashboard_${dates.dashboard}`;
            if (s === 'tables') return `tables_${dates.tables}`;
            if (s === 'transactions') return `transactions_${dates.transactions}`;
            if (s === 'fxrates') return `fxrates_${dates.fx}`;
            return s;
        };
        const cacheKey = getCacheKey(sec);

        // Optimistic load from cache
        let hasCache = false;
        if (!forceReload && dataCache[cacheKey]) {
            setData(dataCache[cacheKey]);
            hasCache = true;
        } else {
            // Only clear if we don't have cache (or forced)
            setData(null);
        }

        previousSectionRef.current = sec;

        // Show loading only if we don't have data to show
        if (!hasCache) setLoading(true);

        const updateData = (newData: any) => {
            // STRICT CHECK: Ensure we are still on the same section
            if (latestSectionRef.current !== sec) return;
            setData(newData);
            setDataCache(prev => ({ ...prev, [cacheKey]: newData }));
        };

        let res: any;
        try {
            switch (sec) {
                case 'dashboard': res = await apiCall(() => getDailySummary(dates.dashboard, authOpts), `/api/daily-summary?date=${dates.dashboard}`); break;
                case 'tables': res = await apiCall(() => getTables(dates.tables, authOpts), `/api/tables?date=${dates.tables}`); break;
                case 'players': res = await apiCall(() => getPlayers('active', authOpts), '/api/players?status=active'); break;
                case 'transactions': res = await apiCall(() => getTransactions(dates.transactions, authOpts), `/api/transactions?date=${dates.transactions}`); break;
                case 'fxrates': {
                    const fx = await apiCall(() => getFxRates(dates.fx, authOpts), `/api/fx-rates?date=${dates.fx}`);
                    const cur = await apiCall(() => getCurrencies(authOpts), '/api/currencies');

                    if (latestSectionRef.current !== sec) return; // Check before multi-step update

                    if (fx?.success && cur?.success) {
                        updateData({ success: true, rates: (fx as any).rates ?? [], currencies: cur.currencies ?? [] });
                    } else {
                        updateData({ success: false, error: (fx as any)?.error || (cur as any)?.error || 'Failed to load', rates: [], currencies: cur?.currencies ?? [] });
                    }
                    return setLoading(false);
                }
                case 'reports':
                    setData(null);
                    return setLoading(false);
                case 'settings':
                    res = await apiCall(() => getSettings(authOpts), '/api/settings');
                    if (res.success && latestSectionRef.current === sec) {
                        if ((res as any).settings?.session_timeout_minutes) {
                            setSessionSettings({
                                session_timeout_minutes: (res as any).settings.session_timeout_minutes,
                            });
                        }
                        updateData((res as any).settings);
                    }
                    return setLoading(false);
                case 'users':
                    res = await apiCall(() => getUsers(authOpts), '/api/users');
                    if (res?.success) updateData((res as any).users);
                    else updateData({ success: false, error: (res as any)?.error, users: [] });
                    return setLoading(false);
                case 'audit':
                    res = await apiCall(() => getAuditLog(authOpts), '/api/audit');
                    if (res?.success) updateData((res as any).entries);
                    else updateData({ success: false, error: (res as any)?.error, entries: [] });
                    return setLoading(false);
                default: res = null;
            }
            if (res?.success) {
                updateData(res);
            } else if (res && typeof res === 'object') {
                // API returned but success: false (e.g. 500) – show error state
                const empty = sec === 'dashboard' ? { tables: { count: 0, open: 0 }, players: { count: 0, total_hours: 0, total_points: 0, total_buyin: 0, total_cashout: 0 }, financials: { total_rake: 0, casino_share_percent: 0, casino_share: 0, house_revenue: 0, total_expenses: 0, net_result: 0 }, win_loss: { winners: 0, total_won: 0, losers: 0, total_lost: 0, breakeven: 0 }, day_status: { status: 'open' } } : sec === 'tables' ? { tables: [] } : sec === 'transactions' ? { transactions: [] } : {};
                updateData({ success: false, error: (res as any).error || 'Failed to load', ...empty });
            }
        } catch {
            if (isDemo()) updateData(getMockDataForSection(sec));
            else if (latestSectionRef.current === sec) {
                const empty = sec === 'dashboard' ? { tables: { count: 0, open: 0 }, players: { count: 0, total_hours: 0, total_points: 0, total_buyin: 0, total_cashout: 0 }, financials: { total_rake: 0, casino_share_percent: 0, casino_share: 0, house_revenue: 0, total_expenses: 0, net_result: 0 }, win_loss: { winners: 0, total_won: 0, losers: 0, total_lost: 0, breakeven: 0 }, day_status: { status: 'open' } } : sec === 'tables' ? { tables: [] } : sec === 'transactions' ? { transactions: [] } : sec === 'players' ? { players: [] } : {};
                updateData({ success: false, error: 'Connection error', ...empty });
            }
        }

        // Only turn off loading if we are still on the matching section
        if (latestSectionRef.current === sec) {
            setLoading(false);
        }
    };

    const doLogout = async (isIdleTimeout = false) => {
        await logout(isIdleTimeout ? 'idle_timeout' : 'manual');
        if (isIdleTimeout) {
            // Store a flag to show message on login page
            sessionStorage.setItem('idle_logout', 'true');
        }
        router.push('/login');
    };

    // Handle idle timeout - auto-logout user
    const handleIdleTimeout = useCallback(() => {
        sonnerToast.warning('Session expired due to inactivity. Please log in again.');
        doLogout(true);
    }, []);

    // Idle timeout hook
    useIdleTimeout({
        timeoutMinutes: sessionSettings.session_timeout_minutes,
        onIdle: handleIdleTimeout,
        enabled: !!user && sessionSettings.session_timeout_minutes > 0,
    });

    const sectionApi = {
        showToast,
        setModal,
        loadSection,
        authOpts,
        apiCall,
    };

    // Initial session check and settings load
    useEffect(() => {
        apiCall(() => getSession(authOpts), '/api/session').then((d: any) => {
            if (!d.authenticated) router.push('/login');
            else {
                setUser(d.user);
                // Ensure default section is valid for role
                const allowed = getAllowedTabs(d.user.role);
                if (!allowed.includes(section)) {
                    setSection(allowed[0]);
                }

                apiCall(() => getCurrencies(authOpts), '/api/currencies').then((c: any) => {
                    if (c.success) setAllCurrencies(c.currencies ?? []);
                });

                // Load settings for session timeout
                apiCall(() => getSettings(authOpts), '/api/settings').then((s: any) => {
                    if (s.success && s.settings) {
                        setSessionSettings({
                            session_timeout_minutes: s.settings.session_timeout_minutes ?? 30,
                        });
                    }
                });
            }
        });
    }, []);

    useEffect(() => {
        if (user && getAllowedTabs(user.role).includes(section)) {
            loadSection(section);
        }
    }, [user, section, dates]);

    if (!user) return null;

    const allowedTabs = getAllowedTabs(user.role);

    return (
        <div className="min-h-screen min-h-dvh flex flex-col">
            <header className="bg-primary text-white px-3 sm:px-6 py-2 sm:py-3 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <img src="/static/images/regulus_logo.png" alt="Regulus" className="h-10 sm:h-14 rounded-md shrink-0" />
                    <div className="min-w-0">
                        <h1 className="text-sm sm:text-lg font-bold tracking-wide truncate">REGULUS POKER ROOM MANAGER <span className="text-xs sm:text-sm font-normal opacity-80">v1.0</span></h1>
                        <span className="text-xs sm:text-sm opacity-80 truncate block">{data?.settings?.poker_room_name ? `${data.settings.poker_room_name} — ${data.settings.casino_name}` : 'Poker Room Manager'}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto ml-auto min-h-[32px] sm:min-h-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate max-w-[100px] sm:max-w-none text-xs sm:text-sm">{user.full_name}</span>
                        <span className="px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 shrink-0">{user.role.toUpperCase()}</span>
                    </div>
                    <button type="button" className="py-1.5 px-2.5 rounded-md text-xs font-semibold bg-white/20 hover:bg-white/30 transition touch-manipulation shrink-0 sm:py-2 sm:px-4 sm:text-sm sm:min-h-[44px]" onClick={() => doLogout()}>Logout</button>
                </div>
            </header>
            <Tabs value={section} onValueChange={setSection} className="flex flex-col flex-1 min-h-0">
                <div className="bg-white px-2 sm:px-6 py-2 border-b-2 border-slate-200 overflow-x-auto">
                    <TabsList className="h-auto p-0 bg-transparent gap-1 flex-nowrap sm:flex-wrap justify-start min-w-max sm:min-w-0">
                        {allowedTabs.map((s) => (
                            <TabsTrigger
                                key={s}
                                value={s}
                                className="px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-white text-slate-600 hover:bg-slate-100 hover:text-primary transition bg-transparent shadow-none border-none shrink-0 min-h-[44px] touch-manipulation"
                            >
                                {s === 'dashboard' && '📊 Dashboard'}
                                {s === 'tables' && '🎰 Tables'}
                                {s === 'players' && '👥 Players'}
                                {s === 'transactions' && '💵 Transactions'}
                                {s === 'fxrates' && '💱 FX Rates'}
                                {s === 'reports' && '📋 Reports'}
                                {s === 'settings' && '⚙️ Settings'}
                                {s === 'users' && '👤 Users'}
                                {s === 'audit' && '📝 Audit'}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                {toast && (
                    <div
                        className={`fixed top-5 right-5 z-[2000] px-6 py-3 rounded-lg text-white font-semibold text-sm shadow-lg ${toast.type === 'success' ? 'bg-success' : toast.type === 'error' ? 'bg-danger' : 'bg-accent'
                            }`}
                    >
                        {toast.msg}
                    </div>
                )}
                {modal && (
                    <div className="fixed inset-0 bg-black/50 z-[1000] flex justify-center items-center p-4" onClick={() => setModal(null)}>
                        <div className="w-full max-w-4xl flex justify-center" onClick={(e) => e.stopPropagation()}>{modal}</div>
                    </div>
                )}
                <main className="flex-1 w-full p-3 sm:p-5 box-border overflow-x-hidden">
                    {allowedTabs.includes('dashboard') && (
                        <TabsContent value="dashboard" className="m-0 space-y-4 outline-none">
                            <DashboardTab data={data} loading={loading} date={dates.dashboard} onDateChange={(date) => setDates((d) => ({ ...d, dashboard: date }))} />
                        </TabsContent>
                    )}
                    {allowedTabs.includes('tables') && (
                        <TabsContent value="tables" className="m-0 space-y-4 outline-none">
                            <TablesTab data={data} loading={loading} date={dates.tables} onDateChange={(date) => setDates((d) => ({ ...d, tables: date }))} api={sectionApi} allCurrencies={allCurrencies} />
                        </TabsContent>
                    )}
                    {allowedTabs.includes('players') && (
                        <TabsContent value="players" className="m-0 space-y-4 outline-none">
                            <PlayersTab data={data} loading={loading} onSearchChange={() => loadSection('players')} api={{ ...sectionApi, showToast }} />
                        </TabsContent>
                    )}
                    {allowedTabs.includes('transactions') && (
                        <TabsContent value="transactions" className="m-0 space-y-4 outline-none">
                            <TransactionsTab data={data} loading={loading} date={dates.transactions} onDateChange={(date) => setDates((d) => ({ ...d, transactions: date }))} api={sectionApi} />
                        </TabsContent>
                    )}
                    {allowedTabs.includes('fxrates') && (
                        <TabsContent value="fxrates" className="m-0 space-y-4 outline-none">
                            <FxRatesTab data={data} loading={loading} date={dates.fx} onDateChange={(date) => setDates((d) => ({ ...d, fx: date }))} api={sectionApi} />
                        </TabsContent>
                    )}
                    {allowedTabs.includes('reports') && (
                        <TabsContent value="reports" className="m-0 space-y-4 outline-none">
                            <ReportsTab data={data} loading={loading} date={dates.report} onDateChange={(date) => setDates((d) => ({ ...d, report: date }))} />
                        </TabsContent>
                    )}
                    {allowedTabs.includes('settings') && (
                        <TabsContent value="settings" className="m-0 space-y-4 outline-none">
                            <SettingsTab data={data} loading={loading} loadSection={loadSection} />
                        </TabsContent>
                    )}
                    {allowedTabs.includes('users') && (
                        <TabsContent value="users" className="m-0 space-y-4 outline-none">
                            <UsersTab data={data} loading={loading} loadSection={loadSection} currentUser={user} />
                        </TabsContent>
                    )}
                    {allowedTabs.includes('audit') && (
                        <TabsContent value="audit" className="m-0 space-y-4 outline-none">
                            <AuditTab data={data} loading={loading} />
                        </TabsContent>
                    )}
                </main>
            </Tabs>
        </div>
    );
}
