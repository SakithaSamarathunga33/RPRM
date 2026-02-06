const { TableSession, PlayerSession, DayClosing } = require('../schemas');

class TableModel {
    static async findAll(date) {
        const tables = await TableSession.find({ session_date: date }).sort({ start_time: -1 }).lean();

        // Populate active/total counts
        for (const t of tables) {
            t.active_players = await PlayerSession.countDocuments({ table_session_id: t._id, status: 'active' });
            t.total_players = await PlayerSession.countDocuments({ table_session_id: t._id });
            // Map _id to id for frontend compatibility if lean() is used (virtuals don't run on lean by default mostly, unless configured or manual)
            t.id = t._id;
        }
        return tables;
    }

    static async findById(id) {
        return await TableSession.findById(id);
    }

    static async create(data, userId) {
        const now = new Date();
        const date = data.session_date || now.toISOString().split('T')[0];

        const day = await DayClosing.findOne({ closing_date: date });
        if (day && day.status === 'closed') {
            throw new Error('Day is closed');
        }

        const table = await TableSession.create({
            ...data,
            session_date: date,
            start_time: data.start_time || now.toTimeString().slice(0, 5),
            status: 'open',
            created_by: userId
        });
        return table._id;
    }

    static async close(id, data, userId) {
        const active = await PlayerSession.countDocuments({ table_session_id: id, status: 'active' });
        if (active > 0) throw new Error('Players still seated');

        const rake = data.rake_collected_lkr || 0;
        const now = new Date();
        await TableSession.findByIdAndUpdate(id, {
            status: 'closed',
            end_time: data.end_time || now.toTimeString().slice(0, 5),
            rake_collected_lkr: rake,
            closed_at: now,
            closed_by: userId
        });

        return rake;
    }

    // Player Sessions
    static async getTablePlayers(tableId) {
        const sessions = await PlayerSession.find({ table_session_id: tableId })
            .populate('player_id', 'name membership_id nickname loyalty_tier_name')
            .sort({ seat_in_time: 1 }).lean();

        // Flatten structure for frontend
        return sessions.map(s => ({
            ...s,
            id: s._id,
            name: s.player_id?.name,
            membership_id: s.player_id?.membership_id,
            nickname: s.player_id?.nickname,
            loyalty_tier_name: s.player_id?.loyalty_tier_name,
            player_id: s.player_id?._id // keep raw id
        }));
    }

    static async seatPlayer(tableId, data, userId) {
        const now = new Date();
        const table = await TableSession.findOne({ _id: tableId, status: 'open' });
        if (!table) throw new Error('Table not open');

        const existing = await PlayerSession.findOne({ table_session_id: tableId, player_id: data.player_id, status: 'active' });
        if (existing) throw new Error('Already seated');

        const ps = await PlayerSession.create({
            table_session_id: tableId,
            player_id: data.player_id,
            seat_number: data.seat_number,
            seat_in_time: data.seat_in_time || now.toTimeString().slice(0, 5),
            status: 'active',
            created_by: userId
        });

        return ps._id;
    }

    static async getPlayerSession(psid) {
        return await PlayerSession.findById(psid);
    }

    static async seatOutPlayer(psid, data) {
        const now = new Date();
        const curPs = await PlayerSession.findOne({ _id: psid, status: 'active' });
        if (!curPs) throw new Error('Session not active');

        const seatOut = data.seat_out_time || now.toTimeString().slice(0, 5);
        let hours = 0;
        try {
            const d1 = new Date(`1970-01-01T${curPs.seat_in_time}:00`);
            const d2 = new Date(`1970-01-01T${seatOut}:00`);
            let diff = (d2 - d1) / 36e5;
            if (diff < 0) diff += 24;
            hours = diff;
        } catch (e) { }

        return { curPs, seatOut, hours };
    }

    static async updatePlayerSessionStats(psid, seatOut, hours, net, points) {
        await PlayerSession.findByIdAndUpdate(psid, {
            seat_out_time: seatOut,
            hours_played: parseFloat(hours.toFixed(2)),
            net_result_lkr: net,
            points_earned: parseFloat(points.toFixed(2)),
            status: 'closed'
        });
    }

    static async updateBuyIn(psid, amountLkr) {
        await PlayerSession.findByIdAndUpdate(psid, { $inc: { total_buyin_lkr: amountLkr } });
    }

    static async updateCashOut(psid, amountLkr) {
        await PlayerSession.findByIdAndUpdate(psid, { $inc: { total_cashout_lkr: amountLkr } });
    }
}

module.exports = TableModel;
