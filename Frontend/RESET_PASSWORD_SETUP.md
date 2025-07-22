# 🔐 Reset Password Feature Setup Guide

## 🎯 **Current Status**

✅ **Reset Password UI**: Already implemented in `forgot-password.tsx`  
✅ **Reset Password Logic**: Already implemented in `AuthContext.tsx`  
✅ **Email Templates**: Already created in `email-templates/`  
❌ **Supabase Configuration**: Needs to be set up  
❌ **Environment Variables**: Need to be configured

## 🚀 **Step-by-Step Setup**

### **Step 1: Create Supabase Project (if not done)**

1. Go to [supabase.com](https://supabase.com)
2. Sign in and create a new project
3. Note down your **Project URL** and **anon key**

### **Step 2: Configure Environment Variables**

Create a `.env` file in the `Frontend` directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# Admin Configuration
EXPO_PUBLIC_ADMIN_EMAIL=d.nkurunziz@alustudent.com

# ML Service Configuration (existing)
EXPO_PUBLIC_ML_API_URL=http://localhost:5000
EXPO_PUBLIC_ML_API_KEY=your_ml_api_key_here
```

### **Step 3: Configure Supabase Email Settings**

1. **Go to Supabase Dashboard** → **Authentication** → **Email Templates**
2. **Configure Password Reset Email**:

#### **Option A: Use Supabase Default Template**

- Go to **Authentication** → **Email Templates**
- Click on **"Password Reset"**
- Customize the template with your branding

#### **Option B: Use Custom Template (Recommended)**

- Copy the content from `Frontend/email-templates/password-reset-simple.html`
- Paste it into the Supabase email template editor
- Replace `{{ .ConfirmationURL }}` with `{{ .ConfirmationURL }}` (Supabase uses the same variable)

### **Step 4: Configure Email Provider**

1. **Go to Supabase Dashboard** → **Settings** → **Auth**
2. **Configure SMTP Settings** (if using custom email provider):
   - **SMTP Host**: Your email provider's SMTP server
   - **SMTP Port**: Usually 587 or 465
   - **SMTP User**: Your email address
   - **SMTP Pass**: Your email password or app password
   - **Sender Name**: "Agrisol Support"
   - **Sender Email**: "noreply@yourdomain.com"

### **Step 5: Test the Reset Password Feature**

1. **Start your app**:

   ```bash
   cd Frontend
   npx expo start
   ```

2. **Test the flow**:
   - Go to Sign In page
   - Click "Forgot Password?"
   - Enter your email address
   - Click "Send Reset Link"
   - Check your email for the reset link

## 🔧 **Troubleshooting Common Issues**

### **Issue 1: "Supabase URL not configured"**

**Solution**: Make sure your `.env` file has the correct Supabase URL:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
```

### **Issue 2: "Reset email not received"**

**Solutions**:

1. **Check Spam folder**
2. **Verify email provider settings in Supabase**
3. **Check Supabase logs**: Dashboard → Logs → Auth
4. **Test with a different email address**

### **Issue 3: "Reset link doesn't work"**

**Solutions**:

1. **Check URL redirect settings** in Supabase Dashboard → Authentication → URL Configuration
2. **Add your app's URL** to the redirect URLs list
3. **For development**: Add `exp://localhost:8081` to redirect URLs

### **Issue 4: "Environment variables not loading"**

**Solutions**:

1. **Restart the development server**: `npx expo start --clear`
2. **Check file location**: `.env` should be in the `Frontend` directory
3. **Verify variable names**: Must start with `EXPO_PUBLIC_`

## 📧 **Email Template Customization**

### **Using the Provided Template**

The `password-reset-simple.html` template includes:

- ✅ Professional design with security theme
- ✅ Clear instructions and warnings
- ✅ Mobile-responsive layout
- ✅ Security notices and contact information

### **Customizing the Template**

1. **Copy the template content**:

   ```bash
   cat Frontend/email-templates/password-reset-simple.html
   ```

2. **Paste into Supabase**:
   - Go to **Authentication** → **Email Templates**
   - Click **"Password Reset"**
   - Replace the content with your template

3. **Customize branding**:
   - Replace "Agrisol" with your app name
   - Update colors and logo
   - Modify contact information

## 🔒 **Security Best Practices**

### **Password Reset Security**

- ✅ **Link expiration**: 1 hour (configurable in Supabase)
- ✅ **One-time use**: Links expire after use
- ✅ **Secure tokens**: Supabase generates cryptographically secure tokens
- ✅ **Rate limiting**: Prevents abuse

### **Email Security**

- ✅ **HTTPS links only**: All confirmation URLs use HTTPS
- ✅ **Security warnings**: Template includes security notices
- ✅ **Contact information**: Users can report suspicious emails

## 🧪 **Testing Checklist**

### **Before Testing**

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Email templates set up
- [ ] SMTP settings configured
- [ ] App restarted with new config

### **Test Scenarios**

- [ ] **Valid email**: Reset link sent successfully
- [ ] **Invalid email**: Appropriate error message
- [ ] **Reset link**: Opens app and allows password change
- [ ] **Expired link**: Shows appropriate error
- [ ] **Used link**: Cannot be used twice

### **Email Testing**

- [ ] **Gmail**: Check desktop and mobile
- [ ] **Outlook**: Test in different clients
- [ ] **Apple Mail**: Test on iPhone and Mac
- [ ] **Spam folder**: Ensure not marked as spam

## 🚀 **Production Deployment**

### **Environment Variables for Production**

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
EXPO_PUBLIC_ADMIN_EMAIL=admin@yourdomain.com
```

### **Email Provider for Production**

- **Option 1**: Use Supabase's built-in email service
- **Option 2**: Configure custom SMTP (SendGrid, Mailgun, etc.)
- **Option 3**: Use your domain's email provider

### **URL Configuration for Production**

Add these to Supabase redirect URLs:

- `https://yourdomain.com/auth/callback`
- `https://yourdomain.com/reset-password`
- Your app's deep link URLs

## 📱 **Mobile App Deep Linking**

### **Configure Deep Links**

Add to your `app.json`:

```json
{
  "expo": {
    "scheme": "agrisol",
    "ios": {
      "bundleIdentifier": "com.agrisol.crophealth"
    },
    "android": {
      "package": "com.agrisol.crophealth"
    }
  }
}
```

### **Handle Reset Password Deep Links**

The reset password flow will automatically:

1. Open your app when the reset link is clicked
2. Navigate to the password reset screen
3. Allow the user to set a new password

## 🎉 **Expected Results**

After setup, users should be able to:

1. **Request password reset** from the forgot password screen
2. **Receive a professional email** with reset instructions
3. **Click the reset link** to open the app
4. **Set a new password** securely
5. **Login with the new password** immediately

## 🆘 **Getting Help**

### **If Reset Password Still Doesn't Work**

1. **Check Supabase logs**: Dashboard → Logs → Auth
2. **Verify email settings**: Authentication → Email Templates
3. **Test SMTP connection**: Settings → Auth → SMTP Settings
4. **Check environment variables**: Ensure `.env` file is correct
5. **Restart development server**: `npx expo start --clear`

### **Common Error Messages**

- **"Email not found"**: User doesn't exist in Supabase
- **"Invalid email format"**: Check email validation
- **"Rate limit exceeded"**: Wait before trying again
- **"SMTP error"**: Check email provider configuration

Your reset password feature should now work perfectly with Supabase! 🔐✨
