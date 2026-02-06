export const fmt = (n: unknown) =>
    Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
export const fmt2 = (n: unknown) =>
    Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const tierClass = (t: number) => `tier-${t || 0}`;
