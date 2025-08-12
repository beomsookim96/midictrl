import time
import subprocess
from typing import Dict, Set
from pynput.keyboard import Key, Controller as PynputController, Listener
from pynput import mouse
from PyQt6.QtCore import QObject, QTimer
from core.key_mapper import KeyMapperConfig, KeyMapping, MappingType, TriggerMode

class KeyboardController(QObject):
    def __init__(self, config: KeyMapperConfig):
        super().__init__()
        self.config = config
        self.keyboard = PynputController()
        self.mouse = mouse.Controller()
        self.running = False
        
        # Track key states for hold/toggle modes
        self.held_keys: Dict[int, bool] = {}  # MIDI note -> held state
        self.toggled_keys: Dict[int, bool] = {}  # MIDI note -> toggle state
        self.pressed_keys: Set[str] = set()  # Currently pressed physical keys
        
        # Timer for releasing held keys
        self.release_timer = QTimer()
        self.release_timer.timeout.connect(self._check_held_keys)
        self.release_timer.setInterval(50)
        
    def start(self):
        self.running = True
        self.release_timer.start()
        
    def stop(self):
        self.running = False
        self.release_timer.stop()
        self._release_all_held_keys()
        
    def handle_midi_event(self, event: Dict):
        if not self.running:
            return
            
        if event['type'] == 'note':
            self._handle_note_event(event)
        elif event['type'] == 'control':
            self._handle_control_event(event)
            
    def _handle_note_event(self, event: Dict):
        note = event['note']
        velocity = event['velocity']
        is_press = velocity > 0
        
        mapping = self.config.get_note_mapping(note)
        if not mapping:
            return
            
        # Check velocity threshold
        if mapping.velocity_sensitive and velocity < mapping.velocity_threshold:
            return
            
        self._execute_mapping(note, mapping, is_press, velocity)
        
    def _handle_control_event(self, event: Dict):
        control = event['control']
        value = event['value']
        
        mapping = self.config.get_control_mapping(control)
        if not mapping:
            return
            
        # Treat control change as press/release based on value
        is_press = value > 63
        
        self._execute_mapping(control, mapping, is_press, value)
        
    def _execute_mapping(self, input_id: int, mapping: KeyMapping, is_press: bool, velocity: int):
        if mapping.trigger_mode == TriggerMode.PRESS and not is_press:
            return
        elif mapping.trigger_mode == TriggerMode.RELEASE and is_press:
            return
        elif mapping.trigger_mode == TriggerMode.TOGGLE:
            if not is_press:  # Only toggle on key press
                return
            self.toggled_keys[input_id] = not self.toggled_keys.get(input_id, False)
            if not self.toggled_keys[input_id]:
                self._release_mapping(input_id, mapping)
                return
        elif mapping.trigger_mode == TriggerMode.HOLD:
            if is_press:
                self.held_keys[input_id] = True
            else:
                self.held_keys[input_id] = False
                self._release_mapping(input_id, mapping)
                return
                
        # Execute the mapping
        if mapping.mapping_type == MappingType.SINGLE_KEY:
            self._execute_key_mapping(mapping, velocity)
        elif mapping.mapping_type == MappingType.KEY_COMBO:
            self._execute_key_mapping(mapping, velocity)
        elif mapping.mapping_type == MappingType.TEXT_INPUT:
            self._execute_text_mapping(mapping)
        elif mapping.mapping_type == MappingType.COMMAND:
            self._execute_command_mapping(mapping)
        elif mapping.mapping_type == MappingType.MACRO:
            self._execute_macro_mapping(mapping)
            
    def _execute_key_mapping(self, mapping: KeyMapping, velocity: int = 127):
        try:
            # Press modifiers first
            pressed_modifiers = []
            for modifier in mapping.modifiers:
                if modifier.lower() == 'ctrl':
                    self.keyboard.press(Key.ctrl)
                    pressed_modifiers.append(Key.ctrl)
                elif modifier.lower() == 'shift':
                    self.keyboard.press(Key.shift)
                    pressed_modifiers.append(Key.shift)
                elif modifier.lower() == 'alt':
                    self.keyboard.press(Key.alt)
                    pressed_modifiers.append(Key.alt)
                elif modifier.lower() == 'meta':
                    self.keyboard.press(Key.cmd)
                    pressed_modifiers.append(Key.cmd)
                    
            # Press the main key
            key_to_press = self._get_key_object(mapping.key)
            if key_to_press:
                self.keyboard.press(key_to_press)
                
                # For hold mode, don't release immediately
                if mapping.trigger_mode != TriggerMode.HOLD:
                    time.sleep(0.05)  # Brief hold
                    self.keyboard.release(key_to_press)
                    
                    # Release modifiers
                    for mod in reversed(pressed_modifiers):
                        self.keyboard.release(mod)
            
        except Exception as e:
            print(f"Error executing key mapping: {e}")
            
    def _release_mapping(self, input_id: int, mapping: KeyMapping):
        if mapping.mapping_type in [MappingType.SINGLE_KEY, MappingType.KEY_COMBO]:
            try:
                key_to_release = self._get_key_object(mapping.key)
                if key_to_release:
                    self.keyboard.release(key_to_release)
                    
                # Release modifiers
                for modifier in reversed(mapping.modifiers):
                    if modifier.lower() == 'ctrl':
                        self.keyboard.release(Key.ctrl)
                    elif modifier.lower() == 'shift':
                        self.keyboard.release(Key.shift)
                    elif modifier.lower() == 'alt':
                        self.keyboard.release(Key.alt)
                    elif modifier.lower() == 'meta':
                        self.keyboard.release(Key.cmd)
            except Exception as e:
                print(f"Error releasing key mapping: {e}")
                
    def _execute_text_mapping(self, mapping: KeyMapping):
        try:
            if mapping.text:
                self.keyboard.type(mapping.text)
        except Exception as e:
            print(f"Error executing text mapping: {e}")
            
    def _execute_command_mapping(self, mapping: KeyMapping):
        try:
            if mapping.command:
                subprocess.Popen(mapping.command, shell=True)
        except Exception as e:
            print(f"Error executing command mapping: {e}")
            
    def _execute_macro_mapping(self, mapping: KeyMapping):
        # TODO: Implement macro execution
        pass
        
    def _get_key_object(self, key_name: str):
        """Convert key name string to pynput Key object"""
        if not key_name:
            return None
            
        # Special keys
        special_keys = {
            'Space': Key.space,
            'Enter': Key.enter,
            'Return': Key.enter,
            'Tab': Key.tab,
            'Escape': Key.esc,
            'Esc': Key.esc,
            'Backspace': Key.backspace,
            'Delete': Key.delete,
            'Home': Key.home,
            'End': Key.end,
            'Page_Up': Key.page_up,
            'Page_Down': Key.page_down,
            'Up': Key.up,
            'Down': Key.down,
            'Left': Key.left,
            'Right': Key.right,
            'F1': Key.f1, 'F2': Key.f2, 'F3': Key.f3, 'F4': Key.f4,
            'F5': Key.f5, 'F6': Key.f6, 'F7': Key.f7, 'F8': Key.f8,
            'F9': Key.f9, 'F10': Key.f10, 'F11': Key.f11, 'F12': Key.f12,
        }
        
        if key_name in special_keys:
            return special_keys[key_name]
        elif len(key_name) == 1:
            return key_name.lower()
        else:
            # Try to return the string as-is for other cases
            return key_name.lower()
            
    def _check_held_keys(self):
        """Check and release keys that should no longer be held"""
        for input_id, held in list(self.held_keys.items()):
            if not held:
                mapping = (self.config.get_note_mapping(input_id) or 
                          self.config.get_control_mapping(input_id))
                if mapping:
                    self._release_mapping(input_id, mapping)
                del self.held_keys[input_id]
                
    def _release_all_held_keys(self):
        """Release all currently held keys"""
        for input_id in list(self.held_keys.keys()):
            mapping = (self.config.get_note_mapping(input_id) or 
                      self.config.get_control_mapping(input_id))
            if mapping:
                self._release_mapping(input_id, mapping)
        self.held_keys.clear()
        self.toggled_keys.clear()