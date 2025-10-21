import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables. Please check your .env file:');
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStarboardProjects() {
  console.log('🚀 Setting up Starboard Realty past projects and updating average return...');
  
  try {
    // Get the Starboard Realty syndicator ID
    const { data: starboard, error: starboardError } = await supabase
      .from('syndicator_profiles')
      .select('id, company_name')
      .eq('company_name', 'Starboard Realty')
      .single();

    if (starboardError) {
      console.error('❌ Error fetching Starboard Realty:', starboardError);
      return;
    }

    if (!starboard) {
      console.error('❌ Starboard Realty not found in database');
      return;
    }

    console.log(`✅ Found Starboard Realty: ${starboard.company_name} (ID: ${starboard.id})`);

    // Update the average return to 18.7%
    console.log('📊 Updating average return to 18.7%...');
    const { error: updateError } = await supabase
      .from('syndicator_profiles')
      .update({ average_return: 18.7 })
      .eq('id', starboard.id);

    if (updateError) {
      console.error('❌ Error updating average return:', updateError);
    } else {
      console.log('✅ Average return updated to 18.7%');
    }

    // Check if past_projects table exists by trying to query it
    console.log('📋 Checking if past_projects table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('past_projects')
      .select('id')
      .limit(1);

    if (tableError) {
      console.log('⚠️ Past projects table does not exist. Please run the migration first:');
      console.log('   Go to Supabase Dashboard > SQL Editor');
      console.log('   Run the migration: supabase/migrations/20250121_create_past_projects_table.sql');
      console.log('   Then run this script again.');
      return;
    }

    console.log('✅ Past projects table exists');

    // Check if projects already exist
    const { data: existingProjects, error: existingError } = await supabase
      .from('past_projects')
      .select('id, name')
      .eq('syndicator_id', starboard.id);

    if (existingError) {
      console.error('❌ Error checking existing projects:', existingError);
      return;
    }

    if (existingProjects && existingProjects.length > 0) {
      console.log('⚠️ Past projects already exist for Starboard Realty:');
      existingProjects.forEach(project => {
        console.log(`  - ${project.name}`);
      });
      console.log('Skipping project insertion to avoid duplicates.');
      return;
    }

    // Define the past projects
    const pastProjects = [
      {
        syndicator_id: starboard.id,
        name: "Harper's Retreat",
        location: "Conroe, TX",
        type: "Multi-Family",
        units: 216,
        total_value: "Please Request",
        irr: "Please Request",
        exit_year: 2023,
        image_url: "https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/pastprojects/Screenshot%202025-10-21%20at%203.10.47%20PM.png",
        description: "Harper's Retreat is a Class A low-rise community located north of Houston, TX. Complete with high end modern finishes and comprised of 1- and 2-bedroom units, the property provides residents with modern living and easy access to the jobs and entertainment of the Houston area."
      },
      {
        syndicator_id: starboard.id,
        name: "Arden Woods",
        location: "Spring, TX",
        type: "Multi-Family",
        units: 308,
        total_value: "Please Request",
        irr: "Please Request",
        exit_year: 2023,
        image_url: "https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/pastprojects/Screenshot%202025-10-21%20at%203.13.10%20PM.png",
        description: "Arden Woods is a Class A garden-style community located north of Houston, TX. Comprised of 1-, 2-, and 3-bedroom units, the property features resort-style amenities and provides contemporary living with convenient access to everything Houston has to offer."
      },
      {
        syndicator_id: starboard.id,
        name: "The Dylan",
        location: "Fort Worth, TX",
        type: "Multi-Family",
        units: 227,
        total_value: "Please Request",
        irr: "Please Request",
        exit_year: 2023,
        image_url: "https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/pastprojects/Screenshot%202025-10-21%20at%203.14.03%20PM.png",
        description: "The Dylan is a Class A, garden-style community comprised of 1-, 2-, 3-bedroom, and townhome-style units. The property is highly-amenitized with retail locations on the lower levels, which provides residents with luxury suburban living within minutes from downtown Fort Worth."
      }
    ];

    // Insert the past projects
    console.log('📝 Adding past projects...');
    const { data, error } = await supabase
      .from('past_projects')
      .insert(pastProjects)
      .select();

    if (error) {
      console.error('❌ Error inserting past projects:', error);
      return;
    }

    console.log('✅ Successfully added past projects:');
    data.forEach(project => {
      console.log(`  - ${project.name} (${project.location})`);
    });

    console.log('🎉 Starboard Realty setup completed successfully!');
    console.log('📊 Average return updated to 18.7%');
    console.log('🏢 3 past projects added');
    
  } catch (error) {
    console.error('❌ Error in setupStarboardProjects:', error);
  }
}

setupStarboardProjects();
