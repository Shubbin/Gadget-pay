const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');

const products = [
  {
    name: 'MacBook Pro 16"',
    brand: 'Apple',
    category: 'Laptops',
    price: 3250000,
    description: 'The most powerful MacBook Pro ever with M3 Pro chip, 18GB RAM, and 512GB SSD. Perfect for professionals.',
    specs: { Processor: 'Apple M3 Pro', RAM: '18GB', Storage: '512GB SSD', Display: '16.2" Liquid Retina XDR', Battery: 'Up to 22 hours' },
    installment_eligible: true,
    inventory: 10,
    rating: 4.8
  },
  {
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'Phones',
    price: 1850000,
    description: 'Titanium design, A17 Pro chip, 48MP camera system. The ultimate iPhone.',
    specs: { Processor: 'A17 Pro', RAM: '8GB', Storage: '256GB', Display: '6.7" Super Retina XDR', Camera: '48MP Triple' },
    installment_eligible: true,
    inventory: 25,
    rating: 4.9
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Phones',
    price: 1650000,
    description: 'Galaxy AI, 200MP camera, S Pen included. The complete smartphone experience.',
    specs: { Processor: 'Snapdragon 8 Gen 3', RAM: '12GB', Storage: '256GB', Display: '6.8" Dynamic AMOLED', Camera: '200MP Quad' },
    installment_eligible: true,
    inventory: 15,
    rating: 4.7
  },
  {
    name: 'iPad Pro 12.9"',
    brand: 'Apple',
    category: 'Tablets',
    price: 1450000,
    description: 'M2 chip, Liquid Retina XDR display. The ultimate iPad for creative professionals.',
    specs: { Processor: 'Apple M2', RAM: '8GB', Storage: '128GB', Display: '12.9" Liquid Retina XDR', Camera: '12MP Wide' },
    installment_eligible: true,
    inventory: 12,
    rating: 4.8
  },
  {
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    category: 'Accessories',
    price: 450000,
    description: 'Industry-leading noise cancellation, 30-hour battery, premium comfort.',
    specs: { Type: 'Over-ear', 'Noise Cancellation': 'Yes', Battery: '30 hours', Connectivity: 'Bluetooth 5.2' },
    installment_eligible: true,
    inventory: 50,
    rating: 4.7
  }
];

async function seed() {
  console.log('Seeding products...');
  const { data, error } = await supabase
    .from('products')
    .insert(products)
    .select();

  if (error) {
    console.error('Error seeding products:', error);
    return;
  }

  console.log('Successfully seeded', data.length, 'products!');
}

seed();
