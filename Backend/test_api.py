#!/usr/bin/env python3
"""
Test script for AgriSol Plant Disease Detection API
Run this script to test the API endpoints and functionality
"""

import requests
import json
import os
import time
from pathlib import Path

# Configuration
API_BASE_URL = "http://localhost:5000"
TEST_IMAGE_PATH = "test_image.jpg"  # You can place a test image here

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed!")
            print(f"   Status: {data.get('status')}")
            print(f"   Models loaded: {data.get('models_loaded', [])}")
            print(f"   Message: {data.get('message')}")
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_models_endpoint():
    """Test the models information endpoint"""
    print("\n🔍 Testing models information endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/api/models")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Models endpoint passed!")
            print(f"   Total models: {data.get('total_models')}")
            
            for crop_type, info in data.get('models', {}).items():
                print(f"   {crop_type.title()}:")
                print(f"     - Loaded: {info.get('loaded')}")
                print(f"     - Classes: {len(info.get('classes', []))}")
                print(f"     - Endpoint: {info.get('endpoint')}")
            return True
        else:
            print(f"❌ Models endpoint failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Models endpoint failed: {e}")
        return False

def test_prediction_endpoint(crop_type="tomatoes", image_path=None):
    """Test the prediction endpoint with a sample image"""
    print(f"\n🔍 Testing prediction endpoint for {crop_type}...")
    
    if image_path and os.path.exists(image_path):
        try:
            with open(image_path, 'rb') as image_file:
                files = {'image': image_file}
                
                start_time = time.time()
                response = requests.post(
                    f"{API_BASE_URL}/api/ml/{crop_type}",
                    files=files
                )
                processing_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    print("✅ Prediction endpoint passed!")
                    print(f"   Processing time: {processing_time:.2f} seconds")
                    print(f"   Predicted class: {data.get('predicted_class')}")
                    print(f"   Confidence: {data.get('confidence_percentage')}%")
                    print(f"   Severity: {data.get('severity')}")
                    print(f"   Treatment urgency: {data.get('treatment_urgency')}")
                    print(f"   Estimated recovery: {data.get('estimated_recovery')}")
                    
                    # Show top 3 predictions
                    all_predictions = data.get('all_predictions', {})
                    sorted_predictions = sorted(all_predictions.items(), key=lambda x: x[1], reverse=True)
                    print("   Top 3 predictions:")
                    for i, (disease, confidence) in enumerate(sorted_predictions[:3]):
                        print(f"     {i+1}. {disease}: {confidence:.3f}")
                    
                    return True
                else:
                    print(f"❌ Prediction failed with status {response.status_code}")
                    try:
                        error_data = response.json()
                        print(f"   Error: {error_data.get('error')}")
                    except:
                        print(f"   Response: {response.text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Prediction test failed: {e}")
            return False
    else:
        print(f"⚠️  Skipping prediction test - no test image found at {image_path}")
        return True

def test_error_handling():
    """Test error handling with invalid requests"""
    print("\n🔍 Testing error handling...")
    
    # Test invalid crop type
    try:
        response = requests.post(f"{API_BASE_URL}/api/ml/invalid_crop")
        if response.status_code == 400:
            print("✅ Invalid crop type handled correctly")
        else:
            print(f"❌ Invalid crop type not handled properly: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing invalid crop type: {e}")
    
    # Test missing image
    try:
        response = requests.post(f"{API_BASE_URL}/api/ml/tomatoes")
        if response.status_code == 400:
            print("✅ Missing image handled correctly")
        else:
            print(f"❌ Missing image not handled properly: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing missing image: {e}")

def create_sample_test_image():
    """Create a simple test image if none exists"""
    try:
        from PIL import Image
        import numpy as np
        
        # Create a simple green image (256x256)
        image_array = np.full((256, 256, 3), [34, 139, 34], dtype=np.uint8)  # Forest green
        image = Image.fromarray(image_array)
        image.save(TEST_IMAGE_PATH)
        print(f"✅ Created test image: {TEST_IMAGE_PATH}")
        return True
    except Exception as e:
        print(f"❌ Failed to create test image: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting AgriSol API Tests")
    print("=" * 50)
    
    # Check if API is running
    if not test_health_check():
        print("\n❌ API is not running. Please start the API server first:")
        print("   python app.py")
        return
    
    # Test models endpoint
    test_models_endpoint()
    
    # Create test image if it doesn't exist
    if not os.path.exists(TEST_IMAGE_PATH):
        print(f"\n📸 Creating sample test image...")
        create_sample_test_image()
    
    # Test prediction endpoints
    crop_types = ["tomatoes", "potatoes", "maize"]
    for crop_type in crop_types:
        test_prediction_endpoint(crop_type, TEST_IMAGE_PATH)
    
    # Test error handling
    test_error_handling()
    
    print("\n🎉 All tests completed!")
    print("=" * 50)
    
    # Cleanup
    if os.path.exists(TEST_IMAGE_PATH) and Path(TEST_IMAGE_PATH).stat().st_size < 1000:
        # Only delete if it's our created test image (small file)
        try:
            os.remove(TEST_IMAGE_PATH)
            print(f"🧹 Cleaned up test image: {TEST_IMAGE_PATH}")
        except:
            pass

if __name__ == "__main__":
    main() 