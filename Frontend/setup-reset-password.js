#!/usr/bin/env node

/**
 * 🔐 Reset Password Setup Script
 *
 * This script helps you set up the reset password feature for your Agrisol app.
 * Run this script to get step-by-step instructions.
 */

const fs = require('fs');
const path = require('path');

console.log(`
🔐 AGRI-SOL RESET PASSWORD SETUP
================================

This script will help you configure the reset password feature.

📋 PREREQUISITES:
- Supabase project created
- Supabase URL and anon key ready
- Email provider configured (optional)

🚀 LET'S GET STARTED!
`);

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file found');

  // Read and check current config
  const envContent = fs.readFileSync(envPath, 'utf8');

  if (envContent.includes('your_supabase_url_here')) {
    console.log('❌ Supabase URL not configured');
    console.log('\n📝 Please update your .env file with:');
    console.log('EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
    console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
  } else {
    console.log('✅ Supabase configuration appears to be set');
  }
} else {
  console.log('❌ .env file not found');
  console.log('\n📝 Creating .env file...');

  const envTemplate = `# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Admin Configuration
EXPO_PUBLIC_ADMIN_EMAIL=d.nkurunziz@alustudent.com

# ML Service Configuration (existing)
EXPO_PUBLIC_ML_API_URL=http://localhost:5000
EXPO_PUBLIC_ML_API_KEY=your_ml_api_key_here
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created');
  console.log(
    '📝 Please update the Supabase URL and anon key in the .env file',
  );
}

console.log(`
📋 NEXT STEPS:
==============

1. 🔧 Configure Supabase:
   - Go to your Supabase Dashboard
   - Copy your Project URL and anon key
   - Update the .env file with these values

2. 📧 Set up Email Templates:
   - Go to Supabase Dashboard → Authentication → Email Templates
   - Click on "Password Reset"
   - Copy the content from: Frontend/email-templates/password-reset-simple.html
   - Paste it into the Supabase template editor

3. 🔗 Configure Redirect URLs:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add these URLs to the redirect list:
     * exp://localhost:8081 (for development)
     * agrisol://auth/callback (for your app)

4. 🧪 Test the Feature:
   - Start your app: npx expo start
   - Go to Sign In → Forgot Password
   - Enter your email and test the reset flow

📚 For detailed instructions, see: Frontend/RESET_PASSWORD_SETUP.md

🎉 Your reset password feature should work after completing these steps!
`);

// Check if the forgot password screen exists
const forgotPasswordPath = path.join(
  __dirname,
  'app',
  '(auth)',
  'forgot-password.tsx',
);
if (fs.existsSync(forgotPasswordPath)) {
  console.log('✅ Forgot password screen found');
} else {
  console.log('❌ Forgot password screen not found');
}

// Check if email templates exist
const emailTemplatesPath = path.join(__dirname, 'email-templates');
if (fs.existsSync(emailTemplatesPath)) {
  console.log('✅ Email templates directory found');
  const templates = fs.readdirSync(emailTemplatesPath);
  const passwordResetTemplates = templates.filter((t) =>
    t.includes('password-reset'),
  );
  console.log(
    `📧 Found ${passwordResetTemplates.length} password reset email templates`,
  );
} else {
  console.log('❌ Email templates directory not found');
}

console.log(`
🔍 TROUBLESHOOTING:
==================

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs → Auth
2. Verify email settings: Authentication → Email Templates
3. Test SMTP connection: Settings → Auth → SMTP Settings
4. Restart development server: npx expo start --clear

📞 Need help? Check the detailed guide in RESET_PASSWORD_SETUP.md
`);
