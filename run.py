#!/usr/bin/env python3
"""
Universal launcher for MidiCtrl with platform-specific optimizations
"""

import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def setup_environment():
    """Setup environment for best performance"""
    
    if sys.platform == "win32":
        # Windows-specific optimizations
        os.environ['QT_AUTO_SCREEN_SCALE_FACTOR'] = '1'
        os.environ['QT_SCALE_FACTOR'] = '1'
        os.environ['QT_SCREEN_SCALE_FACTORS'] = '1'
        os.environ['QT_FONT_DPI'] = '96'
        
        # Enable software OpenGL if hardware acceleration causes issues
        if '--software-opengl' in sys.argv:
            os.environ['QT_OPENGL'] = 'software'
            sys.argv.remove('--software-opengl')
            
        # Windows DPI awareness
        try:
            import ctypes
            ctypes.windll.user32.SetProcessDPIAware()
        except:
            pass
            
    elif sys.platform.startswith("linux"):
        # Linux-specific optimizations
        print("Linux detected - checking MIDI permissions...")
        
        # Check if user is in audio group
        try:
            import subprocess
            groups = subprocess.check_output(['groups'], text=True).strip()
            if 'audio' not in groups:
                print("⚠️  Warning: User not in 'audio' group")
                print("   For better MIDI support, run: sudo usermod -a -G audio $USER")
                print("   Then log out and log back in")
                print()
        except:
            pass

def main():
    """Main launcher function"""
    
    print("🎹 MidiCtrl - KORG nanoKEY2 Mapper")
    print("=" * 40)
    
    setup_environment()
    
    # Import and run the main application
    try:
        from main import main as app_main
        print("Starting application...")
        app_main()
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Please make sure all dependencies are installed:")
        print("  python -m pip install PyQt6 pynput PyYAML mido")
        return 1
    except Exception as e:
        print(f"❌ Application error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())