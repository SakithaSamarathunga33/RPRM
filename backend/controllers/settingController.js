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
        await Setting.update(req.body, req.session.user_id);
        await logAudit(req.session.user_id, req.session.username, 'UPDATE_SETTINGS');
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
