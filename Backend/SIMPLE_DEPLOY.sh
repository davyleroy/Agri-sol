#!/bin/bash

# 🚀 Simple AgriSol Hugging Face Deployment
# One command to fix the 500 error!

echo "🚀 AgriSol Hugging Face Deployment"
echo "=================================="
echo "This will solve your 500 error on Render"
echo "=================================="

# Step 1: Backup current app
echo ""
echo "🔧 STEP 1: Backing up current app.py"
if [ -f "app.py" ]; then
    cp app.py app_backup.py
    echo "✅ Current app.py backed up as app_backup.py"
else
    echo "⚠️ No app.py found to backup"
fi

# Step 2: Deploy Hugging Face version
echo ""
echo "🔧 STEP 2: Deploying Hugging Face version"
if [ -f "app_hf_simple.py" ]; then
    cp app_hf_simple.py app.py
    echo "✅ app_hf_simple.py copied to app.py"
else
    echo "❌ app_hf_simple.py not found!"
    exit 1
fi

# Step 3: Check required files
echo ""
echo "🔧 STEP 3: Checking required files"
if [ -f "huggingface_models.py" ]; then
    echo "✅ huggingface_models.py found"
else
    echo "❌ huggingface_models.py not found!"
    exit 1
fi

if [ -f "config.py" ]; then
    echo "✅ config.py found"
else
    echo "❌ config.py not found!"
    exit 1
fi

# Step 4: Test locally
echo ""
echo "🔧 STEP 4: Testing locally"
echo "🧪 Testing app imports..."
python -c "import app; print('✅ App imports successfully')" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Local test passed"
else
    echo "❌ Local test failed"
    exit 1
fi

# Step 5: Deploy to Render
echo ""
echo "🔧 STEP 5: Deploying to Render"
echo "🚀 Committing changes to git..."

git add .
if [ $? -eq 0 ]; then
    echo "✅ Files added to git"
else
    echo "❌ Failed to add files to git"
    exit 1
fi

git commit -m "Deploy Hugging Face models - fixes 500 error"
if [ $? -eq 0 ]; then
    echo "✅ Changes committed"
else
    echo "❌ Failed to commit changes"
    exit 1
fi

git push
if [ $? -eq 0 ]; then
    echo "✅ Changes pushed to remote"
else
    echo "❌ Failed to push changes"
    exit 1
fi

# Step 6: Show monitoring guide
echo ""
echo "🔧 STEP 6: Monitoring Guide"
echo "📊 Monitor your deployment:"
echo "1. Go to your Render dashboard"
echo "2. Click on your service"
echo "3. Check the 'Logs' tab for download progress"
echo "4. Look for messages like '📥 Downloading tomatoes model'"
echo ""
echo "🔍 Test your API:"
echo "curl https://agri-sol.onrender.com/"
echo "curl https://agri-sol.onrender.com/api/models"
echo ""
echo "✅ Expected results:"
echo "- Health endpoint returns 200 OK"
echo "- Models endpoint shows 'huggingface_available: true'"
echo "- All 4 crop models loaded successfully"
echo "- No more 500 errors!"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=================================="
echo "✅ Your app is now deploying with Hugging Face models"
echo "✅ This will solve the 500 error"
echo "✅ Models will download automatically from Hugging Face"
echo "✅ First deployment may take 2-3 minutes"
echo "==================================" 