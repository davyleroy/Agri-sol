#!/usr/bin/env python3
"""
Consolidated Testing Utilities for AgriSol Plant Disease Detection API
Combines functionality from test_api.py, test_beans_api.py, and test_beans_integration.py
"""

import requests
import json
import os
import time
import io
from pathlib import Path
from PIL import Image
import numpy as np
from typing import Dict, List, Optional, Tuple, Any

class AgriSolAPITester:
    """Comprehensive testing class for AgriSol API"""
    
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url.rstrip('/')
        self.test_results = {}
        
    def create_test_image(self, size: Tuple[int, int] = (256, 256), color: str = 'green') -> io.BytesIO:
        """Create a test image for API testing"""
        try:
            # Create a simple colored image
            image = Image.new('RGB', size, color=color)
            img_bytes = io.BytesIO()
            image.save(img_bytes, format='JPEG')
            img_bytes.seek(0)
            return img_bytes
        except Exception as e:
            print(f"❌ Failed to create test image: {e}")
            return None
    
    def test_health_check(self) -> bool:
        """Test the health check endpoint"""
        print("🔍 Testing health check endpoint...")
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Health check passed!")
                print(f"   Status: {data.get('status')}")
                print(f"   Models loaded: {data.get('models_loaded', [])}")
                print(f"   Location API: {data.get('location_api_enabled', False)}")
                print(f"   Version: {data.get('version', 'Unknown')}")
                print(f"   Message: {data.get('message')}")
                
                self.test_results['health_check'] = {
                    'status': 'passed',
                    'data': data
                }
                return True
            else:
                print(f"❌ Health check failed with status {response.status_code}")
                self.test_results['health_check'] = {
                    'status': 'failed',
                    'error': f"HTTP {response.status_code}"
                }
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Health check failed: {e}")
            self.test_results['health_check'] = {
                'status': 'failed',
                'error': str(e)
            }
            return False
    
    def test_models_endpoint(self) -> bool:
        """Test the models information endpoint"""
        print("\n🔍 Testing models information endpoint...")
        try:
            response = requests.get(f"{self.base_url}/api/models", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Models endpoint passed!")
                print(f"   Total models: {data.get('total_models')}")
                print(f"   API version: {data.get('api_version')}")
                
                for crop_type, info in data.get('models', {}).items():
                    status = "✅ Ready" if info.get('loaded') else "❌ Not Available"
                    print(f"   {crop_type.title()}: {status} ({len(info.get('classes', []))} classes)")
                    if info.get('load_error'):
                        print(f"     Error: {info['load_error']}")
                
                self.test_results['models_endpoint'] = {
                    'status': 'passed',
                    'data': data
                }
                return True
            else:
                print(f"❌ Models endpoint failed with status {response.status_code}")
                self.test_results['models_endpoint'] = {
                    'status': 'failed',
                    'error': f"HTTP {response.status_code}"
                }
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Models endpoint failed: {e}")
            self.test_results['models_endpoint'] = {
                'status': 'failed',
                'error': str(e)
            }
            return False
    
    def test_prediction_endpoint(self, crop_type: str = "tomatoes", image_path: Optional[str] = None) -> bool:
        """Test the prediction endpoint with a sample image"""
        print(f"\n🔍 Testing prediction endpoint for {crop_type}...")
        
        try:
            # Use provided image or create a test image
            if image_path and os.path.exists(image_path):
                with open(image_path, 'rb') as image_file:
                    files = {'image': image_file}
                    image_source = f"file: {image_path}"
            else:
                test_image = self.create_test_image()
                if test_image is None:
                    return False
                files = {'image': ('test_image.jpg', test_image, 'image/jpeg')}
                image_source = "generated test image"
            
            print(f"   Using {image_source}")
            
            start_time = time.time()
            response = requests.post(
                f"{self.base_url}/api/ml/{crop_type}",
                files=files,
                timeout=30
            )
            processing_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Prediction endpoint passed!")
                print(f"   Processing time: {processing_time:.2f} seconds")
                print(f"   API processing time: {data.get('processing_time', 'N/A')} seconds")
                print(f"   Predicted class: {data.get('predicted_class')}")
                print(f"   Confidence: {data.get('confidence_percentage')}%")
                print(f"   Severity: {data.get('severity')}")
                print(f"   Treatment urgency: {data.get('treatment_urgency')}")
                print(f"   Estimated recovery: {data.get('estimated_recovery')}")
                print(f"   Recommendations: {len(data.get('recommendations', []))} items")
                
                # Show top 3 predictions
                all_predictions = data.get('all_predictions', {})
                if all_predictions:
                    sorted_predictions = sorted(all_predictions.items(), key=lambda x: x[1], reverse=True)
                    print("   Top 3 predictions:")
                    for i, (disease, confidence) in enumerate(sorted_predictions[:3]):
                        print(f"     {i+1}. {disease}: {confidence:.3f}")
                
                self.test_results[f'prediction_{crop_type}'] = {
                    'status': 'passed',
                    'data': data,
                    'processing_time': processing_time
                }
                return True
            else:
                print(f"❌ Prediction failed with status {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data.get('message', error_data.get('error'))}")
                except:
                    print(f"   Response: {response.text}")
                
                self.test_results[f'prediction_{crop_type}'] = {
                    'status': 'failed',
                    'error': f"HTTP {response.status_code}",
                    'response': response.text
                }
                return False
                
        except Exception as e:
            print(f"❌ Prediction test failed: {e}")
            self.test_results[f'prediction_{crop_type}'] = {
                'status': 'failed',
                'error': str(e)
            }
            return False
    
    def test_all_crop_endpoints(self) -> Dict[str, bool]:
        """Test all crop prediction endpoints"""
        print("\n🧪 Testing all crop endpoints...")
        crops = ['tomatoes', 'potatoes', 'maize', 'beans']
        results = {}
        
        for crop in crops:
            print(f"\n--- Testing {crop.title()} ---")
            results[crop] = self.test_prediction_endpoint(crop)
            time.sleep(1)  # Small delay between tests
        
        return results
    
    def test_error_handling(self) -> bool:
        """Test error handling with invalid requests"""
        print("\n🔍 Testing error handling...")
        
        error_tests = []
        
        # Test invalid crop type
        try:
            response = requests.post(f"{self.base_url}/api/ml/invalid_crop", timeout=10)
            if response.status_code == 400:
                print("✅ Invalid crop type handled correctly")
                error_tests.append(True)
            else:
                print(f"❌ Invalid crop type not handled properly: {response.status_code}")
                error_tests.append(False)
        except Exception as e:
            print(f"❌ Error testing invalid crop type: {e}")
            error_tests.append(False)
        
        # Test missing image
        try:
            response = requests.post(f"{self.base_url}/api/ml/tomatoes", timeout=10)
            if response.status_code == 400:
                print("✅ Missing image handled correctly")
                error_tests.append(True)
            else:
                print(f"❌ Missing image not handled properly: {response.status_code}")
                error_tests.append(False)
        except Exception as e:
            print(f"❌ Error testing missing image: {e}")
            error_tests.append(False)
        
        # Test invalid file type
        try:
            files = {'image': ('test.txt', io.StringIO('not an image'), 'text/plain')}
            response = requests.post(f"{self.base_url}/api/ml/tomatoes", files=files, timeout=10)
            if response.status_code == 400:
                print("✅ Invalid file type handled correctly")
                error_tests.append(True)
            else:
                print(f"❌ Invalid file type not handled properly: {response.status_code}")
                error_tests.append(False)
        except Exception as e:
            print(f"❌ Error testing invalid file type: {e}")
            error_tests.append(False)
        
        all_passed = all(error_tests)
        self.test_results['error_handling'] = {
            'status': 'passed' if all_passed else 'failed',
            'tests_passed': sum(error_tests),
            'total_tests': len(error_tests)
        }
        
        return all_passed
    
    def test_testing_endpoints(self) -> bool:
        """Test the testing endpoints if available"""
        print("\n🔍 Testing testing endpoints...")
        
        # Test model testing endpoint
        try:
            response = requests.get(f"{self.base_url}/api/test/models", timeout=30)
            if response.status_code == 200:
                data = response.json()
                print("✅ Test models endpoint working!")
                for crop_type, result in data.get('test_results', {}).items():
                    status = result.get('status')
                    if status == 'success':
                        print(f"   {crop_type}: ✅ {result.get('processing_time')}s")
                    else:
                        print(f"   {crop_type}: ❌ {result.get('error')}")
            else:
                print(f"⚠️ Test models endpoint returned {response.status_code}")
        except requests.exceptions.RequestException:
            print("⚠️ Testing endpoints not available (might be disabled)")
        
        # Test config endpoint
        try:
            response = requests.get(f"{self.base_url}/api/test/config", timeout=10)
            if response.status_code == 200:
                data = response.json()
                print("✅ Test config endpoint working!")
                print(f"   Environment: {data.get('environment')}")
                print(f"   Debug: {data.get('debug')}")
                print(f"   Models loaded: {len(data.get('models_loaded', []))}")
            else:
                print(f"⚠️ Test config endpoint returned {response.status_code}")
        except requests.exceptions.RequestException:
            print("⚠️ Config endpoint not available")
        
        return True
    
    def test_documentation_endpoints(self) -> bool:
        """Test documentation and UI endpoints"""
        print("\n🔍 Testing documentation endpoints...")
        
        endpoints = [
            ('/docs', 'Swagger Documentation'),
            ('/test', 'Test Interface')
        ]
        
        results = []
        for endpoint, name in endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                if response.status_code == 200:
                    print(f"✅ {name} available at {endpoint}")
                    results.append(True)
                else:
                    print(f"❌ {name} failed: {response.status_code}")
                    results.append(False)
            except Exception as e:
                print(f"❌ {name} error: {e}")
                results.append(False)
        
        return all(results)
    
    def run_comprehensive_tests(self, image_path: Optional[str] = None) -> Dict[str, Any]:
        """Run all tests and return comprehensive results"""
        print("🚀 Starting comprehensive API tests...")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run all tests
        tests = [
            ('Health Check', self.test_health_check),
            ('Models Endpoint', self.test_models_endpoint),
            ('Error Handling', self.test_error_handling),
            ('Testing Endpoints', self.test_testing_endpoints),
            ('Documentation', self.test_documentation_endpoints)
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                print(f"❌ {test_name} failed with exception: {e}")
        
        # Test all crop endpoints
        crop_results = self.test_all_crop_endpoints()
        
        total_time = time.time() - start_time
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed_tests = sum(1 for result in self.test_results.values() 
                          if result.get('status') == 'passed')
        total_tests = len(self.test_results)
        
        print(f"✅ Tests passed: {passed_tests}/{total_tests}")
        print(f"⏱️ Total time: {total_time:.2f} seconds")
        
        if passed_tests == total_tests:
            print("🎉 ALL TESTS PASSED!")
        else:
            print("⚠️ Some tests failed. Check the details above.")
        
        print("\n💡 Next steps:")
        print("📚 Visit the documentation: http://localhost:5000/docs")
        print("🧪 Use the test interface: http://localhost:5000/test")
        
        return {
            'summary': {
                'passed': passed_tests,
                'total': total_tests,
                'success_rate': (passed_tests / total_tests) * 100 if total_tests > 0 else 0,
                'total_time': total_time
            },
            'detailed_results': self.test_results,
            'crop_results': crop_results
        }

def main():
    """Main function to run tests"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Test AgriSol Plant Disease Detection API')
    parser.add_argument('--url', default='http://localhost:5000', 
                       help='API base URL (default: http://localhost:5000)')
    parser.add_argument('--image', help='Path to test image file')
    parser.add_argument('--crop', choices=['tomatoes', 'potatoes', 'maize', 'beans'],
                       help='Test specific crop endpoint only')
    
    args = parser.parse_args()
    
    tester = AgriSolAPITester(args.url)
    
    if args.crop:
        # Test specific crop only
        print(f"🧪 Testing {args.crop} endpoint only...")
        tester.test_prediction_endpoint(args.crop, args.image)
    else:
        # Run comprehensive tests
        results = tester.run_comprehensive_tests(args.image)
        
        # Save results to file
        results_file = 'test_results.json'
        try:
            with open(results_file, 'w') as f:
                json.dump(results, f, indent=2, default=str)
            print(f"\n📄 Detailed results saved to: {results_file}")
        except Exception as e:
            print(f"⚠️ Could not save results: {e}")

if __name__ == "__main__":
    main() 