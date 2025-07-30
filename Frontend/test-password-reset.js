#!/usr/bin/env node

/**
 * 🔐 Password Reset Test Script
 * 
 * This script helps you test and verify your password reset setup.
 * Run this script to check if everything is configured correctly.
 */

const fs = require('fs');
const path = require('path');

console.log(`
🔐 AGRI-SOL PASSWORD RESET TEST
================================

This script will help you verify your password reset setup.

📋 CHECKING CONFIGURATION...
`);

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'EXPO_PUBLIC_APP_URL'
  ];
  
  let missingVars = [];
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length === 0) {
    console.log('✅ All required environment variables found');
  } else {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
  }
} else {
  console.log('❌ .env file not found');
}

// Check if reset password screen exists
const resetPasswordPath = path.join(__dirname, 'app', 'reset-password.tsx');
if (fs.existsSync(resetPasswordPath)) {
  console.log('✅ Reset password screen found');
} else {
  console.log('❌ Reset password screen not found');
}

// Check if forgot password screen exists
const forgotPasswordPath = path.join(__dirname, 'app', '(auth)', 'forgot-password.tsx');
if (fs.existsSync(forgotPasswordPath)) {
  console.log('✅ Forgot password screen found');
} else {
  console.log('❌ Forgot password screen not found');
}

// Check if reset password handler exists
const handlerPath = path.join(__dirname, 'utils', 'resetPasswordHandler.ts');
if (fs.existsSync(handlerPath)) {
  console.log('✅ Reset password handler found');
} else {
  console.log('❌ Reset password handler not found');
}

// Check if email templates exist
const emailTemplatesPath = path.join(__dirname, 'email-templates');
if (fs.existsSync(emailTemplatesPath)) {
  console.log('✅ Email templates directory found');
  const templates = fs.readdirSync(emailTemplatesPath);
  const passwordResetTemplates = templates.filter(t => 
    t.includes('password-reset')
  );
  console.log(`📧 Found ${passwordResetTemplates.length} password reset email templates`);
} else {
  console.log('❌ Email templates directory not found');
}

console.log(`
🧪 TESTING INSTRUCTIONS:
========================

1. 🔧 Configure Supabase:
   - Go to your Supabase Dashboard
   - Authentication → Email Templates → Password Reset
   - Replace with the template from PASSWORD_RESET_COMPLETE_SETUP.md

2. 🔗 Configure URL Redirects:
   - Go to Authentication → URL Configuration
   - Add these URLs:
     * agrisol://reset-password
     * agrisol://auth/callback
     * exp://localhost:8081/reset-password
     * exp://localhost:8081/auth/callback

3. 🚀 Start your app:
   - cd Frontend
   - npx expo start

4. 🧪 Test the flow:
   - Go to Sign In → Forgot Password
   - Enter your email
   - Click "Send Reset Link"
   - Check your email
   - Click the reset link
   - Set a new password
   - Login with new password

📚 For detailed setup instructions, see: PASSWORD_RESET_COMPLETE_SETUP.md

🎉 Your password reset feature should work after completing these steps!
`);

// Check if the setup guide exists
const setupGuidePath = path.join(__dirname, 'PASSWORD_RESET_COMPLETE_SETUP.md');
if (fs.existsSync(setupGuidePath)) {
  console.log('✅ Complete setup guide found');
} else {
  console.log('❌ Complete setup guide not found');
}

console.log(`
🔍 TROUBLESHOOTING TIPS:
========================

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs → Auth
2. Verify email settings: Authentication → Email Templates
3. Test SMTP connection: Settings → Auth → SMTP Settings
4. Restart development server: npx expo start --clear
5. Check environment variables: Ensure .env file is correct

📞 Need help? Check the detailed guide in PASSWORD_RESET_COMPLETE_SETUP.md
`); 