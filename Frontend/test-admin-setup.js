// Test script to verify admin setup
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'YOUR_SUPABASE_URL_HERE'; // Replace with your actual URL
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE'; // Replace with your actual anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminSetup() {
  console.log('🧪 Testing Admin Setup...\n');

  try {
    // Test 1: Check if admin_users table exists and is accessible
    console.log('1️⃣ Testing admin_users table access...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1);

    if (adminError) {
      console.log('❌ Admin users table error:', adminError.message);
      if (adminError.message.includes('infinite recursion')) {
        console.log('🔥 URGENT: You still have the infinite recursion error!');
        console.log(
          '   Run the EMERGENCY FIX from FIXED_SUPABASE_SETUP.md immediately!',
        );
      }
    } else {
      console.log('✅ Admin users table accessible');
      console.log('   Found', adminUsers?.length || 0, 'admin users');
    }

    // Test 2: Check profiles table
    console.log('\n2️⃣ Testing profiles table access...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profileError) {
      console.log('❌ Profiles table error:', profileError.message);
    } else {
      console.log('✅ Profiles table accessible');
      console.log('   Found', profiles?.length || 0, 'profiles');
    }

    // Test 3: Check if your specific admin user exists
    console.log('\n3️⃣ Checking for admin user: d.nkurunziz@alustudent.com');
    const { data: specificAdmin, error: specificError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'd.nkurunziz@alustudent.com');

    if (specificError) {
      console.log('❌ Error checking specific admin:', specificError.message);
    } else if (specificAdmin && specificAdmin.length > 0) {
      console.log('✅ Admin user found!', specificAdmin[0]);
    } else {
      console.log('❌ Admin user NOT found');
      console.log(
        '   You need to run the admin creation SQL from FIXED_SUPABASE_SETUP.md',
      );
    }

    console.log('\n🎯 Summary:');
    console.log(
      '- If you see infinite recursion errors: Run the EMERGENCY FIX',
    );
    console.log('- If admin user not found: Run the admin creation SQL');
    console.log(
      '- If tables are not accessible: Check your Supabase credentials',
    );
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('   Check your Supabase URL and API key in this script');
  }
}

// Check if running directly
if (require.main === module) {
  console.log(
    '⚠️  Please update the Supabase URL and API key at the top of this file first!',
  );
  console.log('   Then run: node test-admin-setup.js');

  if (
    supabaseUrl.includes('YOUR_SUPABASE') ||
    supabaseKey.includes('YOUR_SUPABASE')
  ) {
    console.log('❌ Please update the credentials first!');
  } else {
    testAdminSetup();
  }
}

module.exports = { testAdminSetup };
