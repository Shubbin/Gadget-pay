const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');
const UserTier = require('../models/UserTier');
const InsurancePlan = require('../models/InsurancePlan');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    await seedData();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Seed Tiers
    const tiers = [
      { name: 'Bronze', min_score: 91, max_score: 100, interest_discount: 0, credit_multiplier: 1.0 },
      { name: 'Silver', min_score: 61, max_score: 90, interest_discount: 0.5, credit_multiplier: 1.2 },
      { name: 'Gold', min_score: 31, max_score: 60, interest_discount: 1.0, credit_multiplier: 1.5 },
      { name: 'Platinum', min_score: 0, max_score: 30, interest_discount: 2.0, credit_multiplier: 2.0 }
    ];

    for (const tier of tiers) {
      await UserTier.findOneAndUpdate({ name: tier.name }, tier, { upsert: true });
    }

    // Seed Insurance Plans
    const insurancePlans = [
      { name: 'Basic Care', description: 'Covers screen cracks and liquid damage', monthly_premium: 1500.00, coverage_limit: 50000.00 },
      { name: 'Premium Guard', description: 'Covers theft, loss, and all physical damage', monthly_premium: 3500.00, coverage_limit: 200000.00 }
    ];

    for (const plan of insurancePlans) {
      await InsurancePlan.findOneAndUpdate({ name: plan.name }, plan, { upsert: true });
    }

    // Seed Products
    const sampleProducts = [
      {
        name: 'MacBook Pro 16" (M3 Max, 2024)',
        brand: 'Apple',
        category: 'Laptops',
        price: 2450000,
        description: 'The 16-inch MacBook Pro with M3 Max...',
        specs: { "Processor": "Apple M3 Max", "RAM": "32GB", "Storage": "1TB" },
        image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
        rating: 4.9
      },
      {
        name: 'iPhone 15 Pro Max - 256GB',
        brand: 'Apple',
        category: 'Phones',
        price: 1850000,
        description: 'Forged in titanium...',
        specs: { "Chipset": "A17 Pro", "RAM": "8GB", "Storage": "256GB" },
        image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
        rating: 4.8
      }
      // Add more as needed
    ];

    for (const product of sampleProducts) {
      await Product.findOneAndUpdate({ name: product.name }, product, { upsert: true });
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error(`Seeding Error: ${error.message}`);
  }
};

// Initial connection
// connectDB();

module.exports = {
  connectDB,
  // Mock query to avoid breaking existing code during transition
  query: async (text, params) => {
    console.warn('SQL Query called on MongoDB! Refactor needed:', text);
    throw new Error('Direct SQL queries are no longer supported. Please use Mongoose models.');
  }
};
