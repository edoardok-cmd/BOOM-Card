#!/usr/bin/env python3
"""
BOOM Card Enterprise Backend Startup Script

This script starts the enterprise-grade backend built using 
AI-Automation Platform's robust architecture.

Usage:
    python start_enterprise.py [--debug] [--port PORT]
"""

import os
import sys
import argparse
import subprocess
from pathlib import Path

def install_requirements():
    """Install enterprise backend requirements"""
    print("📦 Installing enterprise backend requirements...")
    
    requirements_file = Path(__file__).parent / "requirements_enterprise.txt"
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
        ])
        print("✅ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False

def check_environment():
    """Check if required environment variables are set"""
    required_vars = [
        "DATABASE_URL",
        "JWT_SECRET"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("⚠️  Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease set these variables in your .env.production file or environment")
        return False
    
    print("✅ Environment variables checked")
    return True

def start_server(debug=False, port=5002):
    """Start the enterprise backend server"""
    print(f"🚀 Starting BOOM Card Enterprise Backend on port {port}")
    print(f"   Debug mode: {'ON' if debug else 'OFF'}")
    print(f"   Environment: {'Development' if debug else 'Production'}")
    
    # Set environment variables
    os.environ["PORT"] = str(port)
    if debug:
        os.environ["DEBUG"] = "true"
    
    try:
        if debug:
            # Development mode with auto-reload
            subprocess.run([
                sys.executable, "-m", "uvicorn",
                "boom_card_enterprise:app",
                "--host", "0.0.0.0",
                "--port", str(port),
                "--reload",
                "--log-level", "debug"
            ])
        else:
            # Production mode
            subprocess.run([
                sys.executable, "-m", "uvicorn", 
                "boom_card_enterprise:app",
                "--host", "0.0.0.0",
                "--port", str(port),
                "--workers", "4",
                "--access-log"
            ])
    except KeyboardInterrupt:
        print("\n👋 Shutting down BOOM Card Enterprise Backend")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Start BOOM Card Enterprise Backend")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    parser.add_argument("--port", type=int, default=5002, help="Port to run on (default: 5002)")
    parser.add_argument("--skip-install", action="store_true", help="Skip requirements installation")
    parser.add_argument("--skip-env-check", action="store_true", help="Skip environment check")
    
    args = parser.parse_args()
    
    print("🎯 BOOM Card Enterprise Backend")
    print("   Built with AI-Automation Platform Architecture")
    print("=" * 50)
    
    # Install requirements
    if not args.skip_install:
        if not install_requirements():
            sys.exit(1)
    
    # Check environment
    if not args.skip_env_check:
        if not check_environment():
            print("\n💡 Tip: You can skip this check with --skip-env-check for testing")
            sys.exit(1)
    
    # Start server
    start_server(debug=args.debug, port=args.port)

if __name__ == "__main__":
    main()