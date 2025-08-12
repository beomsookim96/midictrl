#!/usr/bin/env python3
"""
Cross-platform installation script for MidiCtrl
"""

import subprocess
import sys
import os

def run_command(cmd, description):
    """Run a command and return success status"""
    print(f"Running: {description}")
    print(f"Command: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("✓ Success")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Error: {e}")
        if e.stdout:
            print(f"stdout: {e.stdout}")
        if e.stderr:
            print(f"stderr: {e.stderr}")
        return False

def main():
    print("=" * 50)
    print("MidiCtrl Installation Script")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print(f"✗ Python 3.8 or higher required. You have {sys.version}")
        return 1
    
    print(f"✓ Python {sys.version}")
    
    # Upgrade pip
    if not run_command([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], 
                      "Upgrading pip"):
        print("⚠ Failed to upgrade pip, continuing anyway...")
    
    # Install core packages
    packages = ["PyQt6", "pynput", "PyYAML", "mido"]
    
    print("\nInstalling packages:")
    for package in packages:
        if not run_command([sys.executable, "-m", "pip", "install", package],
                          f"Installing {package}"):
            print(f"✗ Failed to install {package}")
            return 1
    
    # Try to install RTMidi as optional
    print("\nTrying to install python-rtmidi (optional)...")
    if run_command([sys.executable, "-m", "pip", "install", "python-rtmidi"],
                  "Installing python-rtmidi"):
        print("✓ RTMidi installed successfully")
    else:
        print("⚠ RTMidi installation failed, but that's okay - mido will be used instead")
    
    # Test installation
    print("\nTesting installation...")
    if run_command([sys.executable, "test_install.py"], "Running installation test"):
        print("\n" + "=" * 50)
        print("✓ Installation completed successfully!")
        print("\nTo run MidiCtrl:")
        print("  python main.py")
        print("\nOr use the launcher:")
        if os.name == 'nt':  # Windows
            print("  run.bat")
        else:
            print("  python run.py")
        print("=" * 50)
        return 0
    else:
        print("\n" + "=" * 50)
        print("✗ Installation test failed")
        print("Please check the error messages above")
        print("=" * 50)
        return 1

if __name__ == "__main__":
    sys.exit(main())