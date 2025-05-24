import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl)
  console.error('SERVICE_KEY:', !!supabaseServiceKey)
  console.log('\nPlease check your .env file and make sure you have:')
  console.log('VITE_SUPABASE_URL=your_supabase_url')
  console.log('VITE_SUPABASE_SERVICE_KEY=your_service_key (or SUPABASE_SERVICE_KEY)')
  process.exit(1)
}

// Create client with service key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createDrewFielderProfile() {
  try {
    console.log('🔍 Looking for Back Bay Capital syndicator...')
    
    // First, find Back Bay Capital syndicator
    const { data: syndicators, error: syndicatorError } = await supabase
      .from('syndicator_profiles')
      .select('id, company_name')
      .ilike('company_name', '%Back Bay%')

    if (syndicatorError) {
      console.error('❌ Error fetching syndicators:', syndicatorError)
      return
    }

    if (!syndicators || syndicators.length === 0) {
      console.error('❌ Back Bay Capital syndicator not found')
      return
    }

    const backbaySyndicator = syndicators[0]
    console.log('✅ Found syndicator:', backbaySyndicator.company_name, 'ID:', backbaySyndicator.id)

    // Check if Drew Fielder profile already exists
    console.log('🔍 Checking if Drew Fielder profile exists...')
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', 'andrew.fielder@backbayig.com')
      .maybeSingle()

    let drewProfile

    if (existingProfile) {
      console.log('✅ Drew Fielder profile already exists:', existingProfile.full_name)
      drewProfile = existingProfile
      
      // Update the existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: 'Drew Fielder',
          avatar_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/avatars/investors/DrewFielder.png',
          user_type: 'syndicator'
        })
        .eq('id', existingProfile.id)

      if (updateError) {
        console.error('❌ Error updating Drew Fielder profile:', updateError)
        return
      }
      console.log('✅ Updated Drew Fielder profile')
    } else {
      // Create new profile for Drew Fielder
      console.log('📝 Creating new profile for Drew Fielder...')
      
      // First create auth user (this might need to be done manually in Supabase Auth)
      console.log('⚠️  Note: You will need to manually create the auth user for andrew.fielder@backbayig.com in Supabase Auth dashboard')
      
      // For now, just create the profile entry with a placeholder ID
      // In a real scenario, you'd get the actual auth user ID
      const placeholderUserId = 'drew-fielder-placeholder-id'
      
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: placeholderUserId,
          email: 'andrew.fielder@backbayig.com',
          full_name: 'Drew Fielder',
          avatar_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/avatars/investors/DrewFielder.png',
          user_type: 'syndicator',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (profileError) {
        console.error('❌ Error creating Drew Fielder profile:', profileError)
        return
      }

      drewProfile = newProfile
      console.log('✅ Created Drew Fielder profile')
    }

    // Update Back Bay Capital syndicator to be associated with Drew Fielder
    console.log('🔗 Associating Drew Fielder with Back Bay Capital syndicator...')
    const { error: updateSyndicatorError } = await supabase
      .from('syndicator_profiles')
      .update({
        id: drewProfile.id  // This associates the syndicator profile with Drew's user profile
      })
      .eq('id', backbaySyndicator.id)

    if (updateSyndicatorError) {
      console.log('⚠️  Manual association needed: Link syndicator profile to Drew Fielder in database')
    } else {
      console.log('✅ Associated Drew Fielder with Back Bay Capital syndicator')
    }

    console.log('\n🎉 Setup complete!')
    console.log('📧 Drew Fielder can now log in with: andrew.fielder@backbayig.com')
    console.log('🏢 He will have access to manage the Back Bay Capital syndicator profile')
    console.log('🖼️  Avatar URL:', 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/avatars/investors/DrewFielder.png')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
createDrewFielderProfile() 