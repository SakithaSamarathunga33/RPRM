const Player = require('../models/Player');
const { logAudit } = require('../models/Audit');

exports.getAllPlayers = async (req, res) => {
    try {
        const q = req.query.q || '';
        const status = req.query.status || 'active';
        const players = await Player.findAll(q, status);
        res.json({ success: true, players });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.getPlayer = async (req, res) => {
    try {
        const player = await Player.findById(req.params.pid);
        if (!player) return res.json({ success: false, error: 'Not found' });
        res.json({ success: true, player });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.getNextId = async (req, res) => {
    try {
        const nextId = await Player.getNextId();
        res.json({ success: true, next_id: nextId });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.createPlayer = async (req, res) => {
    try {
        const result = await Player.create(req.body, req.session.user_id);

        logAudit(req.session.user_id, req.session.username, 'CREATE_PLAYER', `Player ${result.membership_id} - ${req.body.name}`);
        res.json({ success: true, player_id: result.insertId, membership_id: result.membership_id });
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') return res.json({ success: false, error: 'Membership ID already exists' });
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.updatePlayer = async (req, res) => {
    try {
        const pid = req.params.pid;
        await Player.update(pid, req.body);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};
