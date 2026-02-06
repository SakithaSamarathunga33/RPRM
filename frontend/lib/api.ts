/**
 * Central API client for the poker room manager.
 * All frontend API calls go through this file (credentials: include for session cookies).
 */

export type ApiOptions = RequestInit & {
    onUnauthorized?: () => void;
};

const defaultOpts: RequestInit = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
};

// Fallback to localhost:5000 in development if variable is not set
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '');

async function request<T = unknown>(url: string, opts?: ApiOptions): Promise<T> {
    const { onUnauthorized, ...init } = opts ?? {};
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

    // If using absolute URL different from origin, credentials might fail without proper CORS setup on backend
    // backend already has CORS: origin: 'http://localhost:3000', credentials: true.

    try {
        const res = await fetch(fullUrl, { ...defaultOpts, ...init, headers: { ...defaultOpts.headers, ...init?.headers } as HeadersInit });
        const data = (await res.json().catch(() => ({}))) as T & { error?: string };
        if (data && (data as { error?: string }).error === 'Not authenticated' && onUnauthorized) {
            onUnauthorized();
        }
        return data;
    } catch (err) {
        console.error("API Request Failed:", err);
        throw err;
    }
}

/** Base API call; use when you need custom options or the response as-is. */
export function api<T = unknown>(url: string, opts?: ApiOptions): Promise<T> {
    return request<T>(url, opts);
}

// ─── Auth ───
export function getSession(opts?: ApiOptions) {
    return request<{ success: boolean; authenticated: boolean; user?: { id: number; username: string; full_name: string; role: string } }>('/api/session', opts);
}

export function login(username: string, password: string) {
    return request<{ success: boolean; error?: string; user?: { id: number; username: string; full_name: string; role: string } }>('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
}

export function logout(reason?: 'manual' | 'idle_timeout') {
    return request<{ success: boolean }>('/api/logout', {
        method: 'POST',
        body: JSON.stringify({ reason: reason || 'manual' }),
    });
}

// ─── Settings & reference data ───
export function getCurrencies(opts?: ApiOptions) {
    return request<{ success: boolean; currencies?: unknown[] }>('/api/currencies', opts);
}

export function getSettings(opts?: ApiOptions) {
    return request<{ success: boolean; settings?: unknown }>('/api/settings', opts);
}

export function updateSettings(body: Record<string, unknown>, opts?: ApiOptions) {
    return request<{ success: boolean; error?: string }>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(body),
        ...opts,
    });
}

export function getFxRates(date: string, opts?: ApiOptions) {
    return request<{ success: boolean; rates?: unknown[] }>(`/api/fx-rates?date=${date}`, opts);
}

export function updateFxRate(body: { currency_code: string; rate_to_lkr: number | string; effective_date: string; notes?: string }, opts?: ApiOptions) {
    return request<{ success: boolean; error?: string }>('/api/fx-rates', {
        method: 'POST',
        body: JSON.stringify(body),
        ...opts,
    });
}

// ─── Reports ───
export function getDailySummary(date: string, opts?: ApiOptions) {
    return request<Record<string, unknown>>(`/api/reports/daily-summary?date=${date}`, opts);
}

export function getPlayerReport(pid: number, opts?: ApiOptions) {
    return request<{ success: boolean; player?: unknown; totals?: unknown }>(`/api/reports/player/${pid}`, opts);
}

export function getAuditLog(opts?: ApiOptions) {
    return request<{ success: boolean; entries?: unknown[] }>('/api/reports/audit-log', opts);
}

// ─── Tables ───
export function getTables(date: string, opts?: ApiOptions) {
    return request<{ success: boolean; tables?: unknown[] }>(`/api/tables?date=${date}`, opts);
}

export function getTablePlayers(tid: number, opts?: ApiOptions) {
    return request<{ success: boolean; players?: unknown[] }>(`/api/tables/${tid}/players`, opts);
}

export function openTable(body: { session_date: string; table_name?: string; game_type?: string; small_blind?: number; big_blind?: number;[k: string]: unknown }, opts?: ApiOptions) {
    return request<{ success: boolean; error?: string }>('/api/tables', {
        method: 'POST',
        body: JSON.stringify(body),
        ...opts,
    });
}

export function seatIn(tid: number, body: { player_id: string | number; seat_number: string | number }, opts?: ApiOptions) {
    return request<{ success: boolean; error?: string }>(`/api/tables/${tid}/seat-in`, {
        method: 'POST',
        body: JSON.stringify(body),
        ...opts,
    });
}

export function closeTable(tid: number, body: { rake_collected_lkr: number; end_time: string }, opts?: ApiOptions) {
    return request<{ success: boolean; error?: string }>(`/api/tables/${tid}/close`, {
        method: 'POST',
        body: JSON.stringify(body),
        ...opts,
    });
}

// ─── Player sessions ───
export function seatOut(psid: number, body: { seat_out_time: string }, opts?: ApiOptions) {
    return request<{ success: boolean; error?: string }>(`/api/player-sessions/${psid}/seat-out`, {
        method: 'POST',
        body: JSON.stringify(body),
        ...opts,
    });
}

// ─── Players ───
export function getPlayers(status?: string, opts?: ApiOptions) {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<{ success: boolean; players?: unknown[] }>(`/api/players${q}`, opts);
}

export function getNextPlayerId(opts?: ApiOptions) {
    return request<{ success: boolean; next_id?: string }>('/api/players/next-id', opts);
}

export function getPlayer(pid: number | string, opts?: ApiOptions) {
    return request<{ success: boolean; player?: unknown }>('/api/players/' + pid, opts);
}

export function createPlayer(body: Record<string, unknown>, opts?: ApiOptions) {
    return request<{ success: boolean; error?: string }>('/api/players', {
        method: 'POST',
        body: JSON.stringify(body),
        ...opts,
    });
}

export function updatePlayer(pid: number, body: Record<string, unknown>, opts?: ApiOptions) {
    return request<{ success: boolean; error?: string }>(`/api/players/${pid}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        ...opts,
    });
}

// ─── Transactions ───
export function getTransactions(date: string, opts?: ApiOptions) {
    return request<{ success: boolean; transactions?: unknown[] }>(`/api/transactions?date=${date}`, opts);
}

export function buyin(body: { player_session_id: number; amount: string | number; currency_code: string; notes?: string }, opts?: ApiOptions) {
    return request<{ success: boolean; error?: string }>('/api/transactions/buyin', {
        method: 'POST',
        body: JSON.stringify(body),
        ...opts,
    });
}

export function cashout(body: { player_session_id: number; amount: string | number; currency_code: string; notes?: string }, opts?: ApiOptions) {
    return request<{ success: boolean; error?: string }>('/api/transactions/cashout', {
        method: 'POST',
        body: JSON.stringify(body),
        ...opts,
    });
}

export function createExpense(body: { amount: string | number; category: string; notes?: string; date: string }, opts?: ApiOptions) {
    return request<{ success: boolean; error?: string }>('/api/transactions/expense', {
        method: 'POST',
        body: JSON.stringify(body),
        ...opts,
    });
}

// ─── Users (admin) ───
export function getUsers(opts?: ApiOptions) {
    return request<{ success: boolean; users?: unknown[] }>('/api/users', opts);
}

export function createUser(body: Record<string, unknown>, opts?: ApiOptions) {
    return request<{ success: boolean; error?: string }>('/api/users', {
        method: 'POST',
        body: JSON.stringify(body),
        ...opts,
    });
}

export function updateUser(id: number | string, body: Record<string, unknown>, opts?: ApiOptions) {
    return request<{ success: boolean; error?: string }>(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        ...opts,
    });
}

export function deleteUser(id: number | string, opts?: ApiOptions) {
    return request<{ success: boolean; error?: string }>(`/api/users/${id}`, {
        method: 'DELETE',
        ...opts,
    });
}

// ─── Demo mode fallback (when backend is unreachable) ───
export function getMockData(url: string): Record<string, unknown> {
    if (url.includes('/session')) {
        return { authenticated: true, user: { id: 999, username: 'demo', full_name: 'Demo Admin', role: 'admin' } };
    }
    if (url.includes('/currencies')) {
        return { success: true, currencies: [{ code: 'LKR' }, { code: 'USD' }, { code: 'EUR' }] };
    }
    if (url.includes('daily-summary')) {
        return {
            success: true,
            tables: { count: 5, open: 2 },
            players: { count: 12, total_hours: 45.5, total_points: 120, total_buyin: 250000, total_cashout: 180000 },
            financials: { total_rake: 15000, net_result: 12000, total_expenses: 3000 },
            day: { status: 'open' },
        } as Record<string, unknown>;
    }
    if (url.includes('/tables')) {
        return {
            success: true,
            tables: [
                { id: 1, table_name: 'Table 1', game_type: 'NLH', small_blind: 100, big_blind: 200, status: 'open', active_players: 5 },
                { id: 2, table_name: 'Table 2', game_type: 'PLO', small_blind: 500, big_blind: 1000, status: 'open', active_players: 3 },
                { id: 3, table_name: 'Table 3', game_type: 'NLH', status: 'closed', active_players: 0 },
            ],
        };
    }
    if (url.includes('/players')) {
        return {
            success: true,
            players: [
                { id: 1, membership_id: 'M-00001', name: 'John Doe', loyalty_tier_name: 'Gold', loyalty_points: 1500 },
                { id: 2, membership_id: 'M-00002', name: 'Jane Smith', loyalty_tier_name: 'Silver', loyalty_points: 500 },
            ],
        };
    }
    return { success: true };
}

/** Mock data by section name (for demo mode when backend is unreachable). */
export function getMockDataForSection(section: string): Record<string, unknown> {
    const base = '/api/';
    const map: Record<string, string> = {
        dashboard: 'reports/daily-summary?date=',
        tables: 'tables?date=',
        players: 'players?status=active',
        transactions: 'transactions?date=',
        fxrates: 'currencies',
        settings: 'settings',
        users: 'users',
        audit: 'audit-log',
    };
    return getMockData(base + (map[section] ?? 'session'));
}
