# Quick Start Deployment Scripts

## 1. Test Locally First

### Test Flask API Locally

```powershell
# Navigate to deployment folder
cd deployment

# Install dependencies
pip install -r requirements.txt

# Copy your model files to deployment folder
Copy-Item "..\Notebook\*.h5" . -ErrorAction SilentlyContinue
Copy-Item "..\Notebook\*.keras" . -ErrorAction SilentlyContinue

# Run Flask API
python flask_api.py
```

### Test Hugging Face App Locally

```powershell
# Copy model files
Copy-Item "..\Notebook\*.h5" . -ErrorAction SilentlyContinue
Copy-Item "..\Notebook\*.keras" . -ErrorAction SilentlyContinue

# Run Gradio app
python huggingface_app.py
```

## 2. Deploy to Hugging Face Spaces (Recommended for Beginners)

### Step 1: Create Hugging Face Account

1. Go to [huggingface.co](https://huggingface.co)
2. Create account and verify email

### Step 2: Create New Space

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces)
2. Click "Create new Space"
3. Name: `agri-sol-detector`
4. SDK: `Gradio`
5. Make it Public (free)

### Step 3: Upload Files

```powershell
# Install git-lfs if not already installed
git lfs install

# Clone your space
git clone https://huggingface.co/spaces/YOUR_USERNAME/agri-sol-detector
cd agri-sol-detector

# Copy files
Copy-Item "..\deployment\huggingface_app.py" "app.py"
Copy-Item "..\deployment\requirements.txt" .
Copy-Item "..\Notebook\*.h5" . -ErrorAction SilentlyContinue
Copy-Item "..\Notebook\*.keras" . -ErrorAction SilentlyContinue

# Add and push
git add .
git commit -m "Initial deployment"
git push
```

### Step 4: Access Your App

- Your app will be available at: `https://YOUR_USERNAME-agri-sol-detector.hf.space`

## 3. Deploy to Render.com

### Step 1: Prepare Repository

```powershell
# Create new git repository
git init
git add .
git commit -m "Initial commit"

# Push to GitHub (create repo first on github.com)
git remote add origin https://github.com/YOUR_USERNAME/agri-sol-api.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com)
2. Connect GitHub account
3. Click "New +" → "Web Service"
4. Connect your repository
5. Settings:
   - **Name**: `agri-sol-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python flask_api.py`
   - **Instance Type**: `Free`

### Step 3: Environment Variables (if needed)

- `DEBUG=False`
- `PORT=5000`

## 4. Deploy to Railway

### Step 1: Install Railway CLI

```powershell
npm install -g @railway/cli
```

### Step 2: Deploy

```powershell
# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Set start command
railway run python flask_api.py
```

## 5. Quick Test Your API

### Test Health Endpoint

```powershell
# Replace URL with your deployed API
curl https://your-api-url.com/

# Or use PowerShell
Invoke-RestMethod -Uri "https://your-api-url.com/" -Method GET
```

### Test Prediction Endpoint

```javascript
// Test in browser console or Postman
const testImage = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD..."; // Base64 image

fetch("https://your-api-url.com/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    image: testImage,
    crop_type: "tomato",
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

## 6. Update Your React App

### Update API Endpoint

```javascript
// In your React app, update the API endpoint
const API_ENDPOINT = "https://your-deployed-api-url.com/predict";
```

### Use the Hook

```javascript
import { useDiseaseDetection } from "./path/to/react-integration";

function MyComponent() {
  const { predictDisease, loading, result, error } = useDiseaseDetection();

  // Your component logic here
}
```

## 🚨 Troubleshooting

### Common Issues:

1. **Model Loading Errors**

   ```powershell
   # Check if model files exist
   ls *.h5
   ls *.keras

   # Check file sizes (should be reasonable)
   dir *.h5
   ```

2. **CORS Issues**
   - Make sure `flask-cors` is installed
   - Check CORS settings in `flask_api.py`

3. **Memory Issues**
   - Use smaller models or optimize them
   - Consider using TensorFlow Lite

4. **Cold Start Issues**
   - Free tiers often have cold starts
   - Consider paid tiers for production

### Model Size Optimization

```python
# Convert to TensorFlow Lite for smaller size
import tensorflow as tf

converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

with open('model.tflite', 'wb') as f:
    f.write(tflite_model)
```

## 🎯 Recommended Deployment Order

1. **Start with Hugging Face Spaces** - Easiest to set up
2. **Move to Render.com** - Better for production APIs
3. **Consider Railway or Google Cloud Run** - More advanced features

Choose based on your needs:

- **Demo/Prototype**: Hugging Face Spaces
- **Production API**: Render.com or Railway
- **High Traffic**: Google Cloud Run or AWS
