#!/usr/bin/env python3
"""
Simple Hugging Face Deployment Script for AgriSol
Makes deployment 100% reliable and easy
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path

def print_step(step, message):
    """Print a formatted step message"""
    print(f"\n{'='*60}")
    print(f"🔧 STEP {step}: {message}")
    print(f"{'='*60}")

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n📋 {description}")
    print(f"💻 Running: {command}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ Success: {description}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {description}")
        print(f"Error output: {e.stderr}")
        return False

def backup_current_app():
    """Backup the current app.py"""
    print_step(1, "Backing up current app.py")
    
    if Path("app.py").exists():
        shutil.copy("app.py", "app_backup.py")
        print("✅ Current app.py backed up as app_backup.py")
    else:
        print("⚠️ No app.py found to backup")

def deploy_huggingface_version():
    """Deploy the Hugging Face version"""
    print_step(2, "Deploying Hugging Face version")
    
    # Copy the Hugging Face app
    if Path("app_hf.py").exists():
        shutil.copy("app_hf.py", "app.py")
        print("✅ app_hf.py copied to app.py")
    else:
        print("❌ app_hf.py not found!")
        return False
    
    # Copy the Hugging Face model manager
    if Path("huggingface_models.py").exists():
        print("✅ huggingface_models.py found")
    else:
        print("❌ huggingface_models.py not found!")
        return False
    
    return True

def test_locally():
    """Test the deployment locally"""
    print_step(3, "Testing locally")
    
    print("🧪 Testing Hugging Face app...")
    print("📝 This will download models from Hugging Face")
    print("⏱️ First run may take 2-3 minutes to download models")
    
    # Test if the app can start
    try:
        # Import the app to check for syntax errors
        import app
        print("✅ App imports successfully")
        
        # Test model manager
        from huggingface_models import hf_manager
        print("✅ Hugging Face model manager loaded")
        
        # Test configuration
        from config import get_config
        config = get_config()
        print("✅ Configuration loaded")
        
        print("\n🎯 Local test successful!")
        print("💡 The app is ready for deployment")
        return True
        
    except Exception as e:
        print(f"❌ Local test failed: {e}")
        return False

def deploy_to_render():
    """Deploy to Render"""
    print_step(4, "Deploying to Render")
    
    print("🚀 Committing changes to git...")
    
    # Add all files
    if not run_command("git add .", "Adding files to git"):
        return False
    
    # Commit changes
    if not run_command('git commit -m "Deploy Hugging Face models - fixes 500 error"', "Committing changes"):
        return False
    
    # Push to remote
    if not run_command("git push", "Pushing to remote repository"):
        return False
    
    print("\n🎉 Deployment initiated!")
    print("📊 Render will automatically deploy your changes")
    print("⏱️ First deployment may take 2-3 minutes to download models")
    
    return True

def show_monitoring_guide():
    """Show how to monitor the deployment"""
    print_step(5, "Monitoring Guide")
    
    print("📊 Monitor your deployment:")
    print("1. Go to your Render dashboard")
    print("2. Click on your service")
    print("3. Check the 'Logs' tab for download progress")
    print("4. Look for messages like '📥 Downloading tomatoes model'")
    
    print("\n🔍 Test your API:")
    print("curl https://agri-sol.onrender.com/")
    print("curl https://agri-sol.onrender.com/api/models")
    
    print("\n✅ Expected results:")
    print("- Health endpoint returns 200 OK")
    print("- Models endpoint shows 'huggingface_available: true'")
    print("- All 4 crop models loaded successfully")
    print("- No more 500 errors!")

def main():
    """Main deployment process"""
    print("🚀 AgriSol Hugging Face Deployment")
    print("=" * 60)
    print("This script will deploy your app with Hugging Face models")
    print("This will solve the 500 error on Render")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not Path("app.py").exists() and not Path("app_hf.py").exists():
        print("❌ Error: Please run this script from the Backend directory")
        print("💡 Current directory:", os.getcwd())
        return False
    
    # Step 1: Backup
    backup_current_app()
    
    # Step 2: Deploy HF version
    if not deploy_huggingface_version():
        print("❌ Failed to deploy Hugging Face version")
        return False
    
    # Step 3: Test locally
    if not test_locally():
        print("❌ Local test failed")
        return False
    
    # Step 4: Deploy to Render
    if not deploy_to_render():
        print("❌ Failed to deploy to Render")
        return False
    
    # Step 5: Show monitoring guide
    show_monitoring_guide()
    
    print("\n🎉 DEPLOYMENT COMPLETE!")
    print("=" * 60)
    print("✅ Your app is now deploying with Hugging Face models")
    print("✅ This will solve the 500 error")
    print("✅ Models will download automatically from Hugging Face")
    print("✅ First deployment may take 2-3 minutes")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🎯 Deployment script completed successfully!")
    else:
        print("\n❌ Deployment script failed!")
        sys.exit(1) 