const { Pool } = require('pg');
require('dotenv').config();

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Aiven
  }
});

pool.on('connect', () => {
  console.log('Connected to Aiven PostgreSQL');
});

const setupDatabase = async () => {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    // Core Tables from supabase_schema.sql
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'vendor', 'super_admin', 'customer_care')),
        tier TEXT DEFAULT 'Bronze',
        kyc_status VARCHAR(20) DEFAULT 'unverified',
        credit_limit DECIMAL(12,2) DEFAULT 0,
        risk_score INTEGER DEFAULT 0,
        interest_discount DECIMAL(5,2) DEFAULT 0,
        is_verified BOOLEAN DEFAULT FALSE,
        otp_code TEXT,
        otp_expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        brand TEXT NOT NULL,
        category TEXT NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        description TEXT,
        specs JSONB,
        image_url TEXT,
        inventory INTEGER DEFAULT 10,
        rating DECIMAL(3, 2) DEFAULT 4.5,
        installment_eligible BOOLEAN DEFAULT TRUE,
        vendor_id UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        insurance_id INTEGER,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
        total_amount DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS installments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        total_installments INTEGER NOT NULL,
        frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
        remaining_balance DECIMAL(15, 2) NOT NULL,
        next_payment_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Loyalty Tiers
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_tiers (
        id SERIAL PRIMARY KEY, 
        name TEXT UNIQUE, 
        min_score INTEGER, 
        max_score INTEGER, 
        interest_discount DECIMAL(5,2), 
        credit_multiplier DECIMAL(5,2)
      )
    `);

    await pool.query(`
      INSERT INTO user_tiers (name, min_score, max_score, interest_discount, credit_multiplier) 
      VALUES 
        ('Bronze', 91, 100, 0, 1.0), 
        ('Silver', 61, 90, 0.5, 1.2), 
        ('Gold', 31, 60, 1.0, 1.5), 
        ('Platinum', 0, 30, 2.0, 2.0) 
      ON CONFLICT (name) DO NOTHING
    `);

    // Insurance Plans
    await pool.query(`
      CREATE TABLE IF NOT EXISTS insurance_plans (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE,
        description TEXT,
        monthly_premium DECIMAL(10,2),
        coverage_limit DECIMAL(10,2)
      )
    `);

    await pool.query(`
      INSERT INTO insurance_plans (name, description, monthly_premium, coverage_limit)
      VALUES 
        ('Basic Care', 'Covers screen cracks and liquid damage', 1500.00, 50000.00),
        ('Premium Guard', 'Covers theft, loss, and all physical damage', 3500.00, 200000.00)
      ON CONFLICT (name) DO NOTHING
    `);

    // Auto-Debit Subscriptions (for Paystack recurring)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auto_debit_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        installment_id UUID REFERENCES installments(id),
        paystack_auth_code TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Referrals
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
        referrer_id UUID REFERENCES users(id), 
        invitee_id UUID REFERENCES users(id), 
        status TEXT DEFAULT 'pending', 
        reward_claimed BOOLEAN DEFAULT false, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Notifications
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT CHECK (type IN ('reminder', 'success', 'error', 'info')),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Cart and Wishlist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);

    // Ensure foreign keys for Phase 8 fixes if tables already existed
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS tier_id INTEGER REFERENCES user_tiers(id)');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code TEXT');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP WITH TIME ZONE');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS insurance_id INTEGER REFERENCES insurance_plans(id)');
    
    // Ensure unique product names for seeding
    await pool.query('ALTER TABLE products ADD CONSTRAINT unique_product_name UNIQUE (name)');
    
    await seedProducts();
    
    console.log('Database Schema Verified/Updated');
  } catch (err) {
    if (err.code !== '42710' && err.code !== '42P07') { // Ignore already exists errors
        console.error('Database migration error:', err);
    } else {
        await seedProducts();
        console.log('Database Schema Verified/Updated');
    }
  }
};

const seedProducts = async () => {
  const sampleProducts = [
    [
      'MacBook Pro 16" (M3 Max, 2024)', 
      'Apple', 
      'Laptops', 
      2450000, 
      'The 16-inch MacBook Pro with M3 Max takes its power and speed to the next level, whether it’s on battery or plugged in. With a stunning Liquid Retina XDR display, all the ports you need, and all-day battery life, this pro laptop goes anywhere you need it to. The M3 Max chip features up to a 16-core CPU and up to a 40-core GPU, delivering monstrous performance for the most demanding workflows like 8K video editing and 3D rendering.\n\nFeaturing a 16.2-inch (diagonal) Liquid Retina XDR display with 3456-by-2234 native resolution at 254 pixels per inch. Extreme Dynamic Range (XDR) brings spectacular highlights, incredible detail in shadows, and vibrant, true-to-life colors. Each display is factory-calibrated and features ProMotion and reference modes.', 
      JSON.stringify({
        "Model": "Apple MacBook Pro 2024",
        "Processor": "Apple M3 Max (16-core CPU)",
        "GPU": "40-core GPU",
        "RAM": "32GB Unified Memory",
        "Storage": "1TB Superfast SSD",
        "Display": "16.2\" Liquid Retina XDR",
        "Battery": "Up to 22 hours",
        "Ports": "3x Thunderbolt 4, HDMI, SDXC, MagSafe 3",
        "OS": "macOS Sonoma",
        "Neural Engine": "16-core"
      }),
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000', 
      4.9
    ],
    [
      'iPhone 15 Pro Max - 256GB', 
      'Apple', 
      'Phones', 
      1850000, 
      'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and a more versatile Pro camera system. The 6.7-inch Super Retina XDR display with ProMotion increases refresh rates to 120Hz when you need exceptional graphics performance. The Dynamic Island bubbles up alerts and Live Activities. Plus, with an Always-On display, your Lock Screen stays glanceable, so you don’t have to tap it to stay in the know.\n\nA17 Pro is an entirely new class of iPhone chip that delivers our best graphics performance by far. Mobile games will look and feel so immersive, with incredibly detailed environments and more realistic characters. And with industry-leading speed and efficiency, A17 Pro takes fast and makes it fly.', 
      JSON.stringify({
        "Display": "6.7\" Super Retina XDR OLED",
        "Resolution": "2796 x 1290 pixels",
        "Chipset": "A17 Pro chip (3nm)",
        "CPU": "Hexa-core (2x3.78 GHz + 4x2.11 GHz)",
        "RAM": "8GB LPDDR5X",
        "Main Camera": "48MP (Wide) + 12MP (Tele) + 12MP (Ultrawide)",
        "Selfie Camera": "12MP TrueDepth",
        "Battery": "4,441 mAh (Fast charging)",
        "Resistance": "IP68 Dust/Water Resistant",
        "Build": "Grade 5 Titanium"
      }),
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1000', 
      4.8
    ],
    [
      'PlayStation 5 Console (Disc Edition)', 
      'Sony', 
      'Gaming', 
      680000, 
      'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio, and an all-new generation of incredible PlayStation games. The PS5 console unleashes new gaming possibilities that you never anticipated.\n\nMaximize your play sessions with near instant load times for installed PS5™ games. The custom integration of the PS5™ console\'s systems lets creators pull data from the SSD so quickly that they can design games in ways never before possible. Ray Tracing: Immerse yourself in worlds with a new level of realism as rays of light are individually simulated, creating true-to-life shadows and reflections in supported PS5™ games.', 
      JSON.stringify({
        "CPU": "x86-64-AMD Ryzen Zen 2",
        "GPU": "AMD Radeon RDNA 2-based graphics",
        "Memory": "16GB GDDR6",
        "Storage": "825GB Custom NVMe SSD",
        "Video": "4K 120Hz / 8K Support",
        "Audio": "Tempest 3D AudioTech",
        "Disc Drive": "Ultra HD Blu-ray (built-in)",
        "IO": "USB Type-A, USB Type-C, Ethernet",
        "Wireless": "Wi-Fi 6, Bluetooth 5.1",
        "Controller": "DualSense Wireless Controller"
      }),
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=1000', 
      4.9
    ],
    [
      'Sony WH-1000XM5 Wireless Headphones', 
      'Sony', 
      'Audio', 
      460000, 
      'From airplane noise to people’s voices, our WH-1000XM5 wireless headphones with multiple microphone noise canceling keep out more high and mid frequency sounds than ever. And with Auto NC Optimizer, noise canceling is automatically optimized based on your wearing conditions and environment.\n\nWith four microphones on each earcup, this is our biggest ever step forward in noise canceling. Ambient sound is captured even more accurately for a dramatic reduction in high frequency noise. Thanks to Auto NC Optimizer, noise canceling performance is always and automatically optimized based on wearing conditions and external environmental factors such as atmospheric pressure.', 
      JSON.stringify({
        "Driver": "30mm (Dynamic)",
        "Frequency": "4Hz - 40,000Hz (JEITA)",
        "Bluetooth": "Version 5.2",
        "Battery Life": "Up to 30 hours (ANC ON)",
        "Charging": "USB PD Quick Charge (3 min for 3 hrs)",
        "Weight": "Approx. 250g",
        "Codecs": "SBC, AAC, LDAC",
        "App": "Sony Headphones Connect",
        "Voices": "Speak-to-Chat / Google Assistant",
        "Sensors": "Wearing sensor for pause/play"
      }),
      'https://images.unsplash.com/photo-1618366712277-7c0337060594?auto=format&fit=crop&q=80&w=1000', 
      4.9
    ],
    [
      'Samsung Galaxy S24 Ultra - 512GB', 
      'Samsung', 
      'Phones', 
      1650000, 
      'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. It’s an absolute marvel of design. The legacy of Galaxy Note is alive and well. Write, tap and navigate with the precision your fingers wish they had on the new, flat display.\n\nWith the most megapixels on a Galaxy smartphone and AI processing, Galaxy S24 Ultra sets the industry standard for image quality every time you hit the shutter. What’s more, the new ProVisual engine recognizes objects — improving color tone, reducing noise and bringing out detail. Circle to Search: A new way to search is here with Circle to Search. While scrolling your favorite social network, use your S Pen or finger to circle something and get Google Search results.', 
      JSON.stringify({
        "Display": "6.8\" Dynamic AMOLED 2X",
        "Peak Brightness": "2600 nits",
        "Chipset": "Snapdragon 8 Gen 3 for Galaxy",
        "RAM": "12GB",
        "Storage": "512GB UFS 4.0",
        "Rear Camera": "200MP + 50MP + 12MP + 10MP",
        "Front Camera": "12MP Dual Pixel",
        "Battery": "5000mAh (45W Wired)",
        "Stylus": "Embedded S Pen",
        "Dimensions": "162.3 x 79 x 8.6 mm"
      }),
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=1000', 
      4.7
    ]
  ];

  for (const product of sampleProducts) {
    await pool.query(
      `INSERT INTO products (name, brand, category, price, description, specs, image_url, rating) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (name) DO UPDATE SET 
         specs = EXCLUDED.specs,
         description = EXCLUDED.description,
         price = EXCLUDED.price,
         image_url = EXCLUDED.image_url`,
      product
    );
  }
  console.log('Sample products seeded successfully');
};

setupDatabase();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
