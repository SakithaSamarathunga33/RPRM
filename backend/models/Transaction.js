const { Transaction } = require('../schemas');

class TransactionModel {
    static async findAll(date) {
        const trans = await Transaction.find({ transaction_date: date })
            .populate('player_id', 'name membership_id')
            .sort({ _id: -1 }).lean();

        return trans.map(t => ({
            ...t,
            id: t._id,
            player_name: t.player_id?.name,
            membership_id: t.player_id?.membership_id,
            player_id: t.player_id?._id
        }));
    }

    static async create(data, userId) {
        const now = new Date();
        await Transaction.create({
            transaction_type: data.type,
            player_id: data.player_id || undefined,
            player_session_id: data.player_session_id || undefined,
            table_session_id: data.table_session_id || undefined,
            amount_original: data.amount,
            currency_code: data.currency_code || 'LKR',
            fx_rate: data.fx_rate || 1,
            amount_lkr: data.amount_lkr,
            expense_category: data.category || undefined,
            notes: data.notes || '',
            transaction_date: data.date || now.toISOString().split('T')[0],
            transaction_time: now.toTimeString().slice(0, 5),
            created_by: userId
        });
    }
}

module.exports = TransactionModel;
