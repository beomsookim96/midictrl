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
        except ImportError:
            self.available = False
            raise ImportError("mido not available")
    
    def get_available_devices(self) -> List[Tuple[int, str]]:
        if not self.available:
            return []
            
        ports = self.mido.get_input_names()
        return [(i, name) for i, name in enumerate(ports)]
    
    def open_device(self, port_id: int) -> bool:
        try:
            if self.input_port:
                self.close_device()
            
            ports = self.mido.get_input_names()
            if port_id < len(ports):
                port_name = ports[port_id]
                self.input_port = self.mido.open_input(port_name, callback=self._message_callback)
                return True
            return False
        except Exception as e:
            print(f"Failed to open Mido device: {e}")
            return False
    
    def close_device(self):
        if self.input_port:
            self.input_port.close()
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

def get_midi_backend() -> Optional[MidiBackend]:
    """Get the best available MIDI backend"""
    
    # Try RTMidi first (preferred)
    try:
        return RtMidiBackend()
    except ImportError:
        print("RTMidi not available, trying Mido...")
    
    # Try Mido as fallback
    try:
        return MidoBackend()
    except ImportError:
        print("Mido not available")
    
    print("No MIDI backends available!")
    return None