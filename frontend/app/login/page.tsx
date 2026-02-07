'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, login, setSessionToken } from '@/lib/api';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        getSession().then((d) => {
            if (d.authenticated) router.push('/dashboard');
        });
    }, [router]);

    const doLogin = async () => {
        if (!username || !password) {
            setError('Please enter username and password');
            return;
        }
        try {
            const d = await login(username, password);
            if (d.success) {
                if (d.sessionToken) setSessionToken(d.sessionToken);
                router.push('/dashboard');
            } else setError(d.error || 'Login failed');
        } catch {
            setError('Connection error');
        }
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') doLogin();
    };

    return (
        <div className="min-h-screen min-h-dvh flex flex-col justify-center items-center bg-slate-100 font-sans p-4 safe-area-padding">
            <div className="bg-white rounded-2xl p-6 sm:p-12 w-full max-w-[420px] text-center shadow-lg border border-slate-200">
                <img src="/static/images/regulus_logo.png" alt="Regulus" className="h-20 sm:h-24 mx-auto mb-4" />
                <h1 className="text-primary text-lg sm:text-[22px] mb-1 tracking-wide">POKER ROOM MANAGER</h1>
                <p className="text-slate-500 text-xs sm:text-[13px] mb-6 sm:mb-8">Regulus Compliance Solutions Private Limited</p>
                {error && (
                    <div className="bg-red-100 text-red-700 px-3 py-2.5 rounded-md mb-4 text-sm">{error}</div>
                )}
                <div className="mb-4 sm:mb-5 text-left">
                    <label className="block text-slate-600 text-[13px] font-semibold mb-1.5">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Enter username"
                        autoFocus
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-base outline-none focus:border-accent transition min-h-[48px] touch-manipulation"
                    />
                </div>
                <div className="mb-4 sm:mb-5 text-left">
                    <label className="block text-slate-600 text-[13px] font-semibold mb-1.5">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Enter password"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-base outline-none focus:border-accent transition min-h-[48px] touch-manipulation"
                    />
                </div>
                <button
                    type="button"
                    onClick={doLogin}
                    className="w-full py-3.5 min-h-[48px] bg-primary text-white border-0 rounded-lg text-base font-bold cursor-pointer tracking-wide hover:opacity-95 touch-manipulation"
                >
                    LOGIN
                </button>
            </div>
            <div className="text-slate-400 text-[11px] mt-6 sm:mt-8 text-center px-2">
                © 2026 Regulus Compliance Solutions Private Limited. All Rights Reserved.<br />Designed by Jim Ramm
            </div>
        </div>
    );
}
