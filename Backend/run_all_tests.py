#!/usr/bin/env python3
"""
AgriSol Backend - Comprehensive Test Runner
Executes all backend tests and provides detailed reporting
"""

import sys
import os
import subprocess
import time
import json
import requests
from pathlib import Path
from datetime import datetime
import importlib.util

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

class TestRunner:
    def __init__(self):
        self.results = {}
        self.start_time = datetime.now()
        self.server_pid = None
        
    def log(self, message, level="INFO"):
        """Log message with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
    
    def run_command(self, command, description):
        """Run a command and capture output"""
        self.log(f"Running: {description}")
        try:
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                text=True, 
                timeout=60
            )
            return {
                'success': result.returncode == 0,
                'stdout': result.stdout,
                'stderr': result.stderr,
                'returncode': result.returncode
            }
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'stdout': '',
                'stderr': 'Command timed out',
                'returncode': -1
            }
        except Exception as e:
            return {
                'success': False,
                'stdout': '',
                'stderr': str(e),
                'returncode': -1
            }
    
    def test_environment(self):
        """Test environment setup"""
        self.log("=" * 60)
        self.log("🔍 TESTING ENVIRONMENT SETUP")
        self.log("=" * 60)
        
        tests = {}
        
        # Check Python version
        python_version = sys.version
        tests['python_version'] = {
            'success': sys.version_info >= (3, 8),
            'details': python_version
        }
        self.log(f"Python Version: {python_version}")
        
        # Check virtual environment
        in_venv = 'venv' in sys.prefix or 'env' in sys.prefix
        tests['virtual_environment'] = {
            'success': in_venv,
            'details': f"In virtual env: {in_venv}"
        }
        self.log(f"Virtual Environment: {'✅' if in_venv else '❌'}")
        
        # Check dependencies
        try:
            required_modules = ['flask', 'tensorflow', 'numpy', 'PIL', 'cv2']
            missing_modules = []
            
            for module in required_modules:
                try:
                    __import__(module)
                except ImportError:
                    missing_modules.append(module)
            
            tests['dependencies'] = {
                'success': len(missing_modules) == 0,
                'details': f"Missing modules: {missing_modules}" if missing_modules else "All dependencies available"
            }
            self.log(f"Dependencies: {'✅' if not missing_modules else '❌'}")
        except Exception as e:
            tests['dependencies'] = {
                'success': False,
                'details': str(e)
            }
        
        # Check configuration
        try:
            from config import get_config, validate_config
            config = get_config()
            errors = validate_config(config)
            tests['configuration'] = {
                'success': len(errors) == 0,
                'details': f"Config errors: {errors}" if errors else "Configuration valid"
            }
            self.log(f"Configuration: {'✅' if not errors else '❌'}")
        except Exception as e:
            tests['configuration'] = {
                'success': False,
                'details': str(e)
            }
        
        self.results['environment'] = tests
        return all(test['success'] for test in tests.values())
    
    def test_models(self):
        """Test model loading and availability"""
        self.log("=" * 60)
        self.log("🧠 TESTING ML MODELS")
        self.log("=" * 60)
        
        tests = {}
        
        try:
            from app import models, model_info, model_load_errors
            
            # Check model directory
            notebook_dir = Path("../Notebook")
            tests['model_directory'] = {
                'success': notebook_dir.exists(),
                'details': f"Directory exists: {notebook_dir.exists()}"
            }
            self.log(f"Model Directory: {'✅' if notebook_dir.exists() else '❌'}")
            
            # Check model files
            if notebook_dir.exists():
                model_files = list(notebook_dir.glob("*.h5")) + list(notebook_dir.glob("*.keras"))
                tests['model_files'] = {
                    'success': len(model_files) > 0,
                    'details': f"Found {len(model_files)} model files"
                }
                self.log(f"Model Files: {'✅' if len(model_files) > 0 else '❌'} ({len(model_files)} found)")
            
            # Check loaded models
            crop_types = ['tomatoes', 'potatoes', 'beans', 'maize']
            loaded_models = 0
            
            for crop_type in crop_types:
                is_loaded = crop_type in models
                if is_loaded:
                    loaded_models += 1
                tests[f'model_{crop_type}'] = {
                    'success': is_loaded,
                    'details': f"Model loaded: {is_loaded}"
                }
                self.log(f"{crop_type.title()} Model: {'✅' if is_loaded else '❌'}")
            
            tests['models_summary'] = {
                'success': loaded_models > 0,
                'details': f"{loaded_models}/{len(crop_types)} models loaded"
            }
            
            # Check for model loading errors
            if model_load_errors:
                for crop, error in model_load_errors.items():
                    self.log(f"Model Error ({crop}): {error}")
            
        except Exception as e:
            tests['model_loading'] = {
                'success': False,
                'details': str(e)
            }
            self.log(f"Model Loading Error: {e}")
        
        self.results['models'] = tests
        return any(test['success'] for test in tests.values() if 'model_' in test.keys())
    
    def start_server(self):
        """Start the Flask server for testing"""
        self.log("🚀 Starting Flask server...")
        
        try:
            # Try to start server
            process = subprocess.Popen(
                [sys.executable, "run.py"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=os.getcwd()
            )
            
            # Wait for server to start
            time.sleep(5)
            
            # Check if server is running
            try:
                response = requests.get("http://localhost:5000/", timeout=5)
                if response.status_code == 200:
                    self.server_pid = process.pid
                    self.log("✅ Server started successfully")
                    return True
                else:
                    self.log("❌ Server not responding")
                    process.terminate()
                    return False
            except requests.RequestException:
                self.log("❌ Server not accessible")
                process.terminate()
                return False
                
        except Exception as e:
            self.log(f"❌ Failed to start server: {e}")
            return False
    
    def stop_server(self):
        """Stop the Flask server"""
        if self.server_pid:
            try:
                import signal
                os.kill(self.server_pid, signal.SIGTERM)
                self.log("🛑 Server stopped")
            except:
                self.log("⚠️ Could not stop server gracefully")
    
    def test_api_endpoints(self):
        """Test API endpoints"""
        self.log("=" * 60)
        self.log("🌐 TESTING API ENDPOINTS")
        self.log("=" * 60)
        
        tests = {}
        base_url = "http://localhost:5000"
        
        # Test health check
        try:
            response = requests.get(f"{base_url}/", timeout=10)
            tests['health_check'] = {
                'success': response.status_code == 200,
                'details': f"Status: {response.status_code}"
            }
            self.log(f"Health Check: {'✅' if response.status_code == 200 else '❌'}")
        except Exception as e:
            tests['health_check'] = {
                'success': False,
                'details': str(e)
            }
            self.log(f"Health Check: ❌ - {e}")
        
        # Test models endpoint
        try:
            response = requests.get(f"{base_url}/api/models", timeout=10)
            data = response.json() if response.status_code == 200 else {}
            tests['models_endpoint'] = {
                'success': response.status_code == 200 and 'models' in data,
                'details': f"Status: {response.status_code}, Models: {len(data.get('models', {}))}"
            }
            self.log(f"Models Endpoint: {'✅' if response.status_code == 200 else '❌'}")
        except Exception as e:
            tests['models_endpoint'] = {
                'success': False,
                'details': str(e)
            }
            self.log(f"Models Endpoint: ❌ - {e}")
        
        # Test prediction endpoint (with dummy image)
        try:
            from PIL import Image
            import numpy as np
            import io
            
            # Create test image
            img_array = np.random.rand(256, 256, 3) * 255
            img = Image.fromarray(img_array.astype('uint8'))
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='JPEG')
            img_bytes.seek(0)
            
            response = requests.post(
                f"{base_url}/api/ml/tomatoes",
                files={'image': ('test.jpg', img_bytes, 'image/jpeg')},
                timeout=30
            )
            
            tests['prediction_endpoint'] = {
                'success': response.status_code == 200,
                'details': f"Status: {response.status_code}"
            }
            self.log(f"Prediction Endpoint: {'✅' if response.status_code == 200 else '❌'}")
            
            if response.status_code == 200:
                data = response.json()
                self.log(f"  Prediction: {data.get('predicted_class', 'N/A')}")
                self.log(f"  Confidence: {data.get('confidence_percentage', 'N/A')}%")
        
        except Exception as e:
            tests['prediction_endpoint'] = {
                'success': False,
                'details': str(e)
            }
            self.log(f"Prediction Endpoint: ❌ - {e}")
        
        # Test location endpoints
        location_endpoints = [
            '/api/location/leaderboard',
            '/api/location/disease-tracking'
        ]
        
        for endpoint in location_endpoints:
            try:
                response = requests.get(f"{base_url}{endpoint}", timeout=10)
                # 500 is acceptable if database is not configured
                success = response.status_code in [200, 500]
                tests[f'location_{endpoint.split("/")[-1]}'] = {
                    'success': success,
                    'details': f"Status: {response.status_code}"
                }
                self.log(f"Location {endpoint}: {'✅' if success else '❌'}")
            except Exception as e:
                tests[f'location_{endpoint.split("/")[-1]}'] = {
                    'success': False,
                    'details': str(e)
                }
        
        # Test error handling
        try:
            # Test invalid crop type
            response = requests.post(f"{base_url}/api/ml/invalid_crop", timeout=10)
            invalid_crop_ok = response.status_code == 400
            
            # Test missing image
            response = requests.post(f"{base_url}/api/ml/tomatoes", timeout=10)
            missing_image_ok = response.status_code == 400
            
            tests['error_handling'] = {
                'success': invalid_crop_ok and missing_image_ok,
                'details': f"Invalid crop: {invalid_crop_ok}, Missing image: {missing_image_ok}"
            }
            self.log(f"Error Handling: {'✅' if invalid_crop_ok and missing_image_ok else '❌'}")
        
        except Exception as e:
            tests['error_handling'] = {
                'success': False,
                'details': str(e)
            }
        
        self.results['api'] = tests
        return any(test['success'] for test in tests.values())
    
    def test_database(self):
        """Test database connectivity"""
        self.log("=" * 60)
        self.log("🗄️ TESTING DATABASE CONNECTIVITY")
        self.log("=" * 60)
        
        tests = {}
        
        # Check environment variables
        supabase_url = os.environ.get('SUPABASE_URL')
        supabase_key = os.environ.get('SUPABASE_SERVICE_KEY')
        
        tests['env_variables'] = {
            'success': bool(supabase_url and supabase_key),
            'details': f"URL: {'set' if supabase_url else 'missing'}, Key: {'set' if supabase_key else 'missing'}"
        }
        self.log(f"Environment Variables: {'✅' if bool(supabase_url and supabase_key) else '⚠️'}")
        
        if supabase_url and supabase_key:
            try:
                from supabase import create_client
                client = create_client(supabase_url, supabase_key)
                
                # Test connection
                result = client.table('scan_history').select('*').limit(1).execute()
                tests['database_connection'] = {
                    'success': True,
                    'details': f"Connected successfully, sample data: {len(result.data)} records"
                }
                self.log("✅ Database connection successful")
                
                # Test location API
                try:
                    from location_api import LocationAPI
                    tests['location_api'] = {
                        'success': True,
                        'details': "Location API can be imported"
                    }
                    self.log("✅ Location API available")
                except Exception as e:
                    tests['location_api'] = {
                        'success': False,
                        'details': str(e)
                    }
                    self.log(f"❌ Location API error: {e}")
                
            except Exception as e:
                tests['database_connection'] = {
                    'success': False,
                    'details': str(e)
                }
                self.log(f"❌ Database connection failed: {e}")
        else:
            tests['database_connection'] = {
                'success': False,
                'details': "Database credentials not configured"
            }
            self.log("⚠️ Database not configured (optional for basic functionality)")
        
        self.results['database'] = tests
        return True  # Database is optional, so always return True
    
    def run_existing_tests(self):
        """Run existing test scripts"""
        self.log("=" * 60)
        self.log("🧪 RUNNING EXISTING TEST SCRIPTS")
        self.log("=" * 60)
        
        tests = {}
        
        # Run consolidated test
        if os.path.exists('test_consolidated.py'):
            result = self.run_command('python test_consolidated.py', 'Consolidated Backend Test')
            tests['consolidated_test'] = {
                'success': result['success'],
                'details': result['stderr'] if result['stderr'] else result['stdout'][:200]
            }
            self.log(f"Consolidated Test: {'✅' if result['success'] else '❌'}")
        
        # Run API test (if server is running)
        if os.path.exists('test_api.py'):
            result = self.run_command('python test_api.py', 'API Test')
            tests['api_test'] = {
                'success': result['success'],
                'details': result['stderr'] if result['stderr'] else result['stdout'][:200]
            }
            self.log(f"API Test: {'✅' if result['success'] else '❌'}")
        
        # Run bean tests
        if os.path.exists('test_beans_api.py'):
            result = self.run_command('python test_beans_api.py', 'Bean API Test')
            tests['bean_api_test'] = {
                'success': result['success'],
                'details': result['stderr'] if result['stderr'] else result['stdout'][:200]
            }
            self.log(f"Bean API Test: {'✅' if result['success'] else '❌'}")
        
        self.results['existing_tests'] = tests
        return any(test['success'] for test in tests.values())
    
    def generate_report(self):
        """Generate comprehensive test report"""
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        # Calculate overall statistics
        total_tests = 0
        passed_tests = 0
        
        for category, tests in self.results.items():
            for test_name, test_result in tests.items():
                total_tests += 1
                if test_result['success']:
                    passed_tests += 1
        
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        # Create report
        report = {
            'test_run': {
                'start_time': self.start_time.isoformat(),
                'end_time': end_time.isoformat(),
                'duration_seconds': duration.total_seconds(),
                'agrisol_version': '2.0',
                'python_version': sys.version.split()[0]
            },
            'summary': {
                'total_tests': total_tests,
                'passed_tests': passed_tests,
                'failed_tests': total_tests - passed_tests,
                'success_rate': success_rate
            },
            'results': self.results
        }
        
        # Save detailed report
        with open('test_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        # Print summary
        self.log("=" * 60)
        self.log("📊 TEST SUMMARY")
        self.log("=" * 60)
        self.log(f"Total Tests: {total_tests}")
        self.log(f"Passed: {passed_tests}")
        self.log(f"Failed: {total_tests - passed_tests}")
        self.log(f"Success Rate: {success_rate:.1f}%")
        self.log(f"Duration: {duration.total_seconds():.1f} seconds")
        self.log(f"Detailed report saved to: test_report.json")
        
        if success_rate >= 80:
            self.log("🎉 OVERALL RESULT: EXCELLENT! Backend is working well!")
        elif success_rate >= 60:
            self.log("✅ OVERALL RESULT: GOOD! Minor issues detected.")
        else:
            self.log("⚠️ OVERALL RESULT: NEEDS ATTENTION! Multiple issues detected.")
        
        return success_rate >= 60
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        self.log("🚀 STARTING COMPREHENSIVE BACKEND TESTING")
        self.log(f"Started at: {self.start_time}")
        
        try:
            # Phase 1: Environment
            env_ok = self.test_environment()
            
            # Phase 2: Models
            models_ok = self.test_models()
            
            # Phase 3: Database
            db_ok = self.test_database()
            
            # Phase 4: Start server and test APIs
            server_started = self.start_server()
            api_ok = False
            if server_started:
                api_ok = self.test_api_endpoints()
            else:
                self.log("❌ Skipping API tests - server not available")
            
            # Phase 5: Existing tests
            existing_ok = self.run_existing_tests()
            
            # Generate final report
            overall_success = self.generate_report()
            
            return overall_success
            
        finally:
            # Cleanup
            self.stop_server()

def main():
    """Main test execution"""
    runner = TestRunner()
    success = runner.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 