const { Setting, Currency, FxRate, LoyaltyTier } = require('../schemas');

class SettingModel {
    static async get() {
        // Find existing or create default
        let s = await Setting.findOne({ id: 1 }) || await Setting.findOne();
        if (!s) {
            // Seed if completely empty (though init script should handle)
            s = await Setting.create({ id: 1 });
        }
        return s;
    }

    static async update(data, userId) {
        const s = await this.get();
        await Setting.findByIdAndUpdate(s._id, { ...data, updated_by: userId });
        return true;
    }

    // Currencies & FX
    static async getCurrencies() {
        return await Currency.find({ is_active: true }).sort({ display_order: 1 });
    }

    static async getFxRates(date) {
        // Aggregate to join with Currency details
        // Or just Simple find and populate if simplified
        // The original SQL joined currencies. Schema has standard fields.

        // We can do a find and manually map names if needed or use aggregation
        const rates = await FxRate.aggregate([
            { $match: { effective_date: date } },
            { $lookup: { from: 'currencies', localField: 'currency_code', foreignField: 'code', as: 'currency_info' } },
            { $unwind: '$currency_info' },
            {
                $project: {
                    currency_code: 1, rate_to_lkr: 1, effective_date: 1, entered_at: 1, entered_by: 1, notes: 1,
                    currency_name: '$currency_info.name', display_order: '$currency_info.display_order'
                }
            },
            { $sort: { display_order: 1 } }
        ]);
        return rates;
    }

    static async upsertFxRate(data, userId) {
        const date = data.effective_date || new Date().toISOString().split('T')[0];
        await FxRate.findOneAndUpdate(
            { currency_code: data.currency_code, effective_date: date },
            {
                rate_to_lkr: data.rate_to_lkr,
                entered_by: userId,
                notes: data.notes || ''
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }

    static async getRate(code) {
        if (code === 'LKR') return 1.0;
        const rate = await FxRate.findOne({ currency_code: code }).sort({ effective_date: -1 }); // simplistic latest by text date
        return rate ? rate.rate_to_lkr : null;
    }

    // Loyalty
    static async getLoyaltyTier(hours) {
        // Find highest tier where min_hours <= hours
        const tiers = await LoyaltyTier.find({ min_hours: { $lte: hours } }).sort({ tier_level: -1 }).limit(1);
        if (tiers.length > 0) return tiers[0];
        return { tier_level: 0, tier_name: 'No Card', points_multiplier: 1.0 };
    }
}

module.exports = SettingModel;
