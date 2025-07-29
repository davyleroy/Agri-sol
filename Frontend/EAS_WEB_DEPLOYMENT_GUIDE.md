# 🌐 EAS Web Deployment Guide for Agrisol

This guide will help you deploy your Agrisol web app using EAS (Expo Application Services).

## 📋 Prerequisites

1. **EAS CLI installed:**

   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Logged into Expo:**

   ```bash
   eas login
   ```

3. **Project configured:**
   - Your project is already configured with EAS project ID: `0f83e1d2-ed15-4dd4-8fb7-87f7ea7e0f25`
   - Owner: `davyleroy`

## 🚀 Quick Deployment Steps

### 1. **Navigate to Frontend Directory**

```bash
cd Frontend
```

### 2. **Install Dependencies** (if not already done)

```bash
npm install
```

### 3. **Configure EAS Build** (First time only)

```bash
eas build:configure
```

### 4. **Build for Web - Preview**

```bash
npm run eas:build:web:preview
```

### 5. **Build for Web - Production**

```bash
npm run eas:build:web:production
```

## 📦 Build Profiles

### **Preview Build**

- **Purpose**: Testing and development
- **Command**: `npm run eas:build:web:preview`
- **Environment**: Preview
- **Distribution**: Internal

### **Production Build**

- **Purpose**: Live deployment
- **Command**: `npm run eas:build:web:production`
- **Environment**: Production
- **Distribution**: Public

## 🔧 Configuration Files

### **eas.json**

```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "preview"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "production"
      }
    }
  },
  "submit": {
    "production": {}
  },
  "preview": {
    "distribution": "internal"
  }
}
```

### **app.json Updates**

- Added web build configuration
- Included babel configuration for vector icons
- Maintained existing project settings

## 🌐 Web-Specific Features

### **Flag Display Fix**

- Enhanced language selector for web
- Fallback system for emoji flags
- Platform-specific styling

### **Global CSS**

- Better emoji support
- Responsive design
- Cross-browser compatibility

### **Webpack Configuration**

- Global CSS inclusion
- Optimized for web deployment

## 📱 Build Commands

| Command                            | Description       | Use Case            |
| ---------------------------------- | ----------------- | ------------------- |
| `npm run eas:build:web`            | Default web build | General testing     |
| `npm run eas:build:web:preview`    | Preview build     | Development testing |
| `npm run eas:build:web:production` | Production build  | Live deployment     |
| `npm run build:web`                | Local web export  | Local testing       |

## 🔍 Monitoring Builds

### **Check Build Status**

```bash
eas build:list
```

### **View Build Logs**

```bash
eas build:view [BUILD_ID]
```

### **Download Build**

```bash
eas build:download [BUILD_ID]
```

## 🌍 Deployment Options

### **1. EAS Hosting (Recommended)**

- Automatic deployment
- CDN distribution
- SSL certificates
- Custom domains

### **2. Manual Deployment**

- Download build artifacts
- Deploy to your own hosting
- Configure custom domain

### **3. Preview Deployment**

- Internal testing
- Team access
- Development feedback

## ⚙️ Environment Variables

### **Preview Environment**

```env
EXPO_PUBLIC_ENVIRONMENT=preview
```

### **Production Environment**

```env
EXPO_PUBLIC_ENVIRONMENT=production
```

## 🔐 Security Considerations

### **API Keys**

- Store in environment variables
- Use EAS secrets for sensitive data
- Never commit keys to repository

### **Supabase Configuration**

- Ensure proper CORS settings
- Configure production URLs
- Set up proper authentication

## 📊 Performance Optimization

### **Web Build Optimizations**

- Code splitting
- Tree shaking
- Asset optimization
- Bundle analysis

### **CDN Benefits**

- Global distribution
- Faster loading times
- Reduced server load
- Automatic scaling

## 🚨 Troubleshooting

### **Common Issues**

1. **Build Fails**

   ```bash
   # Check logs
   eas build:view [BUILD_ID]

   # Rebuild
   eas build --platform web --clear-cache
   ```

2. **Dependencies Missing**

   ```bash
   # Install missing dependencies
   npm install

   # Clear cache
   npm start -- --clear
   ```

3. **Webpack Issues**
   ```bash
   # Clear webpack cache
   rm -rf node_modules/.cache
   npm start -- --clear
   ```

### **Debug Commands**

```bash
# Check EAS status
eas whoami

# Verify project configuration
eas project:info

# List all builds
eas build:list

# View specific build
eas build:view [BUILD_ID]
```

## 📈 Analytics & Monitoring

### **Build Analytics**

- Build success rates
- Build times
- Error tracking
- Performance metrics

### **Web Analytics**

- User engagement
- Page views
- Performance monitoring
- Error tracking

## 🔄 Continuous Deployment

### **Automated Workflow**

1. Push to main branch
2. Trigger EAS build
3. Automatic deployment
4. Health checks

### **Manual Workflow**

1. Local testing
2. Preview build
3. Production build
4. Manual deployment

## 📞 Support

### **EAS Support**

- [EAS Documentation](https://docs.expo.dev/eas/)
- [EAS Build Troubleshooting](https://docs.expo.dev/build-reference/troubleshooting/)
- [Expo Discord](https://chat.expo.dev/)

### **Project Support**

- Check build logs
- Review configuration
- Test locally first
- Use preview builds

## 🎯 Next Steps

1. **First Deployment**

   ```bash
   npm run eas:build:web:preview
   ```

2. **Production Deployment**

   ```bash
   npm run eas:build:web:production
   ```

3. **Custom Domain** (Optional)
   - Configure in EAS dashboard
   - Update DNS settings
   - SSL certificate setup

4. **Monitoring Setup**
   - Analytics integration
   - Error tracking
   - Performance monitoring

---

**Ready to deploy? Start with:**

```bash
cd Frontend
npm run eas:build:web:preview
```
