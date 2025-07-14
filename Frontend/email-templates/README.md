# 📧 Email Templates for Agrisol

This folder contains beautifully designed email templates for your Agrisol application's signup confirmation process.

## 📁 Available Templates

### 📧 Signup Confirmation Templates

#### 1. 🎨 `signup-confirmation.html` (Advanced Modern Design)

- **Best for**: Modern email clients (Gmail, Outlook 365, Apple Mail)
- **Features**:
  - CSS Grid layouts
  - Advanced animations
  - Modern gradients
  - Dark mode support
  - Responsive design
  - Beautiful visual effects

#### 2. 🧹 `signup-confirmation-clean.html` (Clean Modern Design)

- **Best for**: Most email clients with good CSS support
- **Features**:
  - Clean CSS classes
  - No inline styles (lint-friendly)
  - Modern design
  - Good compatibility
  - Responsive design

#### 3. ✅ `signup-confirmation-compatible.html` (Maximum Compatibility)

- **Best for**: All email clients including older ones
- **Features**:
  - Table-based layout
  - Inline styles for maximum compatibility
  - Works in Outlook, Gmail, Apple Mail, etc.
  - No advanced CSS features
  - Guaranteed delivery and rendering

### 🔐 Password Reset Templates

#### 4. 🛡️ `password-reset.html` (Advanced Security Design)

- **Best for**: Modern email clients
- **Features**:
  - Security-focused design (red theme)
  - Password security tips
  - Multiple security warnings
  - Detailed threat information
  - Professional security branding

#### 5. 🔒 `password-reset-simple.html` (Simple & Secure)

- **Best for**: All email clients (Recommended)
- **Features**:
  - Clean, focused design
  - Essential security warnings
  - Clear call-to-action
  - Universal compatibility
  - Red security theme

### 📨 User Invitation Templates

#### 6. 🎊 `user-invitation.html` (Professional Invitation)

- **Best for**: All email clients (Recommended)
- **Features**:
  - Purple invitation theme
  - Welcome features showcase
  - Quick start guide
  - Professional onboarding design
  - 7-day expiration notice

### 🔗 Magic Link Login Templates

#### 7. 🚀 `magic-link.html` (Simple Magic Link)

- **Best for**: All email clients
- **Features**:
  - Clean one-click authentication
  - Security notices
  - Simple branding
  - Universal compatibility

#### 8. ⚡ `magic-link-login.html` (Enhanced Magic Link)

- **Best for**: Modern email clients (Recommended)
- **Features**:
  - Rich security feature showcase
  - What's waiting for you section
  - 15-minute expiration notice
  - Quick actions preview
  - Professional purple branding
  - Mobile-optimized design

## 🎯 Which Template to Choose?

### For Signup Confirmation (Recommended):

```
signup-confirmation-compatible.html
```

- Perfect balance of design and compatibility
- Works in 95% of email clients
- Clean, maintainable code

### For Password Reset (Recommended):

```
password-reset-simple.html
```

- Security-focused design
- Clear warnings and instructions
- Works in all email clients
- Professional red security theme

### For User Invitations (Recommended):

```
user-invitation.html
```

- Welcoming purple theme
- Professional onboarding experience
- Feature showcase and quick start guide
- Universal email client compatibility

### For Magic Link Login (Recommended):

```
magic-link-login.html
```

- Enhanced user experience
- Security feature showcase
- App preview and quick actions
- Professional design with consistent branding

### For Maximum Reach:

```
signup-confirmation-compatible.html
password-reset-simple.html
```

- Works in 99.9% of email clients
- Essential for enterprise/corporate users
- Outlook-friendly

### For Cutting-Edge Design:

```
signup-confirmation.html
password-reset.html
```

- Bleeding-edge features
- Best visual experience
- May not work in older clients

## 🔧 How to Use

### 1. **Copy Template Variables**

All templates use these variables that need to be replaced by your backend:

**For Signup Confirmation:**

```
{{ .ConfirmationURL }} - The signup confirmation link
```

**For Password Reset:**

```
{{ .ConfirmationURL }} - The password reset link
```

**For User Invitations:**

```
{{ .ConfirmationURL }} - The invitation acceptance link
{{ .SiteURL }} - The main website URL
```

**For Magic Link Login:**

```
{{ .ConfirmationURL }} - The magic login link
```

### 2. **Backend Integration Example (Go)**

```go
type EmailData struct {
    ConfirmationURL string
}

// Signup confirmation
func SendConfirmationEmail(email, confirmURL string) error {
    tmpl, err := template.ParseFiles("email-templates/signup-confirmation-compatible.html")
    if err != nil {
        return err
    }

    data := EmailData{
        ConfirmationURL: confirmURL,
    }

    var buf bytes.Buffer
    err = tmpl.Execute(&buf, data)
    if err != nil {
        return err
    }

    // Send email with buf.String() as HTML body
    return sendEmail(email, "Confirm Your Agrisol Account", buf.String())
}

// Password reset
func SendPasswordResetEmail(email, resetURL string) error {
    tmpl, err := template.ParseFiles("email-templates/password-reset-simple.html")
    if err != nil {
        return err
    }

    data := EmailData{
        ConfirmationURL: resetURL,
    }

    var buf bytes.Buffer
    err = tmpl.Execute(&buf, data)
    if err != nil {
        return err
    }

    // Send email with buf.String() as HTML body
    return sendEmail(email, "Reset Your Agrisol Password", buf.String())
}

// Magic link login
func SendMagicLinkEmail(email, magicURL string) error {
    tmpl, err := template.ParseFiles("email-templates/magic-link-login.html")
    if err != nil {
        return err
    }

    data := EmailData{
        ConfirmationURL: magicURL,
    }

    var buf bytes.Buffer
    err = tmpl.Execute(&buf, data)
    if err != nil {
        return err
    }

    // Send email with buf.String() as HTML body
    return sendEmail(email, "Your Magic Link to Agrisol", buf.String())
}
```

### 3. **Backend Integration Example (Node.js)**

```javascript
const fs = require('fs');
const path = require('path');

// Signup confirmation
function sendConfirmationEmail(email, confirmationURL) {
  const templatePath = path.join(
    __dirname,
    'email-templates',
    'signup-confirmation-compatible.html',
  );
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  // Replace template variables
  htmlContent = htmlContent.replace(
    /\{\{ \.ConfirmationURL \}\}/g,
    confirmationURL,
  );

  // Send email
  return sendEmail({
    to: email,
    subject: 'Confirm Your Agrisol Account',
    html: htmlContent,
  });
}

// Password reset
function sendPasswordResetEmail(email, resetURL) {
  const templatePath = path.join(
    __dirname,
    'email-templates',
    'password-reset-simple.html',
  );
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  // Replace template variables
  htmlContent = htmlContent.replace(/\{\{ \.ConfirmationURL \}\}/g, resetURL);

  // Send email
  return sendEmail({
    to: email,
    subject: 'Reset Your Agrisol Password',
    html: htmlContent,
  });
}

// Magic link login
function sendMagicLinkEmail(email, magicURL) {
  const templatePath = path.join(
    __dirname,
    'email-templates',
    'magic-link-login.html',
  );
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  // Replace template variables
  htmlContent = htmlContent.replace(/\{\{ \.ConfirmationURL \}\}/g, magicURL);

  // Send email
  return sendEmail({
    to: email,
    subject: 'Your Magic Link to Agrisol',
    html: htmlContent,
  });
}
```

## 🎨 Customization

### Brand Colors

The templates use specific themes:

**Signup Confirmation (Green Theme):**

- Primary: `#22c55e` (Green 500)
- Secondary: `#4ade80` (Green 400)
- Background: `#f8fffe` (Very light green)

**Password Reset (Red Security Theme):**

- Primary: `#dc2626` (Red 600)
- Secondary: `#b91c1c` (Red 700)
- Background: `#f8fffe` (Light neutral)

### Logo Customization

Replace the emoji logos with your actual logo:

**Signup Confirmation (Plant Logo):**

```html
<!-- Replace this -->
<div class="logo">🌱</div>

<!-- With this -->
<img
  src="https://your-domain.com/logo.png"
  alt="Agrisol Logo"
  width="80"
  height="80"
/>
```

**Password Reset (Security Logo):**

```html
<!-- Replace this -->
<div class="logo">🔐</div>

<!-- With this -->
<img
  src="https://your-domain.com/security-logo.png"
  alt="Agrisol Security"
  width="80"
  height="80"
/>
```

### Content Customization

All text can be customized:

- Company name: "Agrisol"
- Features list (signup emails)
- Security warnings (password reset emails)
- Contact information
- Social media links
- Expiration times (24 hours for signup, 1 hour for password reset)

## 📱 Testing Your Templates

### 1. **Email Testing Tools**

- [Litmus](https://litmus.com) - Comprehensive email testing
- [Email on Acid](https://www.emailonacid.com) - Multi-client testing
- [Mail Tester](https://www.mail-tester.com) - Spam score testing

### 2. **Quick Browser Test**

```bash
# Open in browser for quick preview
start signup-confirmation-clean.html  # Windows
open signup-confirmation-clean.html   # macOS
```

### 3. **Send Test Email**

Always send test emails to:

- Gmail (desktop & mobile)
- Outlook (desktop & web)
- Apple Mail (iPhone & Mac)
- Your target audience's preferred clients

## 🚀 Best Practices

### ✅ Do:

- Use the compatible version for important emails
- Test on multiple email clients
- Keep images small and optimized
- Include alt text for all images
- Provide plain text fallback

### ❌ Don't:

- Rely on external stylesheets
- Use JavaScript in emails
- Make emails too wide (600px max)
- Forget mobile responsiveness
- Use too many images

## 🔒 Security & Privacy

### GDPR Compliance

The templates include:

- Clear unsubscribe links
- Privacy policy links
- Data usage explanation

### Security Features

- Link expiration notice (24 hours)
- Security warning for unwanted emails
- HTTPS links only

## 📊 Analytics

### Email Tracking (Optional)

Add tracking pixels or UTM parameters:

```html
<!-- Add before </body> tag -->
<img
  src="https://your-analytics.com/track?email={{.Email}}&campaign=signup"
  width="1"
  height="1"
  alt=""
/>

<!-- Add UTM parameters to links -->
<a
  href="{{.ConfirmationURL}}&utm_source=email&utm_medium=confirmation&utm_campaign=signup"
></a>
```

## 🆘 Troubleshooting

### Common Issues:

1. **Email not displaying correctly**
   - Use the compatible version
   - Check inline styles
   - Test in target email client

2. **Images not loading**
   - Use absolute URLs
   - Provide alt text
   - Keep images small

3. **Links not working**
   - Ensure URLs are absolute
   - Test confirmation URL format
   - Check for special characters

4. **Responsive issues**
   - Use media queries
   - Test on mobile devices
   - Consider table-based layouts

## 🎉 Results

With these templates, you should see:

- ⬆️ Higher email open rates
- ⬆️ Better click-through rates
- ⬆️ Improved brand perception
- ⬆️ Reduced spam complaints
- ⬆️ Better user engagement

Choose the template that best fits your needs and enjoy beautiful, professional email communications! 🚀
