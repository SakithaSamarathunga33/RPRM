const { User } = require('../schemas');
const bcrypt = require('bcrypt');

class UserModel {
    static async findByUsername(username) {
        return await User.findOne({ username, status: 'active' });
    }

    static async updateLastLogin(id) {
        return await User.findByIdAndUpdate(id, { last_login: new Date() });
    }

    static async findAll() {
        return await User.find({}, 'id username full_name role status last_login created_at');
    }

    static async create(data) {
        const pw = await bcrypt.hash(data.password, 10);
        return await User.create({
            username: data.username,
            password_hash: pw,
            full_name: data.full_name,
            role: data.role,
            status: 'active',
            can_export_csv: data.can_export_csv || false,
            can_view_pnl: data.can_view_pnl || false,
            can_close_day: data.can_close_day || false,
            can_enter_rake: data.can_enter_rake || false
        });
    }

    static async updatePassword(id, newPassword) {
        const pw = await bcrypt.hash(newPassword, 10);
        return await User.findByIdAndUpdate(id, { password_hash: pw });
    }
}

module.exports = UserModel;
