require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
    uri: process.env.DATABASE_URL,
    multipleStatements: true
};

async function initDb() {
    console.log("Connecting to database...");
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig.uri);
        console.log("Connected.");
    } catch (e) {
        console.error("Connection failed:", e);
        return;
    }

    const schema = [
        `CREATE TABLE IF NOT EXISTS settings (
            id INT PRIMARY KEY DEFAULT 1,
            casino_name VARCHAR(255) DEFAULT 'Majestic Pride Casino',
            poker_room_name VARCHAR(255) DEFAULT 'Jim''s Poker Room',
            operator_company VARCHAR(255) DEFAULT 'Golden Island Hospitality Private Limited',
            base_currency VARCHAR(10) DEFAULT 'LKR',
            casino_share_percent DOUBLE DEFAULT 50.0,
            session_timeout_minutes INT DEFAULT 30,
            updated_at VARCHAR(64),
            updated_by INT,
            CHECK (id = 1)
        )`,
        `CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL CHECK (role IN ('admin','manager','cashier','floor')),
            status VARCHAR(50) DEFAULT 'active',
            can_export_csv TINYINT DEFAULT 0,
            can_approve_expenses TINYINT DEFAULT 0,
            can_view_pnl TINYINT DEFAULT 0,
            can_close_day TINYINT DEFAULT 0,
            can_enter_rake TINYINT DEFAULT 0,
            created_at VARCHAR(64) NOT NULL,
            updated_at VARCHAR(64),
            last_login VARCHAR(64)
        )`,
        `CREATE TABLE IF NOT EXISTS players (
            id INT PRIMARY KEY AUTO_INCREMENT,
            membership_id VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            nickname VARCHAR(255),
            phone VARCHAR(50),
            email VARCHAR(255),
            notes TEXT,
            nationality VARCHAR(100),
            id_type VARCHAR(50),
            id_number VARCHAR(100),
            status VARCHAR(50) DEFAULT 'active',
            loyalty_tier INT DEFAULT 0,
            loyalty_tier_name VARCHAR(100) DEFAULT 'No Card',
            loyalty_points DOUBLE DEFAULT 0,
            loyalty_hours_ytd DOUBLE DEFAULT 0,
            loyalty_hours_total DOUBLE DEFAULT 0,
            created_at VARCHAR(64) NOT NULL,
            created_by INT,
            updated_at VARCHAR(64)
        )`,
        `CREATE TABLE IF NOT EXISTS currencies (
            id INT PRIMARY KEY AUTO_INCREMENT,
            code VARCHAR(10) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            is_base TINYINT DEFAULT 0,
            is_active TINYINT DEFAULT 1,
            display_order INT DEFAULT 0
        )`,
        `CREATE TABLE IF NOT EXISTS fx_rates (
            id INT PRIMARY KEY AUTO_INCREMENT,
            currency_code VARCHAR(10) NOT NULL,
            rate_to_lkr DOUBLE NOT NULL,
            effective_date VARCHAR(64) NOT NULL,
            entered_at VARCHAR(64) NOT NULL,
            entered_by INT NOT NULL,
            notes TEXT,
            UNIQUE(currency_code, effective_date)
        )`,
        `CREATE TABLE IF NOT EXISTS table_sessions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            table_name VARCHAR(255) NOT NULL,
            game_type VARCHAR(50) NOT NULL CHECK (game_type IN ('NLH','PLO')),
            plo_variant INT,
            small_blind DOUBLE NOT NULL,
            big_blind DOUBLE NOT NULL,
            session_date VARCHAR(64) NOT NULL,
            start_time VARCHAR(64) NOT NULL,
            end_time VARCHAR(64),
            status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open','closed')),
            rake_collected_lkr DOUBLE DEFAULT 0,
            notes TEXT,
            created_at VARCHAR(64) NOT NULL,
            created_by INT NOT NULL,
            closed_at VARCHAR(64),
            closed_by INT,
            is_locked TINYINT DEFAULT 0
        )`,
        `CREATE TABLE IF NOT EXISTS player_sessions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            table_session_id INT NOT NULL,
            player_id INT NOT NULL,
            seat_number INT,
            seat_in_time VARCHAR(64) NOT NULL,
            seat_out_time VARCHAR(64),
            hours_played DOUBLE DEFAULT 0,
            total_buyin_lkr DOUBLE DEFAULT 0,
            total_cashout_lkr DOUBLE DEFAULT 0,
            net_result_lkr DOUBLE DEFAULT 0,
            status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','closed')),
            points_earned DOUBLE DEFAULT 0,
            created_at VARCHAR(64) NOT NULL,
            created_by INT NOT NULL,
            updated_at VARCHAR(64),
            FOREIGN KEY (table_session_id) REFERENCES table_sessions(id),
            FOREIGN KEY (player_id) REFERENCES players(id)
        )`,
        `CREATE TABLE IF NOT EXISTS transactions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('buyin','cashout','expense','rake','casino_share','adjustment')),
            player_id INT,
            player_session_id INT,
            table_session_id INT,
            amount_original DOUBLE NOT NULL,
            currency_code VARCHAR(10) NOT NULL,
            fx_rate DOUBLE NOT NULL,
            amount_lkr DOUBLE NOT NULL,
            expense_category VARCHAR(100),
            notes TEXT,
            transaction_date VARCHAR(64) NOT NULL,
            transaction_time VARCHAR(64) NOT NULL,
            created_at VARCHAR(64) NOT NULL,
            created_by INT NOT NULL,
            day_closed TINYINT DEFAULT 0,
            FOREIGN KEY (player_id) REFERENCES players(id),
            FOREIGN KEY (player_session_id) REFERENCES player_sessions(id),
            FOREIGN KEY (table_session_id) REFERENCES table_sessions(id)
        )`,
        `CREATE TABLE IF NOT EXISTS day_closings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            closing_date VARCHAR(64) UNIQUE NOT NULL,
            total_rake_lkr DOUBLE DEFAULT 0,
            total_casino_share_lkr DOUBLE DEFAULT 0,
            total_expenses_lkr DOUBLE DEFAULT 0,
            net_result_lkr DOUBLE DEFAULT 0,
            total_buyin_lkr DOUBLE DEFAULT 0,
            total_cashout_lkr DOUBLE DEFAULT 0,
            player_count INT DEFAULT 0,
            table_count INT DEFAULT 0,
            total_player_hours DOUBLE DEFAULT 0,
            status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open','closed')),
            closed_at VARCHAR(64),
            closed_by INT,
            created_at VARCHAR(64) NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS loyalty_tiers (
            id INT PRIMARY KEY AUTO_INCREMENT,
            tier_level INT UNIQUE NOT NULL,
            tier_name VARCHAR(100) NOT NULL,
            min_hours INT NOT NULL,
            max_hours INT,
            points_multiplier DOUBLE NOT NULL,
            card_color VARCHAR(50)
        )`,
        `CREATE TABLE IF NOT EXISTS audit_log (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT,
            username VARCHAR(255),
            action VARCHAR(50) NOT NULL,
            details TEXT,
            timestamp VARCHAR(64) NOT NULL
        )`
    ];

    console.log("Creating tables...");
    for (const sql of schema) {
        try {
            await connection.query(sql);
        } catch (e) {
            console.error("Error creating table:", e.message);
            // Don't exit, might just be 'table exists' or syntax error
        }
    }

    // Seeding
    console.log("Seeding data...");

    // Settings
    const [settings] = await connection.query("SELECT COUNT(*) as c FROM settings");
    if (settings[0].c === 0) {
        await connection.query("INSERT INTO settings (id, updated_at) VALUES (1, ?)", [new Date().toISOString()]);
        console.log("Seeded settings.");
    }

    // Currencies
    const [currencies] = await connection.query("SELECT COUNT(*) as c FROM currencies");
    if (currencies[0].c === 0) {
        const currencyList = [
            ['LKR', 'Sri Lankan Rupee'], ['USD', 'US Dollar'], ['EUR', 'Euro'],
            ['GBP', 'British Pound'], ['AUD', 'Australian Dollar'], ['HKD', 'Hong Kong Dollar'],
            ['SGD', 'Singapore Dollar'], ['AED', 'UAE Dirham'], ['INR', 'Indian Rupee'],
            ['RUB', 'Russian Ruble'], ['JPY', 'Japanese Yen'], ['USDT', 'Tether (USDT)']
        ];
        let i = 1;
        for (const [code, name] of currencyList) {
            await connection.query(
                "INSERT INTO currencies (code, name, is_base, is_active, display_order) VALUES (?, ?, ?, 1, ?)",
                [code, name, code === 'LKR' ? 1 : 0, i++]
            );
        }
        console.log("Seeded currencies.");
    }

    // Loyalty Tiers
    const [tiers] = await connection.query("SELECT COUNT(*) as c FROM loyalty_tiers");
    if (tiers[0].c === 0) {
        const tierList = [
            [0, 'No Card', 0, 14, 1.0, '#808080'],
            [1, 'Bronze Card', 15, 75, 1.0, '#CD7F32'],
            [2, 'Silver Card', 76, 150, 1.1, '#C0C0C0'],
            [3, 'Gold Card', 151, 250, 1.2, '#FFD700'],
            [4, 'Diamond Card', 251, 399, 1.3, '#B9F2FF'],
            [5, 'Titanium Card', 400, 600, 1.5, '#878681'],
            [6, "Jim's Black Card", 601, null, 2.0, '#000000']
        ];
        for (const [lv, nm, mn, mx, ml, cl] of tierList) {
            await connection.query(
                "INSERT INTO loyalty_tiers (tier_level, tier_name, min_hours, max_hours, points_multiplier, card_color) VALUES (?, ?, ?, ?, ?, ?)",
                [lv, nm, mn, mx, ml, cl]
            );
        }
        console.log("Seeded tiers.");
    }

    // Admin User
    const [admins] = await connection.query("SELECT COUNT(*) as c FROM users WHERE role='admin'");
    if (admins[0].c === 0) {
        const pw = await bcrypt.hash('admin', 10);
        await connection.query(
            `INSERT INTO users (username, password_hash, full_name, role, status,
            can_export_csv, can_approve_expenses, can_view_pnl, can_close_day, can_enter_rake, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['admin', pw, 'Master Admin', 'admin', 'active', 1, 1, 1, 1, 1, new Date().toISOString()]
        );
        console.log("Seeded admin user.");
    }

    // Day Closing (initial)
    const today = new Date().toISOString().split('T')[0];
    const [closings] = await connection.query("SELECT COUNT(*) as c FROM day_closings WHERE closing_date=?", [today]);
    if (closings[0].c === 0) {
        await connection.query(
            "INSERT INTO day_closings (closing_date, status, created_at) VALUES (?, 'open', ?)",
            [today, new Date().toISOString()]
        );
        console.log("Seeded day closing.");
    }

    await connection.end();
    console.log("Database initialization complete.");
}

initDb();
