import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { seedData } from '../lib/seedData';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:', supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Convert seed data to use UUIDs
const sectionsWithUUIDs = seedData.sections.map(section => ({
  ...section,
  id: uuidv4()
}));

const productsWithUUIDs = seedData.products.map((product: any) => {
  const originalSection = seedData.sections.find(s => s.id === product.section_id);
  const newSection = sectionsWithUUIDs.find(s => s.name === originalSection?.name);
  const { section_id, ...rest } = product;
  return {
    ...rest,
    id: uuidv4(),
    section_id: newSection?.id || section_id
  };
});

const variantsWithUUIDs = seedData.variants.map((variant: any) => {
  const originalProduct = seedData.products.find((p: any) => p.id === variant.product_id);
  const newProduct = productsWithUUIDs.find(p => p.name === originalProduct?.name);
  const { product_id, ...rest } = variant;
  return {
    ...rest,
    id: uuidv4(),
    product_id: newProduct?.id || product_id
  };
});

async function seedDatabase() {
  console.log('Starting database seed...');

  try {
    // First, let's check the existing table structure
    console.log('Checking table structures...');
    
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('sections')
      .select('*')
      .limit(1);
    
    if (sectionsError) {
      console.error('Error checking sections table:', sectionsError);
    } else {
      console.log('Sections table structure:', sectionsData);
    }

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError) {
      console.error('Error checking products table:', productsError);
    } else {
      console.log('Products table structure:', productsData);
    }

    const { data: variantsData, error: variantsError } = await supabase
      .from('variants')
      .select('*')
      .limit(1);
    
    if (variantsError) {
      console.error('Error checking variants table:', variantsError);
    } else {
      console.log('Variants table structure:', variantsData);
    }

    // Seed sections
    console.log('Seeding sections...');
    const { error: sectionsInsertError } = await supabase
      .from('sections')
      .insert(sectionsWithUUIDs);
    
    if (sectionsInsertError) {
      console.error('Error seeding sections:', sectionsInsertError);
    } else {
      console.log('✓ Sections seeded successfully');
    }

    // Seed products
    console.log('Seeding products...');
    const { error: productsInsertError } = await supabase
      .from('products')
      .insert(productsWithUUIDs);
    
    if (productsInsertError) {
      console.error('Error seeding products:', productsInsertError);
    } else {
      console.log('✓ Products seeded successfully');
    }

    // Seed variants
    console.log('Seeding variants...');
    const { error: variantsInsertError } = await supabase
      .from('variants')
      .insert(variantsWithUUIDs);
    
    if (variantsInsertError) {
      console.error('Error seeding variants:', variantsInsertError);
    } else {
      console.log('✓ Variants seeded successfully');
    }

    console.log('Database seed completed!');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

seedDatabase();