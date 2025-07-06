#!/usr/bin/env python3
"""
Simple Backend Test Runner for AgriSol
Cross-platform Python script for quick backend validation
"""

import sys
import os
import time
import subprocess

def print_header(title):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(f"🔍 {title}")
    print("=" * 60)

def print_status(status, message):
    """Print status with emoji"""
    icons = {
        'success': '✅',
        'error': '❌', 
        'warning': '⚠️',
        'info': 'ℹ️'
    }
    print(f"{icons.get(status, 'ℹ️')} {message}")

def test_python_setup():
    """Test Python environment"""
    print_header("PYTHON ENVIRONMENT")
    
    # Python version
    python_version = sys.version.split()[0]
    version_tuple = tuple(map(int, python_version.split('.')))
    
    if version_tuple >= (3, 8):
        print_status('success', f"Python version: {python_version}")
        return True
    else:
        print_status('error', f"Python version {python_version} is too old. Need 3.8+")
        return False

def test_virtual_environment():
    """Check virtual environment"""
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print_status('success', "Virtual environment detected")
        return True
    else:
        print_status('warning', "No virtual environment detected")
        print_status('info', "Consider using: python -m venv venv")
        return True  # Not critical

def test_dependencies():
    """Test required dependencies"""
    print_header("DEPENDENCIES")
    
    required_modules = [
        'flask',
        'tensorflow', 
        'numpy',
        'PIL',
        'cv2'
    ]
    
    missing = []
    for module in required_modules:
        try:
            __import__(module)
            print_status('success', f"{module}")
        except ImportError:
            print_status('error', f"{module} - MISSING")
            missing.append(module)
    
    if missing:
        print_status('error', f"Missing modules: {', '.join(missing)}")
        print_status('info', "Install with: pip install -r requirements.txt")
        return False
    else:
        print_status('success', "All dependencies available")
        return True

def test_configuration():
    """Test backend configuration"""
    print_header("CONFIGURATION")
    
    try:
        from config import get_config, validate_config
        config = get_config()
        errors = validate_config(config)
        
        if errors:
            print_status('warning', "Configuration has warnings:")
            for error in errors:
                print(f"  - {error}")
        else:
            print_status('success', "Configuration is valid")
        
        # Check important paths
        if hasattr(config, 'NOTEBOOK_DIR'):
            if config.NOTEBOOK_DIR.exists():
                print_status('success', f"Model directory found: {config.NOTEBOOK_DIR}")
            else:
                print_status('warning', f"Model directory not found: {config.NOTEBOOK_DIR}")
        
        return len(errors) == 0
        
    except Exception as e:
        print_status('error', f"Configuration error: {e}")
        return False

def test_models():
    """Test model loading"""
    print_header("ML MODELS")
    
    try:
        # Import after we know dependencies are available
        from app import models, model_info, model_load_errors
        
        crop_types = ['tomatoes', 'potatoes', 'beans', 'maize']
        loaded_count = 0
        
        for crop in crop_types:
            if crop in models:
                print_status('success', f"{crop.title()} model loaded")
                loaded_count += 1
            else:
                print_status('warning', f"{crop.title()} model not loaded")
                if crop in model_load_errors:
                    print(f"  Error: {model_load_errors[crop]}")
        
        print_status('info', f"Total models loaded: {loaded_count}/{len(crop_types)}")
        return loaded_count > 0
        
    except Exception as e:
        print_status('error', f"Model loading error: {e}")
        return False

def test_basic_functionality():
    """Run basic functionality tests"""
    print_header("BASIC TESTS")
    
    test_files = [
        'test_consolidated.py',
        'test_api.py'
    ]
    
    passed = 0
    total = 0
    
    for test_file in test_files:
        if os.path.exists(test_file):
            total += 1
            print_status('info', f"Running {test_file}...")
            
            try:
                result = subprocess.run(
                    [sys.executable, test_file], 
                    capture_output=True, 
                    text=True, 
                    timeout=60
                )
                
                if result.returncode == 0:
                    print_status('success', f"{test_file} passed")
                    passed += 1
                else:
                    print_status('warning', f"{test_file} failed")
                    if result.stderr:
                        print(f"  Error: {result.stderr[:100]}...")
                        
            except subprocess.TimeoutExpired:
                print_status('warning', f"{test_file} timed out")
            except Exception as e:
                print_status('warning', f"{test_file} error: {e}")
        else:
            print_status('info', f"{test_file} not found (skipping)")
    
    if total > 0:
        print_status('info', f"Test results: {passed}/{total} passed")
        return passed > 0
    else:
        print_status('warning', "No test files found")
        return True

def test_server_startup():
    """Test if server can start"""
    print_header("SERVER STARTUP")
    
    if not os.path.exists('run.py'):
        print_status('error', "run.py not found")
        return False
    
    print_status('info', "Testing server startup (will stop after 5 seconds)...")
    
    try:
        # Start server
        process = subprocess.Popen(
            [sys.executable, 'run.py'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait a bit for startup
        time.sleep(3)
        
        # Check if process is still running
        if process.poll() is None:
            print_status('success', "Server started successfully")
            
            # Try to make a simple request (optional)
            try:
                import requests
                response = requests.get('http://localhost:5000/', timeout=5)
                if response.status_code == 200:
                    print_status('success', "Server responding to requests")
                else:
                    print_status('warning', f"Server returned status {response.status_code}")
            except:
                print_status('info', "Could not test HTTP requests (requests module not available)")
            
            # Stop server
            process.terminate()
            process.wait(timeout=5)
            print_status('info', "Server stopped")
            return True
        else:
            print_status('error', "Server failed to start")
            if process.stderr:
                stderr_output = process.stderr.read().decode()
                print(f"  Error: {stderr_output[:200]}...")
            return False
            
    except Exception as e:
        print_status('error', f"Server test error: {e}")
        return False

def generate_summary(results):
    """Generate test summary"""
    print_header("TEST SUMMARY")
    
    total_tests = len(results)
    passed_tests = sum(1 for result in results.values() if result)
    success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
    
    print(f"Total test categories: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print_status('success', "EXCELLENT! Backend is working well!")
        return True
    elif success_rate >= 60:
        print_status('success', "GOOD! Minor issues detected but functional")
        return True
    else:
        print_status('warning', "NEEDS ATTENTION! Multiple issues detected")
        return False

def main():
    """Main test execution"""
    print("🚀 AgriSol Backend Simple Test")
    print("Cross-platform validation script")
    
    # Run all test categories
    results = {}
    
    try:
        results['python_setup'] = test_python_setup()
        results['virtual_env'] = test_virtual_environment() 
        results['dependencies'] = test_dependencies()
        
        if results['dependencies']:  # Only continue if deps are available
            results['configuration'] = test_configuration()
            results['models'] = test_models()
            results['basic_tests'] = test_basic_functionality()
            results['server_startup'] = test_server_startup()
        else:
            print_status('warning', "Skipping remaining tests due to missing dependencies")
    
    except KeyboardInterrupt:
        print_status('warning', "Testing interrupted by user")
        return False
    except Exception as e:
        print_status('error', f"Unexpected error: {e}")
        return False
    
    # Generate summary
    overall_success = generate_summary(results)
    
    # Provide next steps
    print_header("NEXT STEPS")
    if overall_success:
        print("✅ Backend is ready for use!")
        print("1. Start the server: python run.py")
        print("2. Test the API: http://localhost:5000/")
        print("3. View documentation: http://localhost:5000/docs")
        print("4. Use test interface: http://localhost:5000/test")
    else:
        print("⚠️ Backend needs attention before use:")
        if not results.get('dependencies', True):
            print("1. Install dependencies: pip install -r requirements.txt")
        if not results.get('configuration', True):
            print("2. Check configuration in config.py")
        if not results.get('models', True):
            print("3. Ensure model files are in ../Notebook directory")
        print("4. Re-run this test: python simple_test.py")
    
    return overall_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 