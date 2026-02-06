import type { ReactNode } from 'react';

export type User = { id: number; username: string; full_name: string; role: string };

export type ApiOptions = { onUnauthorized?: () => void };

export interface SectionApi {
    showToast: (msg: string, type?: string) => void;
    setModal: (node: ReactNode | null) => void;
    loadSection: (sec: string) => Promise<void>;
    authOpts: ApiOptions;
}
