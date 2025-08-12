"""
MIDI backend abstraction layer to handle different MIDI libraries
"""

import time
from abc import ABC, abstractmethod
from typing import List, Tuple, Optional, Dict, Any

class MidiBackend(ABC):
    """Abstract base class for MIDI backends"""
    
    @abstractmethod
    def get_available_devices(self) -> List[Tuple[int, str]]:
        """Get list of available MIDI input devices"""
        pass
    
    @abstractmethod
    def open_device(self, port_id: int) -> bool:
        """Open MIDI device"""
        pass
    
    @abstractmethod
    def close_device(self):
        """Close MIDI device"""
        pass
    
    @abstractmethod
    def get_message(self) -> Optional[Tuple[List[int], float]]:
        """Get next MIDI message"""
        pass

class RtMidiBackend(MidiBackend):
    """RTMidi backend using python-rtmidi"""
    
    def __init__(self):
        try:
            import rtmidi
            self.rtmidi = rtmidi
            self.midi_in = None
            self.available = True
        except ImportError:
            self.available = False
            raise ImportError("python-rtmidi not available")
    
    def get_available_devices(self) -> List[Tuple[int, str]]:
        if not self.available:
            return []
            
        midi_in = self.rtmidi.MidiIn()
        ports = []
        for i in range(midi_in.get_port_count()):
            port_name = midi_in.get_port_name(i)
            ports.append((i, port_name))
        return ports
    
    def open_device(self, port_id: int) -> bool:
        try:
            if self.midi_in:
                self.close_device()
            
            self.midi_in = self.rtmidi.MidiIn()
            self.midi_in.open_port(port_id)
            return True
        except Exception as e:
            print(f"Failed to open RTMidi device: {e}")
            return False
    
    def close_device(self):
        if self.midi_in:
            self.midi_in.close_port()
            self.midi_in = None
    
    def get_message(self) -> Optional[Tuple[List[int], float]]:
        if not self.midi_in:
            return None
        return self.midi_in.get_message()

class MidoBackend(MidiBackend):
    """Mido backend using mido library"""
    
    def __init__(self):
        try:
            import mido
            self.mido = mido
            self.input_port = None
            self.available = True
            self.message_queue = []
            self.virtual_mode = False
            self.test_thread = None
        except ImportError:
            self.available = False
            raise ImportError("mido not available")
    
    def get_available_devices(self) -> List[Tuple[int, str]]:
        if not self.available:
            return []
        
        try:
            ports = self.mido.get_input_names()
            print(f"Mido found {len(ports)} MIDI input ports: {ports}")
            
            # If no ports found and we're in WSL/testing environment, add virtual ports
            if not ports:
                print("No MIDI ports found, adding virtual test ports")
                virtual_ports = [
                    "Virtual nanoKEY2 (Test)",
                    "Virtual MIDI Device 1", 
                    "Virtual MIDI Device 2"
                ]
                return [(i, name) for i, name in enumerate(virtual_ports)]
            
            return [(i, name) for i, name in enumerate(ports)]
        except Exception as e:
            print(f"Error getting MIDI input ports: {e}")
            # Return virtual ports as fallback
            print("Falling back to virtual MIDI ports for testing")
            virtual_ports = [
                "Virtual nanoKEY2 (Test)",
                "Virtual MIDI Device 1"
            ]
            return [(i, name) for i, name in enumerate(virtual_ports)]
    
    def open_device(self, port_id: int) -> bool:
        try:
            if self.input_port:
                self.close_device()
            
            try:
                ports = self.mido.get_input_names()
            except Exception as e:
                print(f"Error getting ports: {e}, using virtual mode")
                ports = []
            
            if ports and port_id < len(ports):
                port_name = ports[port_id]
                self.input_port = self.mido.open_input(port_name, callback=self._message_callback)
                print(f"Opened real MIDI device: {port_name}")
                return True
            else:
                # Virtual/testing mode
                print(f"Opening virtual MIDI device (ID: {port_id})")
                self.input_port = "virtual"  # Mark as virtual connection
                self.virtual_mode = True
                # Start a test MIDI message generator
                import threading
                self.test_thread = threading.Thread(target=self._generate_test_messages, daemon=True)
                self.test_thread.start()
                return True
                
        except Exception as e:
            print(f"Failed to open Mido device: {e}")
            return False
    
    def close_device(self):
        if self.input_port and self.input_port != "virtual":
            self.input_port.close()
            self.input_port = None
        elif self.virtual_mode:
            self.virtual_mode = False
            self.input_port = None
        self.message_queue.clear()
    
    def _message_callback(self, message):
        """Callback for incoming MIDI messages"""
        if hasattr(message, 'bytes'):
            midi_bytes = list(message.bytes())
            self.message_queue.append((midi_bytes, time.time()))
    
    def get_message(self) -> Optional[Tuple[List[int], float]]:
        if self.message_queue:
            return self.message_queue.pop(0)
        return None
    
    def _generate_test_messages(self):
        """Generate test MIDI messages for virtual mode"""
        import random
        import time
        
        # Simulate periodic key presses for testing
        notes = [48, 50, 52, 55, 57, 60, 62, 64]  # C major scale from nanoKEY2 range
        
        while self.virtual_mode and self.input_port == "virtual":
            time.sleep(random.uniform(3, 8))  # Random interval between 3-8 seconds
            
            if not self.virtual_mode:
                break
                
            # Generate a note on/off sequence
            note = random.choice(notes)
            velocity = random.randint(64, 127)
            
            # Note ON (0x90 = note on, channel 0)
            note_on = [0x90, note, velocity]
            self.message_queue.append((note_on, time.time()))
            
            # Wait a bit then Note OFF
            time.sleep(random.uniform(0.1, 0.5))
            
            if self.virtual_mode:  # Check again
                note_off = [0x80, note, 0]  # Note OFF (0x80 = note off)
                self.message_queue.append((note_off, time.time()))

def get_midi_backend() -> Optional[MidiBackend]:
    """Get the best available MIDI backend"""
    
    # Force Mido for WSL compatibility
    import os
    if os.environ.get('WSL_DISTRO_NAME'):
        print("WSL detected, using Mido backend")
        try:
            backend = MidoBackend()
            print("Using Mido backend")
            return backend
        except Exception as e:
            print(f"Mido backend failed: {e}")
            return None
    
    # Try RTMidi first (preferred for native systems)
    try:
        backend = RtMidiBackend()
        print("Using RTMidi backend")
        return backend
    except ImportError:
        print("RTMidi not available, trying Mido...")
    except Exception as e:
        print(f"RTMidi backend failed: {e}, trying Mido...")
    
    # Try Mido as fallback
    try:
        backend = MidoBackend()
        print("Using Mido backend")
        return backend
    except ImportError:
        print("Mido not available")
    except Exception as e:
        print(f"Mido backend failed: {e}")
    
    print("No MIDI backends available!")
    return None