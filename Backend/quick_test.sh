#!/bin/bash

# AgriSol Backend Quick Test Script
# This script provides a fast way to test the backend setup and functionality

set -e  # Exit on any error

echo "🚀 AgriSol Backend Quick Test"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success") echo -e "${GREEN}✅ $message${NC}" ;;
        "error") echo -e "${RED}❌ $message${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️ $message${NC}" ;;
        "info") echo -e "${BLUE}ℹ️ $message${NC}" ;;
    esac
}

# Check if Python is available
check_python() {
    echo "🔍 Checking Python setup..."
    
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        print_status "success" "Python found: $PYTHON_VERSION"
        PYTHON_CMD="python3"
    elif command -v python &> /dev/null; then
        PYTHON_VERSION=$(python --version)
        print_status "success" "Python found: $PYTHON_VERSION"
        PYTHON_CMD="python"
    else
        print_status "error" "Python not found. Please install Python 3.8+"
        exit 1
    fi
}

# Check virtual environment
check_venv() {
    echo "🔍 Checking virtual environment..."
    
    if [[ "$VIRTUAL_ENV" != "" ]]; then
        print_status "success" "Virtual environment active: $VIRTUAL_ENV"
    else
        print_status "warning" "No virtual environment detected"
        print_status "info" "Recommendation: Create and activate a virtual environment"
        echo "  python -m venv venv"
        echo "  source venv/bin/activate  # On Linux/Mac"
        echo "  venv\\Scripts\\activate     # On Windows"
    fi
}

# Install dependencies
install_dependencies() {
    echo "🔍 Checking dependencies..."
    
    if [ ! -f "requirements.txt" ]; then
        print_status "error" "requirements.txt not found"
        exit 1
    fi
    
    print_status "info" "Installing/updating dependencies..."
    $PYTHON_CMD -m pip install --upgrade pip
    $PYTHON_CMD -m pip install -r requirements.txt
    
    if [ $? -eq 0 ]; then
        print_status "success" "Dependencies installed successfully"
    else
        print_status "error" "Failed to install dependencies"
        exit 1
    fi
}

# Test basic imports
test_imports() {
    echo "🔍 Testing Python imports..."
    
    $PYTHON_CMD -c "
import sys
modules = ['flask', 'tensorflow', 'numpy', 'PIL', 'cv2']
failed = []

for module in modules:
    try:
        __import__(module)
        print(f'✅ {module}')
    except ImportError:
        print(f'❌ {module}')
        failed.append(module)

if failed:
    print(f'Failed imports: {failed}')
    sys.exit(1)
else:
    print('All imports successful!')
"
    
    if [ $? -eq 0 ]; then
        print_status "success" "All required modules available"
    else
        print_status "error" "Some modules missing - check pip install"
        exit 1
    fi
}

# Test configuration
test_config() {
    echo "🔍 Testing configuration..."
    
    $PYTHON_CMD -c "
from config import get_config, validate_config
config = get_config()
errors = validate_config(config)

if errors:
    print('Configuration errors:')
    for error in errors:
        print(f'  - {error}')
else:
    print('✅ Configuration valid')
    print(f'Model directory: {config.NOTEBOOK_DIR}')
    print(f'Upload folder: {config.UPLOAD_FOLDER}')
"
}

# Run basic tests
run_basic_tests() {
    echo "🔍 Running basic tests..."
    
    if [ -f "test_consolidated.py" ]; then
        print_status "info" "Running consolidated test..."
        $PYTHON_CMD test_consolidated.py
        
        if [ $? -eq 0 ]; then
            print_status "success" "Basic tests passed"
        else
            print_status "warning" "Some basic tests failed"
        fi
    else
        print_status "warning" "test_consolidated.py not found"
    fi
}

# Start server for testing
start_server_test() {
    echo "🔍 Testing server startup..."
    
    if [ -f "run.py" ]; then
        print_status "info" "Starting server (will stop after 10 seconds)..."
        
        # Start server in background
        $PYTHON_CMD run.py &
        SERVER_PID=$!
        
        # Wait for server to start
        sleep 3
        
        # Test if server is responding
        if curl -s -f http://localhost:5000/ > /dev/null 2>&1; then
            print_status "success" "Server started successfully"
            
            # Test API endpoints
            echo "Testing API endpoints..."
            
            # Health check
            if curl -s -f http://localhost:5000/api/health > /dev/null 2>&1; then
                print_status "success" "Health endpoint working"
            else
                print_status "warning" "Health endpoint not responding"
            fi
            
            # Models endpoint
            if curl -s -f http://localhost:5000/api/models > /dev/null 2>&1; then
                print_status "success" "Models endpoint working"
            else
                print_status "warning" "Models endpoint not responding"
            fi
            
        else
            print_status "error" "Server not responding"
        fi
        
        # Stop server
        sleep 2
        kill $SERVER_PID 2>/dev/null || true
        print_status "info" "Server stopped"
        
    else
        print_status "error" "run.py not found"
    fi
}

# Run comprehensive tests
run_comprehensive_tests() {
    echo "🔍 Running comprehensive tests..."
    
    if [ -f "run_all_tests.py" ]; then
        print_status "info" "Running comprehensive test suite..."
        $PYTHON_CMD run_all_tests.py
        
        if [ $? -eq 0 ]; then
            print_status "success" "Comprehensive tests completed successfully"
        else
            print_status "warning" "Some comprehensive tests failed"
        fi
    else
        print_status "warning" "run_all_tests.py not found"
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [option]"
    echo ""
    echo "Options:"
    echo "  setup     - Check environment and install dependencies"
    echo "  test      - Run basic tests only"
    echo "  server    - Test server startup and API endpoints"
    echo "  full      - Run all tests (comprehensive)"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup   # First time setup"
    echo "  $0 test    # Quick test"
    echo "  $0 full    # Complete testing"
}

# Main execution
main() {
    local command=${1:-"full"}
    
    case $command in
        "setup")
            check_python
            check_venv
            install_dependencies
            test_imports
            test_config
            print_status "success" "Setup completed! Run '$0 test' to test functionality"
            ;;
        "test")
            check_python
            test_imports
            test_config
            run_basic_tests
            print_status "success" "Basic testing completed!"
            ;;
        "server")
            check_python
            test_imports
            start_server_test
            print_status "success" "Server testing completed!"
            ;;
        "full")
            check_python
            check_venv
            test_imports
            test_config
            run_basic_tests
            start_server_test
            run_comprehensive_tests
            print_status "success" "Full testing completed!"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_status "error" "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 