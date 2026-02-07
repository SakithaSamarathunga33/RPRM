const { TableSession, PlayerSession, Transaction, DayClosing, Player, AuditLog } = require('../schemas');

class ReportModel {
    static async getDailySummary(date) {
        const tableCount = await TableSession.countDocuments({ session_date: date });
        const openTableCount = await TableSession.countDocuments({ session_date: date, status: 'open' });

        const tables = getTableIds(await TableSession.find({ session_date: date }, '_id'));

        // Rake
        const rakeAgg = await TableSession.aggregate([
            { $match: { session_date: date } },
            { $group: { _id: null, total: { $sum: '$rake_collected_lkr' } } }
        ]);
        const total_rake_val = rakeAgg[0]?.total || 0;

        // Player Sessions Aggregation
        const psAgg = await PlayerSession.aggregate([
            { $match: { table_session_id: { $in: tables } } },
            {
                $group: {
                    _id: null,
                    cnt: { $addToSet: '$player_id' }, // Distinct count trick
                    hours: { $sum: '$hours_played' },
                    points: { $sum: '$points_earned' },
                    buyin: { $sum: '$total_buyin_lkr' },
                    cashout: { $sum: '$total_cashout_lkr' }
                }
            }
        ]);

        const psStats = psAgg[0] || { cnt: [], hours: 0, points: 0, buyin: 0, cashout: 0 };
        const psCount = psStats.cnt.length;

        // Winners/Losers
        const winAgg = await PlayerSession.aggregate([
            { $match: { table_session_id: { $in: tables }, net_result_lkr: { $gt: 0 } } },
            { $group: { _id: null, c: { $sum: 1 }, v: { $sum: '$net_result_lkr' } } }
        ]);
        const loseAgg = await PlayerSession.aggregate([
            { $match: { table_session_id: { $in: tables }, net_result_lkr: { $lt: 0 } } },
            { $group: { _id: null, c: { $sum: 1 }, v: { $sum: { $abs: '$net_result_lkr' } } } } // abs might not be needed if summing negative, but request was total lost as positive usually
        ]);
        const breakAgg = await PlayerSession.countDocuments({ table_session_id: { $in: tables }, net_result_lkr: 0, status: 'closed' });

        // Expenses
        const expAgg = await Transaction.aggregate([
            { $match: { transaction_type: 'expense', transaction_date: date } },
            { $group: { _id: null, v: { $sum: '$amount_lkr' } } }
        ]);
        const expVal = expAgg[0]?.v || 0;

        const day = await DayClosing.findOne({ closing_date: date });

        return {
            tables: { c: tableCount },
            open_tables: { c: openTableCount },
            total_rake: [{ v: total_rake_val }],
            ps: [{ cnt: psCount, hours: psStats.hours, points: psStats.points, buyin: psStats.buyin, cashout: psStats.cashout }],
            winners: [{ c: winAgg[0]?.c || 0, v: winAgg[0]?.v || 0 }],
            losers: [{ c: loseAgg[0]?.c || 0, v: Math.abs(loseAgg[0]?.v || 0) }], // Ensure positive value for display
            breakeven: [{ c: breakAgg }],
            expenses: [{ v: expVal }],
            day: [day || { status: 'open' }]
        };
    }

    static async getPlayerActivity(date) {
        // Need to join ps -> table, ps -> player
        // Mongoose populate is easiest
        const tables = await TableSession.find({ session_date: date }).select('_id table_name game_type session_date');
        const tids = tables.map(t => t._id);

        const sessions = await PlayerSession.find({ table_session_id: { $in: tids } })
            .populate('player_id', 'name membership_id nickname')
            .populate('table_session_id', 'table_name game_type session_date')
            .lean();

        return sessions.map(s => ({
            ...s,
            player_name: s.player_id?.name,
            membership_id: s.player_id?.membership_id,
            nickname: s.player_id?.nickname,
            table_name: s.table_session_id?.table_name,
            game_type: s.table_session_id?.game_type,
            session_date: s.table_session_id?.session_date
        }));
    }

    static async getLoyaltyRankings() {
        return await Player.find({ status: 'active', loyalty_hours_ytd: { $gt: 0 } })
            .sort({ loyalty_hours_ytd: -1 })
            .select('id membership_id name loyalty_tier loyalty_tier_name loyalty_hours_ytd loyalty_points');
    }

    static async getPlayerReport(pid) {
        const sessions = await PlayerSession.find({ player_id: pid })
            .populate('table_session_id', 'table_name game_type session_date')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const mappedSessions = sessions.map(s => ({
            ...s,
            table_name: s.table_session_id?.table_name,
            game_type: s.table_session_id?.game_type,
            session_date: s.table_session_id?.session_date
        }));

        const agg = await PlayerSession.aggregate([
            { $match: { player_id: new require('mongoose').Types.ObjectId(pid) } },
            {
                $group: {
                    _id: null,
                    cnt: { $sum: 1 },
                    hrs: { $sum: '$hours_played' },
                    buyin: { $sum: '$total_buyin_lkr' },
                    cashout: { $sum: '$total_cashout_lkr' },
                    net: { $sum: '$net_result_lkr' }
                }
            }
        ]);

        return { sessions: mappedSessions, totals: agg[0] || {} };
    }

    static async getAuditLog() {
        return await AuditLog.find().sort({ _id: -1 }).limit(200).lean();
    }
}

function getTableIds(docs) { return docs.map(d => d._id); }

module.exports = ReportModel;
