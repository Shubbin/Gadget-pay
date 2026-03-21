require('dotenv').config();
const supabase = require('../config/supabase');

const productTags = {
  'MacBook Pro 14': ['apple', 'laptop', 'pro', 'm3', 'creative', 'high-performance'],
  'iPhone 15 Pro': ['apple', 'phone', 'pro', 'mobile', '5g', 'high-end'],
  'Samsung Galaxy S24': ['samsung', 'phone', 'android', 'flagship', 'ai', '5g'],
  'Dell XPS 15': ['dell', 'laptop', 'windows', 'premium', 'workstation', 'creative'],
  'Sony WH-1000XM5': ['sony', 'audio', 'headphones', 'noise-cancelling', 'music', 'lifestyle'],
  'iPad Pro 11': ['apple', 'tablet', 'tablet-pro', 'creative', 'portable', 'm2']
};

const seedTags = async () => {
  console.log('Seeding AI metadata tags...');
  
  try {
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name');

    if (fetchError) throw fetchError;

    for (const product of products) {
      const tags = productTags[product.name] || ['gadget', 'tech'];
      const { error: updateError } = await supabase
        .from('products')
        .update({ tags })
        .eq('id', product.id);

      if (updateError) console.error(`Failed to update ${product.name}:`, updateError.message);
      else console.log(`Updated ${product.name} with tags: ${tags.join(', ')}`);
    }

    console.log('Product tag seeding completed!');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

seedTags();
