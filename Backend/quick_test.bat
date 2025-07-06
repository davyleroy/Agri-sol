@echo off
REM AgriSol Backend Quick Test Script for Windows
REM This script provides a fast way to test the backend setup and functionality

setlocal enabledelayedexpansion

echo 🚀 AgriSol Backend Quick Test
echo ==============================

REM Check if Python is available
echo 🔍 Checking Python setup...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.8+
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%a in ('python --version') do echo ✅ Python found: %%a
)

REM Check virtual environment
echo 🔍 Checking virtual environment...
if defined VIRTUAL_ENV (
    echo ✅ Virtual environment active: %VIRTUAL_ENV%
) else (
    echo ⚠️ No virtual environment detected
    echo ℹ️ Recommendation: Create and activate a virtual environment
    echo   python -m venv venv
    echo   venv\Scripts\activate
)

REM Check if requirements.txt exists
if not exist requirements.txt (
    echo ❌ requirements.txt not found
    pause
    exit /b 1
)

REM Install dependencies
echo 🔍 Installing dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
) else (
    echo ✅ Dependencies installed successfully
)

REM Test basic imports
echo 🔍 Testing Python imports...
python -c "
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
if %errorlevel% neq 0 (
    echo ❌ Some modules missing
    pause
    exit /b 1
)

REM Test configuration
echo 🔍 Testing configuration...
python -c "
from config import get_config, validate_config
config = get_config()
errors = validate_config(config)
if errors:
    print('Configuration errors:')
    for error in errors:
        print(f'  - {error}')
else:
    print('✅ Configuration valid')
"

REM Run basic tests
echo 🔍 Running basic tests...
if exist test_consolidated.py (
    echo Running consolidated test...
    python test_consolidated.py
    if %errorlevel% neq 0 (
        echo ⚠️ Some basic tests failed
    ) else (
        echo ✅ Basic tests passed
    )
) else (
    echo ⚠️ test_consolidated.py not found
)

REM Test server startup
echo 🔍 Testing server startup...
if exist run.py (
    echo Starting server for testing...
    start /b python run.py
    timeout /t 5 /nobreak >nul
    
    REM Test if server responds
    curl -s -f http://localhost:5000/ >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Server started successfully
        echo Testing API endpoints...
        
        curl -s -f http://localhost:5000/api/health >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ Health endpoint working
        ) else (
            echo ⚠️ Health endpoint not responding
        )
        
        curl -s -f http://localhost:5000/api/models >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ Models endpoint working
        ) else (
            echo ⚠️ Models endpoint not responding
        )
    ) else (
        echo ❌ Server not responding
    )
    
    REM Stop any running Python processes (cleanup)
    taskkill /f /im python.exe >nul 2>&1
    echo Server stopped
) else (
    echo ❌ run.py not found
)

REM Run comprehensive tests if available
echo 🔍 Running comprehensive tests...
if exist run_all_tests.py (
    echo Running comprehensive test suite...
    python run_all_tests.py
    if %errorlevel% neq 0 (
        echo ⚠️ Some comprehensive tests failed
    ) else (
        echo ✅ Comprehensive tests completed successfully
    )
) else (
    echo ⚠️ run_all_tests.py not found
)

echo.
echo ==============================
echo 🎉 Backend testing completed!
echo ==============================
echo.

REM Check if test report was generated
if exist test_report.json (
    echo 📋 Detailed test report: test_report.json
)

echo Next steps:
echo 1. Start the server: python run.py
echo 2. Test the API: http://localhost:5000/
echo 3. View documentation: http://localhost:5000/docs
echo 4. Use test interface: http://localhost:5000/test

pause 