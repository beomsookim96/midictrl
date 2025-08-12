from PyQt6.QtCore import QObject, pyqtSignal, QThread
from typing import List, Optional, Tuple
import time
from midi.midi_backend import get_midi_backend, MidiBackend

class MidiInputThread(QThread):
    note_received = pyqtSignal(int, int, int)  # channel, note, velocity
    control_change = pyqtSignal(int, int, int)  # channel, control, value
    
    def __init__(self, midi_backend: MidiBackend):
        super().__init__()
        self.midi_backend = midi_backend
        self.running = False
        
    def run(self):
        self.running = True
        while self.running:
            msg = self.midi_backend.get_message()
            if msg:
                message, deltatime = msg
                if len(message) >= 3:
                    status = message[0] & 0xF0
                    channel = message[0] & 0x0F
                    
                    if status == 0x90:  # Note On
                        note = message[1]
                        velocity = message[2]
                        self.note_received.emit(channel, note, velocity)
                    elif status == 0x80:  # Note Off
                        note = message[1]
                        self.note_received.emit(channel, note, 0)
                    elif status == 0xB0:  # Control Change
                        control = message[1]
                        value = message[2]
                        self.control_change.emit(channel, control, value)
            else:
                time.sleep(0.001)
    
    def stop(self):
        self.running = False
        self.wait()

class MidiDeviceManager(QObject):
    device_connected = pyqtSignal(str)
    device_disconnected = pyqtSignal()
    midi_event = pyqtSignal(dict)
    
    def __init__(self):
        super().__init__()
        self.midi_backend = None
        self.midi_thread = None
        self.current_device = None
        
        # Try to initialize MIDI backend
        self.midi_backend = get_midi_backend()
        if not self.midi_backend:
            print("Warning: No MIDI backend available!")
        
    def get_available_devices(self) -> List[Tuple[int, str]]:
        if not self.midi_backend:
            return []
        try:
            return self.midi_backend.get_available_devices()
        except Exception as e:
            print(f"Error getting MIDI devices: {e}")
            return []
    
    def find_nanokey2(self) -> Optional[Tuple[int, str]]:
        devices = self.get_available_devices()
        for port_id, name in devices:
            if 'nanoKEY2' in name or 'nanoKEY 2' in name:
                return (port_id, name)
        return None
    
    def connect_device(self, port_id: int, port_name: str) -> bool:
        if not self.midi_backend:
            print("No MIDI backend available")
            return False
            
        try:
            if self.midi_thread:
                self.disconnect_device()
            
            if self.midi_backend.open_device(port_id):
                self.midi_thread = MidiInputThread(self.midi_backend)
                self.midi_thread.note_received.connect(self._handle_note)
                self.midi_thread.control_change.connect(self._handle_control)
                self.midi_thread.start()
                
                self.current_device = port_name
                self.device_connected.emit(port_name)
                return True
            else:
                print(f"Failed to open MIDI device: {port_name}")
                return False
                
        except Exception as e:
            print(f"Failed to connect to MIDI device: {e}")
            return False
    
    def disconnect_device(self):
        if self.midi_thread:
            self.midi_thread.stop()
            self.midi_thread = None
            
        if self.midi_backend:
            self.midi_backend.close_device()
            
        self.current_device = None
        self.device_disconnected.emit()
    
    def _handle_note(self, channel: int, note: int, velocity: int):
        self.midi_event.emit({
            'type': 'note',
            'channel': channel,
            'note': note,
            'velocity': velocity
        })
    
    def _handle_control(self, channel: int, control: int, value: int):
        self.midi_event.emit({
            'type': 'control',
            'channel': channel,
            'control': control,
            'value': value
        })