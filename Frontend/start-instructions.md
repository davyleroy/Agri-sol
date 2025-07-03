# 🚀 AgriSol Frontend Setup Instructions

## Quick Start Guide

Follow these steps to get your Expo app running:

### 1. **Start the Backend API First**

```bash
# In a new terminal, navigate to Backend folder
cd Backend
python app.py
```

The API should start on `http://localhost:5000`

### 2. **Install Dependencies**

```bash
# In Frontend folder
npm install
```

### 3. **Fix Any Package Issues**

```bash
npx expo install --fix
```

### 4. **Start the Expo Development Server**

```bash
npm run dev
# or
npx expo start
```

### 5. **Choose Your Platform**

- Press **`w`** to open in web browser
- Press **`i`** to open iOS simulator (Mac only)
- Press **`a`** to open Android emulator
- Scan QR code with Expo Go app on your phone

## 🔧 Troubleshooting

### Common Issues & Solutions

#### **1. Package Version Conflicts**

```bash
npx expo install --fix
```

#### **2. Metro Bundler Issues**

```bash
npx expo start --clear
```

#### **3. Environment Variables Not Loading**

Make sure `.env.local` exists with:

```env
EXPO_PUBLIC_ML_API_URL=http://localhost:5000
EXPO_PUBLIC_ML_API_KEY=agrisol-api-key-2024
```

#### **4. Missing Images**

If you see image errors, create placeholder images:

- `assets/images/icon.png` (512x512)
- `assets/images/favicon.png` (32x32)

#### **5. API Connection Issues**

- Make sure Backend API is running on port 5000
- Check console for API connection logs
- Verify your device/emulator can reach localhost:5000

#### **6. Camera Permissions**

On physical devices, make sure to grant camera permissions when prompted.

## 📱 Testing the App

### **1. Test API Connection**

- Check the console logs for "🔧 ML Service Configuration"
- Look for successful API calls with "📡 Making request to..."

### **2. Test Disease Detection**

- Take a photo of a plant leaf
- Select the correct crop type (tomatoes, potatoes, or maize)
- Watch for prediction results

### **3. Check Treatment Recommendations**

- Verify comprehensive treatment advice is displayed
- Check that severity levels are correctly shown

## 🛠️ Development Tips

### **Hot Reload**

Changes to your code will automatically reload the app.

### **Debugging**

- Use `console.log()` statements
- Check the terminal for error messages
- Use React DevTools for debugging

### **Testing on Different Platforms**

- Web: Fastest for development
- Mobile: Better for testing camera functionality
- Simulator: Good middle ground

## 📋 Checklist Before Running

- [ ] Backend API is running on port 5000
- [ ] All npm packages are installed
- [ ] Environment variables are configured
- [ ] Image assets exist (or create placeholders)
- [ ] Camera permissions are granted (for mobile)

## 🆘 Still Having Issues?

If you're still having problems:

1. **Clear everything and start fresh:**

   ```bash
   npx expo start --clear
   ```

2. **Check the logs carefully** - they usually contain helpful error messages

3. **Verify your development environment:**

   - Node.js version 18 or higher
   - npm/yarn installed
   - Expo CLI installed globally

4. **Test the Backend API separately:**
   ```bash
   cd Backend
   python test_api.py
   ```

## 📞 Need Help?

Check the console output for detailed error messages. Most issues are related to:

- Package version conflicts
- Missing environment variables
- API connectivity issues
- Image asset problems

**Happy coding! 🌱**
