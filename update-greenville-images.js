// Script to update Greenville deal with liva_2025 images
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://frtxsynlvwhpnzzgfgbt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydHhzeW5sdndocG56emdmZ2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MzM5NDAsImV4cCI6MjA1NzEwOTk0MH0.dQa_uTFztE4XxC9owtszePY-hcMLF9rVJfL01wrHYjg';

const supabase = createClient(supabaseUrl, supabaseKey);

// Liva 2025 images that are available
const livaImages = [
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0980.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0981.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0982.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0983.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0984.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0985.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0986.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0987.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0988.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0989.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0990.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0991.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0992.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0993.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0994.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0995.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0996.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0997.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0998.jpeg',
  'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0999.jpeg'
];

async function updateGreenvilleDeal() {
  console.log('🔄 Updating Greenville deal with Liva 2025 images...');
  
  try {
    // First, let's check if the deal exists in the database
    const { data: existingDeal, error: fetchError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', 'sutera-1')
      .single();

    if (fetchError) {
      console.log('Deal not found in database, updating mock data in code...');
      return updateMockData();
    }

    // Update the deal in the database
    const { data: updatedDeal, error: updateError } = await supabase
      .from('deals')
      .update({
        media_urls: livaImages,
        cover_image_url: livaImages[0], // Use first image as cover
        updated_at: new Date().toISOString()
      })
      .eq('id', 'sutera-1')
      .select();

    if (updateError) {
      console.error('❌ Error updating deal in database:', updateError);
      return updateMockData();
    }

    console.log('✅ Successfully updated Greenville deal in database');
    console.log('📸 Added', livaImages.length, 'Liva 2025 images');
    
  } catch (error) {
    console.error('❌ Error:', error);
    return updateMockData();
  }
}

function updateMockData() {
  console.log('📝 Updating mock data in code files...');
  
  // The deal is currently defined in multiple files as mock data
  // We need to update the cover_image_url and add media_urls
  console.log('📍 Files to update:');
  console.log('  - src/pages/Browse.tsx');
  console.log('  - src/pages/DealDetails.tsx');
  console.log('  - src/pages/SyndicatorProfile.tsx');
  console.log('  - src/pages/Home.tsx');
  
  console.log('🎯 New cover image:', livaImages[0]);
  console.log('📸 Total images available:', livaImages.length);
}

// Run the update
updateGreenvilleDeal(); 