const Transaction = require('../models/Transaction');
const Table = require('../models/Table');
const Setting = require('../models/Setting');
const { logAudit } = require('../models/Audit');
const Player = require('../models/Player');

exports.getAllTransactions = async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const transactions = await Transaction.findAll(date);
        res.json({ success: true, transactions });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.buyIn = async (req, res) => {
    try {
        const data = req.body;
        const ps = await Table.getPlayerSession(data.player_session_id);
        if (!ps || ps.status !== 'active') return res.json({ success: false, error: 'Session not active' });

        let fx = 1.0;
        if (data.currency_code !== 'LKR') {
            const r = await Setting.getRate(data.currency_code);
            if (!r) return res.json({ success: false, error: 'No FX rate' });
            fx = r;
        }
        const amtLkr = data.amount * fx;

        const table = await Table.findById(ps.table_session_id);

        await Transaction.create({
            type: 'buyin',
            player_id: ps.player_id,
            player_session_id: ps.id,
            table_session_id: ps.table_session_id,
            amount: data.amount,
            currency_code: data.currency_code,
            fx_rate: fx,
            amount_lkr: amtLkr,
            notes: data.notes,
            date: table.session_date
        }, req.session.user_id);

        await Table.updateBuyIn(ps.id, amtLkr);

        const player = await Player.findById(ps.player_id);
        logAudit(req.session.user_id, req.session.username, req.session.full_name, req.session.role, 'BUYIN', `Player ${player?.membership_id || ps.player_id}: ${data.amount} ${data.currency_code} (${amtLkr} LKR)${data.notes ? ` — ${data.notes}` : ''}`);

        res.json({ success: true, amount_lkr: amtLkr, fx_rate: fx });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.cashOut = async (req, res) => {
    try {
        const data = req.body;
        const ps = await Table.getPlayerSession(data.player_session_id);
        if (!ps || ps.status !== 'active') return res.json({ success: false, error: 'Session not active' });

        let fx = 1.0;
        if (data.currency_code !== 'LKR') {
            const r = await Setting.getRate(data.currency_code);
            if (!r) return res.json({ success: false, error: 'No FX rate' });
            fx = r;
        }
        const amtLkr = data.amount * fx;
        const table = await Table.findById(ps.table_session_id);

        await Transaction.create({
            type: 'cashout',
            player_id: ps.player_id,
            player_session_id: ps.id,
            table_session_id: ps.table_session_id,
            amount: data.amount,
            currency_code: data.currency_code,
            fx_rate: fx,
            amount_lkr: amtLkr,
            notes: data.notes,
            date: table.session_date
        }, req.session.user_id);

        await Table.updateCashOut(ps.id, amtLkr);

        const player = await Player.findById(ps.player_id);
        logAudit(req.session.user_id, req.session.username, req.session.full_name, req.session.role, 'CASHOUT', `Player ${player?.membership_id || ps.player_id}: ${data.amount} ${data.currency_code} (${amtLkr} LKR)${data.notes ? ` — ${data.notes}` : ''}`);

        res.json({ success: true, amount_lkr: amtLkr, fx_rate: fx });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.createExpense = async (req, res) => {
    try {
        const data = req.body;
        const playerId = data.player_id || undefined;
        await Transaction.create({
            type: 'expense',
            player_id: playerId,
            amount: data.amount,
            amount_lkr: data.amount,
            currency_code: 'LKR',
            fx_rate: 1,
            category: data.category,
            notes: data.notes,
            date: data.date
        }, req.session.user_id);

        let detailStr = `${data.amount} LKR — ${data.category || 'expense'}`;
        if (playerId) {
            const player = await Player.findById(playerId);
            if (player) detailStr += ` [Player: ${player.membership_id} ${player.name}]`;
        }
        if (data.notes) detailStr += `: ${data.notes}`;
        detailStr += ` (date: ${data.date})`;
        logAudit(req.session.user_id, req.session.username, req.session.full_name, req.session.role, 'RECORD_EXPENSE', detailStr);

        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};
