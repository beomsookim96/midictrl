from dataclasses import dataclass, field
from typing import Dict, List, Optional, Union
from enum import Enum
import json
from pathlib import Path

class MappingType(Enum):
    SINGLE_KEY = "single_key"
    KEY_COMBO = "key_combo"
    TEXT_INPUT = "text_input"
    COMMAND = "command"
    MACRO = "macro"

class TriggerMode(Enum):
    PRESS = "press"      # Trigger on key press
    RELEASE = "release"  # Trigger on key release
    TOGGLE = "toggle"    # Toggle state on press
    HOLD = "hold"        # Active while held

@dataclass
class KeyMapping:
    mapping_type: MappingType
    trigger_mode: TriggerMode = TriggerMode.PRESS
    key: Optional[str] = None
    modifiers: List[str] = field(default_factory=list)
    text: Optional[str] = None
    command: Optional[str] = None
    macro_steps: List[Dict] = field(default_factory=list)
    velocity_sensitive: bool = False
    velocity_threshold: int = 64
    
    def to_dict(self) -> Dict:
        return {
            'mapping_type': self.mapping_type.value,
            'trigger_mode': self.trigger_mode.value,
            'key': self.key,
            'modifiers': self.modifiers,
            'text': self.text,
            'command': self.command,
            'macro_steps': self.macro_steps,
            'velocity_sensitive': self.velocity_sensitive,
            'velocity_threshold': self.velocity_threshold
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'KeyMapping':
        data['mapping_type'] = MappingType(data['mapping_type'])
        data['trigger_mode'] = TriggerMode(data.get('trigger_mode', 'press'))
        return cls(**data)

class KeyMapperConfig:
    def __init__(self, config_path: Path = None):
        self.config_path = config_path or Path.home() / ".midictrl" / "config.json"
        self.mappings: Dict[int, KeyMapping] = {}  # MIDI note -> KeyMapping
        self.control_mappings: Dict[int, KeyMapping] = {}  # Control number -> KeyMapping
        self.preset_name: str = "Default"
        self.load()
    
    def set_note_mapping(self, note: int, mapping: KeyMapping):
        self.mappings[note] = mapping
        self.save()
    
    def set_control_mapping(self, control: int, mapping: KeyMapping):
        self.control_mappings[control] = mapping
        self.save()
    
    def get_note_mapping(self, note: int) -> Optional[KeyMapping]:
        return self.mappings.get(note)
    
    def get_control_mapping(self, control: int) -> Optional[KeyMapping]:
        return self.control_mappings.get(control)
    
    def clear_note_mapping(self, note: int):
        if note in self.mappings:
            del self.mappings[note]
            self.save()
    
    def clear_control_mapping(self, control: int):
        if control in self.control_mappings:
            del self.control_mappings[control]
            self.save()
    
    def save(self):
        data = {
            'preset_name': self.preset_name,
            'mappings': {str(k): v.to_dict() for k, v in self.mappings.items()},
            'control_mappings': {str(k): v.to_dict() for k, v in self.control_mappings.items()}
        }
        self.config_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.config_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load(self):
        if not self.config_path.exists():
            return
        
        try:
            with open(self.config_path, 'r') as f:
                data = json.load(f)
            
            self.preset_name = data.get('preset_name', 'Default')
            self.mappings = {
                int(k): KeyMapping.from_dict(v) 
                for k, v in data.get('mappings', {}).items()
            }
            self.control_mappings = {
                int(k): KeyMapping.from_dict(v)
                for k, v in data.get('control_mappings', {}).items()
            }
        except Exception as e:
            print(f"Failed to load config: {e}")
    
    def save_preset(self, path: Path):
        data = {
            'preset_name': self.preset_name,
            'mappings': {str(k): v.to_dict() for k, v in self.mappings.items()},
            'control_mappings': {str(k): v.to_dict() for k, v in self.control_mappings.items()}
        }
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load_preset(self, path: Path):
        try:
            with open(path, 'r') as f:
                data = json.load(f)
            
            self.preset_name = data.get('preset_name', 'Custom')
            self.mappings = {
                int(k): KeyMapping.from_dict(v)
                for k, v in data.get('mappings', {}).items()
            }
            self.control_mappings = {
                int(k): KeyMapping.from_dict(v)
                for k, v in data.get('control_mappings', {}).items()
            }
            self.save()
        except Exception as e:
            print(f"Failed to load preset: {e}")