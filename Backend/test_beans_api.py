#!/usr/bin/env python3
"""
Test script for the beans API endpoint
"""

import requests
import json
import os
from PIL import Image
import io

def test_beans_api():
    """Test the beans API endpoint"""
    
    # API endpoint
    url = "http://localhost:5000/api/ml/beans"
    
    # Check if server is running
    try:
        health_response = requests.get("http://localhost:5000/")
        print("✅ Server is running")
        print(f"Health check: {health_response.json()}")
    except Exception as e:
        print(f"❌ Server not running: {e}")
        return
    
    # Create a test image (simple green square to simulate a plant)
    test_image = Image.new('RGB', (256, 256), color='green')
    img_bytes = io.BytesIO()
    test_image.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    # Test the beans endpoint
    try:
        files = {'image': ('test_bean.jpg', img_bytes, 'image/jpeg')}
        response = requests.post(url, files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Beans API working!")
            print(f"Result: {json.dumps(result, indent=2)}")
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_all_endpoints():
    """Test all crop endpoints"""
    crops = ['beans', 'potatoes', 'maize', 'tomatoes']
    
    # Create a test image
    test_image = Image.new('RGB', (256, 256), color='green')
    img_bytes = io.BytesIO()
    test_image.save(img_bytes, format='JPEG')
    
    for crop in crops:
        img_bytes.seek(0)
        url = f"http://localhost:5000/api/ml/{crop}"
        
        try:
            files = {'image': (f'test_{crop}.jpg', img_bytes, 'image/jpeg')}
            response = requests.post(url, files=files)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ {crop.capitalize()} API working!")
                print(f"  Predicted: {result.get('predicted_class')}")
                print(f"  Confidence: {result.get('confidence_percentage')}%")
            else:
                print(f"❌ {crop.capitalize()} API Error: {response.status_code}")
                
        except Exception as e:
            print(f"❌ {crop.capitalize()} request failed: {e}")

if __name__ == "__main__":
    print("🧪 Testing Beans API Integration...")
    print("=" * 50)
    
    test_beans_api()
    
    print("\n🧪 Testing All Endpoints...")
    print("=" * 50)
    
    test_all_endpoints()
    
    # Test models endpoint
    try:
        models_response = requests.get("http://localhost:5000/api/models")
        if models_response.status_code == 200:
            models = models_response.json()
            print(f"\n📊 Available Models: {json.dumps(models, indent=2)}")
        else:
            print(f"❌ Models endpoint error: {models_response.status_code}")
    except Exception as e:
        print(f"❌ Models request failed: {e}") 