# 🚀 START TESTING HERE - AgriSol Backend

## Quick Start (Choose Your Platform)

### Option 1: Simple Python Test (Recommended)

```bash
cd Backend
python simple_test.py
```

### Option 2: Windows Users

```bash
cd Backend
quick_test.bat
```

### Option 3: Linux/Mac Users

```bash
cd Backend
chmod +x quick_test.sh
./quick_test.sh
```

### Option 4: Comprehensive Testing

```bash
cd Backend
python run_all_tests.py
```

## What Each Test Does

### 🔍 Simple Test (`simple_test.py`)

- ✅ **Python Environment** - Version, virtual environment
- ✅ **Dependencies** - All required packages
- ✅ **Configuration** - Backend settings
- ✅ **ML Models** - Model loading and availability
- ✅ **Basic Tests** - Existing test scripts
- ✅ **Server Startup** - Flask server functionality

### 🧪 Comprehensive Test (`run_all_tests.py`)

- Everything from Simple Test PLUS:
- 🌐 **API Endpoints** - Full HTTP testing
- 🗄️ **Database** - Supabase connectivity
- 📊 **Performance** - Response time benchmarks
- 🔒 **Security** - CORS, error handling
- 📋 **Detailed Reports** - JSON output

## Expected Results

### ✅ Success Indicators

- All models loaded (at least 1 out of 4 crops)
- Dependencies installed
- Configuration valid
- Server starts successfully
- Basic API responses working

### ⚠️ Common Issues & Solutions

**Issue: Models not loading**

```bash
# Check if model files exist
ls -la ../Notebook/*.h5 ../Notebook/*.keras
# Copy models to correct location if needed
```

**Issue: Dependencies missing**

```bash
# Install missing packages
pip install -r requirements.txt
# Or install individually
pip install flask tensorflow numpy pillow opencv-python
```

**Issue: Server won't start**

```bash
# Check if port 5000 is available
netstat -an | grep 5000
# Kill any existing process
taskkill /f /im python.exe  # Windows
pkill -f python             # Linux/Mac
```

**Issue: Database connection fails**

```bash
# Set environment variables
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_KEY="your-key"
```

## Testing Your Changes

### After Code Changes

```bash
# Quick validation
python simple_test.py

# Full validation
python run_all_tests.py
```

### Before Deployment

```bash
# Run comprehensive tests
python run_all_tests.py

# Check test report
cat test_report.json
```

## Manual Testing

### 1. Start Server

```bash
python run.py
```

### 2. Test URLs

- **Health Check**: http://localhost:5000/
- **API Documentation**: http://localhost:5000/docs
- **Models Info**: http://localhost:5000/api/models
- **Test Interface**: http://localhost:5000/test

### 3. Test Disease Prediction

```bash
# Using curl
curl -X POST \
  -F "image=@your_plant_image.jpg" \
  http://localhost:5000/api/ml/tomatoes

# Using Python
import requests
files = {'image': open('plant_image.jpg', 'rb')}
response = requests.post('http://localhost:5000/api/ml/tomatoes', files=files)
print(response.json())
```

### 4. Test Location APIs

```bash
# Leaderboard
curl http://localhost:5000/api/location/leaderboard

# Disease tracking
curl http://localhost:5000/api/location/disease-tracking
```

## Integration Testing with Frontend

### 1. Start Backend

```bash
cd Backend
python run.py
```

### 2. Start Frontend (New Terminal)

```bash
cd Frontend
npm start
```

### 3. Test Full Flow

- Sign up/login
- Scan plant image
- View results
- Check admin dashboard (if admin user)

## Troubleshooting

### Check Logs

```bash
# Backend logs
tail -f Backend/app.log

# Frontend logs
cd Frontend && npm run dev
```

### Reset Everything

```bash
# Backend
cd Backend
rm -rf __pycache__ *.pyc
pip install -r requirements.txt

# Frontend
cd Frontend
rm -rf node_modules package-lock.json
npm install
```

## Get Help

### 1. Check Documentation

- `COMPREHENSIVE_BACKEND_TESTING.md` - Detailed guide
- `TESTING_GUIDE.md` - Frontend testing
- `PROJECT_SUMMARY.md` - What's been built

### 2. Review Test Results

- `test_report.json` - Detailed test results
- Console output - Real-time feedback

### 3. Common Commands

```bash
# Check Python version
python --version

# Check installed packages
pip list

# Check server status
curl http://localhost:5000/

# Check port usage
netstat -an | grep 5000
```

## Success! 🎉

When tests pass, you'll see:

- ✅ All major components working
- 🚀 Server starts successfully
- 📱 API endpoints responding
- 🧠 ML models loaded
- 📊 Test success rate > 80%

**Now you're ready to:**

1. Continue development
2. Deploy to production
3. Add new features
4. Test with real data

---

**Need more help?** Check the comprehensive guides or run the detailed tests for more information!
