const Report = require('../models/Report');

exports.getDailySummary = async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const data = await Report.getDailySummary(date);

        const settings = await require('../models/Setting').get();
        const sharePctVal = settings?.casino_share_percent ?? 50;

        // Safe access with defaults
        const total_rake = data.total_rake?.[0]?.v ?? 0;
        const shareVal = total_rake * (sharePctVal / 100);
        const houseRev = total_rake - shareVal;
        const expenseVal = data.expenses?.[0]?.v ?? 0;
        const net = houseRev - expenseVal;

        const ps = data.ps?.[0] ?? { cnt: 0, hours: 0, points: 0, buyin: 0, cashout: 0 };
        const winners = data.winners?.[0] ?? { c: 0, v: 0 };
        const losers = data.losers?.[0] ?? { c: 0, v: 0 };
        const breakeven = data.breakeven?.[0] ?? { c: 0 };

        res.json({
            success: true,
            tables: { count: data.tables?.c ?? 0, open: data.open_tables?.c ?? 0 },
            players: { count: ps.cnt, total_hours: ps.hours, total_points: ps.points, total_buyin: ps.buyin, total_cashout: ps.cashout },
            financials: { total_rake, casino_share_percent: sharePctVal, casino_share: shareVal, house_revenue: houseRev, total_expenses: expenseVal, net_result: net },
            win_loss: { winners: winners.c, total_won: winners.v, losers: losers.c, total_lost: losers.v, breakeven: breakeven.c },
            day_status: data.day?.[0] || { status: 'open' }
        });

    } catch (e) { console.error('getDailySummary error:', e); res.status(500).json({ success: false, error: e.message }); }
};

exports.getPlayerActivity = async (req, res) => {
    try {
        const sessions = await Report.getPlayerActivity(req.query.date);
        res.json({ success: true, sessions });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.getLoyaltyRankings = async (req, res) => {
    try {
        const rows = await Report.getLoyaltyRankings();
        const rankings = rows.map((r, i) => ({ ...r, rank: i + 1 }));
        res.json({ success: true, rankings });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.getPlayerReport = async (req, res) => {
    try {
        const data = await Report.getPlayerReport(req.params.pid);
        const player = await require('../models/Player').findById(req.params.pid);
        if (!player) return res.json({ success: false, error: 'Not found' });

        res.json({ success: true, player, sessions: data.sessions, totals: data.totals });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.getAuditLog = async (req, res) => {
    try {
        const entries = await Report.getAuditLog();
        res.json({ success: true, entries });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};
