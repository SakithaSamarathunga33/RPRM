const mongoose = require('mongoose');

// Helper for virtual 'id'
const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true }, id: true };

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'cashier', 'floor'], required: true },
    status: { type: String, default: 'active' },
    can_export_csv: { type: Boolean, default: false },
    can_approve_expenses: { type: Boolean, default: false },
    can_view_pnl: { type: Boolean, default: false },
    can_close_day: { type: Boolean, default: false },
    can_enter_rake: { type: Boolean, default: false },
    last_login: Date
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, ...opts });

const PlayerSchema = new mongoose.Schema({
    membership_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nickname: String,
    phone: String,
    email: String,
    notes: String,
    nationality: String,
    id_type: String,
    id_number: String,
    status: { type: String, default: 'active' },
    loyalty_tier: { type: Number, default: 0 },
    loyalty_tier_name: { type: String, default: 'No Card' },
    loyalty_points: { type: Number, default: 0 },
    loyalty_hours_ytd: { type: Number, default: 0 },
    loyalty_hours_total: { type: Number, default: 0 },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, ...opts });

// Counter for auto-incrementing custom IDs if needed (like membership_id logic)
// But for now we calculate next ID in logic as before.

const CurrencySchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: String,
    is_base: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    display_order: { type: Number, default: 0 }
}, opts);

const FxRateSchema = new mongoose.Schema({
    currency_code: { type: String, required: true },
    rate_to_lkr: { type: Number, required: true },
    effective_date: { type: String, required: true }, // YYYY-MM-DD
    entered_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String
}, { timestamps: { createdAt: 'entered_at' }, ...opts });
FxRateSchema.index({ currency_code: 1, effective_date: 1 }, { unique: true });

const LoyaltyTierSchema = new mongoose.Schema({
    tier_level: { type: Number, unique: true },
    tier_name: String,
    min_hours: Number,
    max_hours: Number,
    points_multiplier: Number,
    card_color: String
}, opts);

const SettingSchema = new mongoose.Schema({
    casino_name: String,
    poker_room_name: String,
    operator_company: String,
    base_currency: { type: String, default: 'LKR' },
    casino_share_percent: { type: Number, default: 50.0 },
    session_timeout_minutes: { type: Number, default: 30 },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, ...opts });

// Table Session
const TableSessionSchema = new mongoose.Schema({
    table_name: String,
    game_type: { type: String, enum: ['NLH', 'PLO'] },
    plo_variant: Number,
    small_blind: Number,
    big_blind: Number,
    session_date: { type: String, required: true }, // YYYY-MM-DD
    start_time: String,
    end_time: String,
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    rake_collected_lkr: { type: Number, default: 0 },
    notes: String,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    closed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    closed_at: Date
}, { timestamps: { createdAt: 'created_at' }, ...opts });

// Player Session
const PlayerSessionSchema = new mongoose.Schema({
    table_session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TableSession', required: true },
    player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    seat_number: Number,
    seat_in_time: String,
    seat_out_time: String,
    hours_played: { type: Number, default: 0 },
    total_buyin_lkr: { type: Number, default: 0 },
    total_cashout_lkr: { type: Number, default: 0 },
    net_result_lkr: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    points_earned: { type: Number, default: 0 },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, ...opts });

const TransactionSchema = new mongoose.Schema({
    transaction_type: { type: String, enum: ['buyin', 'cashout', 'expense', 'rake', 'casino_share', 'adjustment'] },
    player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    player_session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PlayerSession' },
    table_session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TableSession' },
    amount_original: Number,
    currency_code: String,
    fx_rate: Number,
    amount_lkr: Number,
    expense_category: String,
    notes: String,
    transaction_date: String,
    transaction_time: String,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    day_closed: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at' }, ...opts });

const DayClosingSchema = new mongoose.Schema({
    closing_date: { type: String, unique: true },
    total_rake_lkr: { type: Number, default: 0 },
    total_casino_share_lkr: { type: Number, default: 0 },
    total_expenses_lkr: { type: Number, default: 0 },
    net_result_lkr: { type: Number, default: 0 },
    total_buyin_lkr: { type: Number, default: 0 },
    total_cashout_lkr: { type: Number, default: 0 },
    player_count: { type: Number, default: 0 },
    table_count: { type: Number, default: 0 },
    total_player_hours: { type: Number, default: 0 },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    closed_at: Date,
    closed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: 'created_at' }, ...opts });

const AuditLogSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    actor_full_name: { type: String, default: '' }, // full name of the person who performed the action (for display in User column)
    actor_role: { type: String, default: '' },
    action: String,
    details: String,
    timestamp: Date
}, opts);

module.exports = {
    User: mongoose.model('User', UserSchema),
    Player: mongoose.model('Player', PlayerSchema),
    Currency: mongoose.model('Currency', CurrencySchema),
    FxRate: mongoose.model('FxRate', FxRateSchema),
    LoyaltyTier: mongoose.model('LoyaltyTier', LoyaltyTierSchema),
    Setting: mongoose.model('Setting', SettingSchema),
    TableSession: mongoose.model('TableSession', TableSessionSchema),
    PlayerSession: mongoose.model('PlayerSession', PlayerSessionSchema),
    Transaction: mongoose.model('Transaction', TransactionSchema),
    DayClosing: mongoose.model('DayClosing', DayClosingSchema),
    AuditLog: mongoose.model('AuditLog', AuditLogSchema)
};
