const { Player, LoyaltyTier } = require('../schemas');

class PlayerModel {
    static async findAll(query, status = 'active') {
        const filter = { status };
        if (query) {
            const regex = new RegExp(query, 'i');
            filter.$or = [{ name: regex }, { membership_id: regex }, { nickname: regex }];
        }
        return await Player.find(filter).sort({ name: 1 });
    }

    static async findById(id) {
        return await Player.findById(id);
    }

    static async getNextId() {
        const last = await Player.findOne().sort({ _id: -1 }); // approximating order by id desc
        // Better: sort by membership_id if alphanumeric sort works, but standard regex parse is safer
        // Let's assume sequential creation.
        let num = 1;
        if (last && last.membership_id) {
            try { num = parseInt(last.membership_id.replace('M-', '')) + 1; } catch (e) { }
        }
        return `M-${String(num).padStart(5, '0')}`;
    }

    static async create(data, createdBy) {
        let mid = (data.membership_id || '').trim();
        if (!mid) {
            mid = await this.getNextId();
        }
        const created = await Player.create({
            ...data,
            membership_id: mid,
            status: 'active',
            created_by: createdBy
        });
        return { insertId: created._id, membership_id: mid };
    }

    static async update(id, data) {
        // Mongoose ignores undefined in updates usually, but clean update is better
        await Player.findByIdAndUpdate(id, data);
        return true;
    }

    static async updateLoyalty(id, hours, points, tierInfo) {
        await Player.findByIdAndUpdate(id, {
            $inc: { loyalty_hours_ytd: hours, loyalty_hours_total: hours, loyalty_points: points },
            loyalty_tier: tierInfo.tier_level,
            loyalty_tier_name: tierInfo.tier_name
        });
    }
}

module.exports = PlayerModel;
