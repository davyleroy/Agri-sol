# 📋 Terms & Conditions Integration Guide

## 🚀 Quick Integration

### 1. Import the Modal Component

Add this import to your signup screen:

```typescript
import TermsAndConditionsModal from '../components/TermsAndConditionsModal';
```

### 2. Add State Management

Add these state variables to your signup component:

```typescript
const [showTermsModal, setShowTermsModal] = useState(false);
const [termsAccepted, setTermsAccepted] = useState(false);
```

### 3. Add the Modal Component

Add this component to your JSX:

```typescript
<TermsAndConditionsModal
  visible={showTermsModal}
  onAccept={() => {
    setTermsAccepted(true);
    setShowTermsModal(false);
    // Continue with signup process
  }}
  onDecline={() => {
    setShowTermsModal(false);
    // Handle decline (e.g., exit app or show message)
  }}
/>
```

### 4. Trigger the Modal

Show the modal when user tries to sign up:

```typescript
const handleSignup = () => {
  if (!termsAccepted) {
    setShowTermsModal(true);
    return;
  }
  // Proceed with signup
};
```

## 📱 Complete Signup Integration Example

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import TermsAndConditionsModal from '../components/TermsAndConditionsModal';

export default function SignupScreen() {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    if (!termsAccepted) {
      setShowTermsModal(true);
      return;
    }

    // Proceed with signup logic
    console.log('Signing up with terms accepted');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Your signup form */}
      <TouchableOpacity onPress={handleSignup}>
        <Text>Sign Up</Text>
      </TouchableOpacity>

      {/* Terms Modal */}
      <TermsAndConditionsModal
        visible={showTermsModal}
        onAccept={() => {
          setTermsAccepted(true);
          setShowTermsModal(false);
          // Continue with signup
          handleSignup();
        }}
        onDecline={() => {
          setShowTermsModal(false);
          // Handle decline
          console.log('Terms declined');
        }}
      />
    </View>
  );
}
```

## 🔧 Customization Options

### 1. Custom Styling

You can customize the modal appearance by modifying the styles in `TermsAndConditionsModal.tsx`:

```typescript
// Example: Change colors
const customColors = {
  primary: '#22c55e',
  background: '#ffffff',
  text: '#1f2937',
  // ... other colors
};
```

### 2. Custom Content

Modify the content in the modal by editing the text in the component:

```typescript
// Example: Custom terms text
<Text style={styles.sectionText}>
  Your custom terms and conditions text here...
</Text>
```

### 3. Multi-Language Support

The modal already supports the language context. Add translations to your language files:

```typescript
// In your language context
const translations = {
  en: {
    'terms.title': 'Terms & Conditions',
    'privacy.title': 'Privacy Policy',
    // ... more translations
  },
  rw: {
    'terms.title': "Amabwiriza n'Ibibazo",
    'privacy.title': "Politiki y'Ibanga",
    // ... more translations
  },
};
```

## 📋 Legal Compliance Checklist

### ✅ Required Actions

1. **Review Legal Documents**
   - [ ] Have Privacy Policy reviewed by legal professional
   - [ ] Have Terms of Service reviewed by legal professional
   - [ ] Have Terms & Conditions reviewed by legal professional

2. **Update Contact Information**
   - [ ] Replace placeholder emails with real addresses
   - [ ] Add your business address
   - [ ] Add your contact phone number

3. **Customize for Jurisdiction**
   - [ ] Update governing law section
   - [ ] Add jurisdiction-specific requirements
   - [ ] Include local data protection regulations

4. **Implement Data Protection**
   - [ ] Set up data encryption
   - [ ] Implement access controls
   - [ ] Create data deletion procedures
   - [ ] Set up breach notification system

### ✅ Optional Enhancements

1. **User Experience**
   - [ ] Add "Remember my choice" option
   - [ ] Show terms version and last updated date
   - [ ] Add "View full terms" link to website
   - [ ] Implement terms update notifications

2. **Analytics**
   - [ ] Track terms acceptance rates
   - [ ] Monitor decline reasons
   - [ ] Analyze user engagement with terms

3. **Accessibility**
   - [ ] Add screen reader support
   - [ ] Ensure keyboard navigation
   - [ ] Test with accessibility tools

## 🚨 Important Notes

### Legal Requirements

- **Professional Review**: Always have legal documents reviewed by qualified attorneys
- **Jurisdiction**: Customize documents for your specific legal jurisdiction
- **Updates**: Keep documents updated as your service evolves
- **Compliance**: Ensure compliance with local data protection laws

### Technical Considerations

- **Version Control**: Track document versions and effective dates
- **User Consent**: Store user consent with timestamp and version
- **Data Retention**: Implement proper data retention policies
- **Security**: Ensure secure storage of user consent records

### User Experience

- **Clear Language**: Use simple, clear language in terms
- **Easy Access**: Make terms easily accessible in app settings
- **Contact Info**: Provide clear contact methods for legal inquiries
- **Multi-Language**: Translate terms for all supported languages

## 📞 Support

For questions about legal document implementation:

- **Legal Questions**: legal@agrisol.app
- **Technical Issues**: support@agrisol.app
- **Privacy Concerns**: privacy@agrisol.app

---

**Remember**: This guide provides technical implementation details. Always consult with legal professionals for proper legal compliance and document review.
