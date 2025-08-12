#!/usr/bin/env python3
"""
Installation test script for MidiCtrl
"""

import sys
import importlib

def test_imports():
    """Test if all required modules can be imported"""
    required_modules = [
        'PyQt6',
        'PyQt6.QtWidgets',
        'PyQt6.QtCore',
        'PyQt6.QtGui',
        'rtmidi',
        'pynput',
        'yaml'
    ]
    
    failed_imports = []
    
    for module in required_modules:
        try:
            importlib.import_module(module)
            print(f"✓ {module} imported successfully")
        except ImportError as e:
            print(f"✗ Failed to import {module}: {e}")
            failed_imports.append(module)
    
    return failed_imports

def test_midi_devices():
    """Test MIDI device detection"""
    print("\nTesting MIDI backends...")
    
    # Test RTMidi
    rtmidi_works = False
    try:
        import rtmidi
        midi_in = rtmidi.MidiIn()
        port_count = midi_in.get_port_count()
        print(f"✓ RTMidi backend: {port_count} ports found")
        
        for i in range(port_count):
            port_name = midi_in.get_port_name(i)
            print(f"  {i}: {port_name}")
            if 'nanoKEY2' in port_name or 'nanoKEY 2' in port_name:
                print(f"  ✓ Found nanoKEY2: {port_name}")
        
        rtmidi_works = port_count > 0
    except ImportError:
        print("⚠ RTMidi not available")
    except Exception as e:
        print(f"⚠ RTMidi error: {e}")
    
    # Test Mido
    mido_works = False
    try:
        import mido
        ports = mido.get_input_names()
        print(f"✓ Mido backend: {len(ports)} ports found")
        
        for i, port_name in enumerate(ports):
            print(f"  {i}: {port_name}")
            if 'nanoKEY2' in port_name or 'nanoKEY 2' in port_name:
                print(f"  ✓ Found nanoKEY2: {port_name}")
        
        mido_works = len(ports) > 0
    except ImportError:
        print("⚠ Mido not available")
    except Exception as e:
        print(f"⚠ Mido error: {e}")
    
    # Test our backend
    try:
        from midi.midi_backend import get_midi_backend
        backend = get_midi_backend()
        if backend:
            devices = backend.get_available_devices()
            print(f"✓ MidiCtrl backend: {len(devices)} devices found")
            return len(devices) > 0
        else:
            print("✗ No MIDI backend available")
            return False
    except Exception as e:
        print(f"✗ Backend test error: {e}")
        return False

def main():
    """Main test function"""
    print("MidiCtrl Installation Test")
    print("=" * 40)
    
    print("\n1. Testing Python modules...")
    failed_imports = test_imports()
    
    print("\n2. Testing MIDI device detection...")
    midi_ok = test_midi_devices()
    
    print("\n" + "=" * 40)
    print("Test Results:")
    
    if failed_imports:
        print(f"✗ Missing modules: {', '.join(failed_imports)}")
        print("Please install missing modules with: pip install -r requirements.txt")
    else:
        print("✓ All required modules are installed")
    
    if midi_ok:
        print("✓ MIDI system is working")
    else:
        print("⚠ MIDI system test inconclusive (no devices found or error)")
    
    if not failed_imports:
        print("\n✓ Ready to run MidiCtrl!")
        print("Run the application with: python main.py")
    else:
        print("\n✗ Installation incomplete. Please fix the issues above.")
        return 1
        
    return 0

if __name__ == "__main__":
    sys.exit(main())