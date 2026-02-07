const Table = require('../models/Table');
const Transaction = require('../models/Transaction');
const Setting = require('../models/Setting');
const { logAudit } = require('../models/Audit');
const Player = require('../models/Player');

exports.getTables = async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const tables = await Table.findAll(date);
        res.json({ success: true, tables });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.createTable = async (req, res) => {
    try {
        const id = await Table.create(req.body, req.session.user_id);
        logAudit(req.session.user_id, req.session.username, req.session.full_name, req.session.role, 'OPEN_TABLE', `${req.body.table_name}`);
        res.json({ success: true, table_id: id });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); } // Usually returns 200 with error property in this app per server.js
};

exports.closeTable = async (req, res) => {
    try {
        // Transaction logic for rake and casino share
        const tid = req.params.tid;
        const rake = await Table.close(tid, req.body, req.session.user_id);

        if (rake > 0) {
            const table = await Table.findById(tid);
            const now = new Date();
            // Record rake transaction
            await Transaction.create({
                type: 'rake',
                table_session_id: tid,
                amount: rake,
                amount_lkr: rake,
                date: table.session_date,
                fx_rate: 1,
                currency_code: 'LKR'
            }, req.session.user_id);

            // Casino share
            const settings = await Setting.get();
            const share = rake * (settings.casino_share_percent / 100);
            await Transaction.create({
                type: 'casino_share',
                table_session_id: tid,
                amount: share,
                amount_lkr: share,
                date: table.session_date,
                fx_rate: 1,
                currency_code: 'LKR'
            }, req.session.user_id);
        }

        logAudit(req.session.user_id, req.session.username, req.session.full_name, req.session.role, 'CLOSE_TABLE', `Table ${tid}, Rake: ${rake}`);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.getTablePlayers = async (req, res) => {
    try {
        const players = await Table.getTablePlayers(req.params.tid);
        res.json({ success: true, players });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.seatIn = async (req, res) => {
    try {
        const id = await Table.seatPlayer(req.params.tid, req.body, req.session.user_id);
        const player = await Player.findById(req.body.player_id);
        const table = await Table.findById(req.params.tid); // To get name for audit
        logAudit(req.session.user_id, req.session.username, req.session.full_name, req.session.role, 'SEAT_IN', `${player.name} at ${table.table_name}`);
        res.json({ success: true, session_id: id });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.seatOut = async (req, res) => {
    try {
        const { curPs, seatOut, hours } = await Table.seatOutPlayer(req.params.psid, req.body);

        const player = await Player.findById(curPs.player_id);
        const tierInfo = await Setting.getLoyaltyTier(player.loyalty_hours_ytd + hours);
        const points = hours * (await Setting.getLoyaltyTier(player.loyalty_hours_ytd)).points_multiplier;

        const net = curPs.total_cashout_lkr - curPs.total_buyin_lkr;

        await Table.updatePlayerSessionStats(req.params.psid, seatOut, hours, net, points);
        await Player.updateLoyalty(curPs.player_id, hours, points, tierInfo);

        logAudit(req.session.user_id, req.session.username, req.session.full_name, req.session.role, 'SEAT_OUT', `Player ${player.membership_id}`);
        res.json({ success: true, hours: parseFloat(hours.toFixed(2)), points: parseFloat(points.toFixed(2)), new_tier: tierInfo.tier_name });

    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};
