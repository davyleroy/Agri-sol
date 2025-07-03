#!/usr/bin/env python3
"""
Production startup script for AgriSol Plant Disease Detection API
"""

import os
import sys
from app import app, load_models, logger
from config import config

def main():
    """Main entry point for the application"""
    
    # Get environment
    env = os.environ.get('FLASK_ENV', 'development')
    
    # Load configuration
    app_config = config.get(env, config['default'])
    
    print("🍅🥔🌽🫘 AgriSol Plant Disease Detection API")
    print("=" * 50)
    print(f"Environment: {env}")
    print(f"Debug Mode: {app_config.DEBUG}")
    print(f"Host: {app_config.HOST}")
    print(f"Port: {app_config.PORT}")
    print("=" * 50)
    
    # Load models
    logger.info("Loading machine learning models...")
    load_models()
    
    # Start the application
    try:
        app.run(
            host=app_config.HOST,
            port=app_config.PORT,
            debug=app_config.DEBUG
        )
    except KeyboardInterrupt:
        logger.info("Application stopped by user")
    except Exception as e:
        logger.error(f"Application failed to start: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 