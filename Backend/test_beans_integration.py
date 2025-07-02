#!/usr/bin/env python3
"""
Simple test script to verify beans integration
"""

import requests
import json
from PIL import Image
import io

def test_beans_api():
    """Test the beans API endpoint"""
    
    # API endpoint
    url = "http://localhost:5000/api/ml/beans"
    models_url = "http://localhost:5000/api/models"
    
    print("🧪 Testing Beans API Integration...")
    print("=" * 50)
    
    # Check models endpoint first (this is what we know works)
    try:
        models_response = requests.get(models_url)
        if models_response.status_code == 200:
            models_data = models_response.json()
            print(f"📊 Available Models:")
            for crop, info in models_data['models'].items():
                status = "✅ Ready" if info['loaded'] else "❌ Not Available"
                print(f"  {crop}: {status} ({len(info['classes'])} classes)")
            
            print(f"\nTotal models loaded: {models_data['total_models']}")
            
            # Check if beans is even in the models list
            if 'beans' not in models_data['models']:
                print("❌ Beans model is not configured in the API")
                print("Available models:", list(models_data['models'].keys()))
                return False
            elif not models_data['models']['beans']['loaded']:
                print("❌ Beans model is configured but not loaded")
                beans_info = models_data['models']['beans']
                print(f"Beans classes configured: {beans_info['classes']}")
                return False
            else:
                print("✅ Beans model is loaded and ready!")
        else:
            print(f"❌ Models endpoint error: {models_response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Models request failed: {e}")
        return False
    
    # Create a test image (simple green square to simulate a plant)
    test_image = Image.new('RGB', (256, 256), color='green')
    img_bytes = io.BytesIO()
    test_image.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    # Test the beans endpoint
    try:
        files = {'image': ('test_bean.jpg', img_bytes, 'image/jpeg')}
        print(f"\n🔄 Testing beans endpoint: {url}")
        response = requests.post(url, files=files)
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n🎯 Beans API Test Results:")
            print(f"  Predicted: {result.get('predicted_class')}")
            print(f"  Confidence: {result.get('confidence_percentage')}%")
            print(f"  Severity: {result.get('severity')}")
            print(f"  Urgency: {result.get('treatment_urgency')}")
            print(f"  Recovery: {result.get('estimated_recovery')}")
            print(f"  Recommendations: {len(result.get('recommendations', []))} items")
            
            # Show first few recommendations
            recommendations = result.get('recommendations', [])
            if recommendations:
                print(f"  First recommendation: {recommendations[0]}")
            
            print("✅ Beans API working perfectly!")
            return True
        elif response.status_code == 400:
            print(f"❌ API Error (400): {response.text}")
            return False
        elif response.status_code == 500:
            print(f"❌ Server Error (500): {response.text}")
            return False
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    success = test_beans_api()
    
    if success:
        print("\n🎉 ALL TESTS PASSED!")
        print("📚 Visit http://localhost:5000/docs for API documentation")
        print("🧪 Visit http://localhost:5000/test for web testing interface")
    else:
        print("\n❌ SOME TESTS FAILED!")
        print("The beans model may not be loaded. Check server startup logs.")
        print("To manually test beans:")
        print("1. Visit http://localhost:5000/test")
        print("2. Select 'Beans' from dropdown")
        print("3. Upload a plant image") 