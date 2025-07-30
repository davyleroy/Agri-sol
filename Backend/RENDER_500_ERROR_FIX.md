# 🔧 Render 500 Error Fix Guide

## 🎯 **Problem Identified**

You're getting a **500 Internal Server Error** on your Render deployment at `https://agri-sol.onrender.com`. This is a server-side error that needs to be diagnosed and fixed.

## 🚨 **Common Causes of 500 Errors on Render**

### 1. **Missing Model Files** (Most Likely)

- Model files not uploaded to Render
- Incorrect file paths
- Large model files exceeding limits

### 2. **Missing Dependencies**

- Incomplete `requirements.txt`
- Version conflicts
- Missing system libraries

### 3. **Memory/Resource Limits**

- Models too large for Render's memory limits
- Timeout during model loading
- Insufficient CPU resources

### 4. **Configuration Issues**

- Environment variables not set
- Incorrect file permissions
- Path resolution problems

## 🧪 **Step-by-Step Diagnosis**

### **Step 1: Run the Diagnostic Script**

```bash
# In your local Backend directory
python render_debug.py
```

This will check:

- ✅ Environment variables
- ✅ Dependencies
- ✅ Model files
- ✅ Configuration
- ✅ Model loading
- ✅ App creation

### **Step 2: Test Simplified Version**

Replace your `app.py` with `app_simple.py` temporarily:

```bash
# Backup current app
cp app.py app_backup.py

# Use simplified version
cp app_simple.py app.py
```

This version works without ML models to test basic functionality.

### **Step 3: Check Render Logs**

1. Go to your Render dashboard
2. Click on your service
3. Go to "Logs" tab
4. Look for error messages

## 🔧 **Quick Fixes**

### **Fix 1: Use Simplified App (Immediate)**

```bash
# In your Backend directory
cp app_simple.py app.py
```

This will get your API running immediately with mock predictions.

### **Fix 2: Upload Model Files**

Ensure these files are in your repository:

```
Backend/
├── models/
│   ├── optimized_tomatoes_model.h5
│   ├── optimized_potatoes_model.h5
│   ├── optimized_maize_model.h5
│   └── optimized_beans_model.h5
└── Notebook/
    └── tomato_disease_best_model_fixed.h5
```

### **Fix 3: Update Requirements**

Make sure your `requirements.txt` includes:

```txt
flask==2.3.3
flask-cors==4.0.0
flask-restx==1.3.0
tensorflow==2.15.0
numpy==1.24.3
pillow==10.0.0
opencv-python==4.8.1.78
werkzeug==2.3.7
python-dotenv==1.0.0
```

### **Fix 4: Optimize Model Loading**

Add this to your `app.py` to handle missing models gracefully:

```python
def load_models():
    """Load models with graceful fallback"""
    global models, model_info, model_load_errors

    for crop_type in ['tomatoes', 'potatoes', 'maize', 'beans']:
        try:
            # Try to load model
            model = load_model_safely(primary_path, crop_type)
            if model is not None:
                models[crop_type] = model
                logger.info(f"✅ Loaded {crop_type} model")
            else:
                # Create fallback model
                models[crop_type] = create_fallback_model(crop_type)
                logger.warning(f"⚠️ Using fallback model for {crop_type}")
        except Exception as e:
            logger.error(f"❌ Failed to load {crop_type} model: {e}")
            models[crop_type] = create_fallback_model(crop_type)
```

## 📋 **Testing Checklist**

### **Before Deployment:**

- [ ] Run `python render_debug.py` locally
- [ ] Test with `python app_simple.py`
- [ ] Verify all model files exist
- [ ] Check `requirements.txt` is complete

### **After Deployment:**

- [ ] Check Render logs for errors
- [ ] Test health endpoint: `https://agri-sol.onrender.com/`
- [ ] Test models endpoint: `https://agri-sol.onrender.com/api/models`
- [ ] Test prediction endpoint with image

## 🚀 **Deployment Steps**

### **Option 1: Quick Fix (Recommended)**

1. Use `app_simple.py` for immediate deployment
2. Test all endpoints work
3. Gradually add model functionality

### **Option 2: Full Fix**

1. Upload all model files to repository
2. Optimize model sizes (use `.tflite` versions)
3. Update configuration for production
4. Deploy with proper error handling

## 📊 **Expected Results**

### **With Simplified App:**

- ✅ Health endpoint: `200 OK`
- ✅ Models endpoint: `200 OK` (mock data)
- ✅ Prediction endpoint: `200 OK` (mock predictions)
- ✅ Test interface: Working

### **With Full App:**

- ✅ All endpoints working
- ✅ Real ML predictions
- ✅ Model loading successful
- ✅ Error handling graceful

## 🔍 **Debugging Commands**

### **Local Testing:**

```bash
# Test simplified version
python app_simple.py

# Run diagnostics
python render_debug.py

# Test model loading
python -c "from app import load_models; load_models()"
```

### **Render Logs:**

```bash
# Check recent logs
# Look for these keywords:
# - "Error"
# - "Exception"
# - "Failed"
# - "ImportError"
# - "FileNotFound"
```

## 💡 **Pro Tips**

1. **Start Simple**: Use `app_simple.py` to get basic functionality working
2. **Check Logs**: Always check Render logs for specific error messages
3. **Gradual Enhancement**: Add features one by one after basic deployment works
4. **Model Optimization**: Use smaller models or `.tflite` versions for deployment
5. **Environment Variables**: Set proper environment variables in Render dashboard

## 🆘 **If Still Having Issues**

1. **Check Render Logs**: Look for specific error messages
2. **Test Locally**: Run the same code locally to isolate issues
3. **Use Simplified App**: Start with `app_simple.py` to verify deployment
4. **Contact Support**: If logs don't show the issue, contact Render support

The most likely cause is **missing model files** or **model loading failures**. Start with the simplified app to get your API running, then gradually add the ML functionality! 🚀
