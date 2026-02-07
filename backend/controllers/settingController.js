const Setting = require('../models/Setting');
const { logAudit } = require('../models/Audit');

exports.getSettings = async (req, res) => {
    try {
        const settings = await Setting.get();
        res.json({ success: true, settings });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.updateSettings = async (req, res) => {
    try {
        const previous = await Setting.get();
        await Setting.update(req.body, req.session.user_id);

        // Build details: what was changed (field names and new values, no secrets)
        const safeKeys = ['casino_name', 'poker_room_name', 'operator_company', 'base_currency', 'casino_share_percent', 'session_timeout_minutes'];
        const changes = [];
        for (const key of safeKeys) {
            if (req.body[key] !== undefined) {
                const oldVal = previous ? previous[key] : undefined;
                const newVal = req.body[key];
                if (oldVal !== newVal) {
                    changes.push(`${key}: ${oldVal === undefined ? '—' : oldVal} → ${newVal}`);
                }
            }
        }
        const details = changes.length ? changes.join('; ') : 'Settings updated';

        await logAudit(req.session.user_id, req.session.username, req.session.full_name, req.session.role, 'UPDATE_SETTINGS', details);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.getCurrencies = async (req, res) => {
    try {
        const currencies = await Setting.getCurrencies();
        res.json({ success: true, currencies });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.getFxRates = async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const rates = await Setting.getFxRates(date);
        res.json({ success: true, rates, date });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.updateFxRate = async (req, res) => {
    try {
        await Setting.upsertFxRate(req.body, req.session.user_id);
        const { currency_code, rate_to_lkr, effective_date, notes } = req.body;
        await logAudit(req.session.user_id, req.session.username, req.session.full_name, req.session.role, 'UPDATE_FX_RATE', `${currency_code}: ${rate_to_lkr} LKR (date: ${effective_date})${notes ? ` — ${notes}` : ''}`);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.getCurrentRate = async (req, res) => {
    try {
        const code = req.params.code;
        const rate = await Setting.getRate(code);
        if (rate !== null) res.json({ success: true, rate, currency_code: code });
        else res.json({ success: false, error: 'No rate found' });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};
