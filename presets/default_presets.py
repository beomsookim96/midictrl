import json
from pathlib import Path

def create_default_presets():
    """Create default preset files"""
    
    presets = {
        "daw_shortcuts": {
            "preset_name": "DAW Shortcuts",
            "description": "Common shortcuts for Digital Audio Workstations",
            "mappings": {
                "48": {  # C1
                    "mapping_type": "single_key",
                    "trigger_mode": "press",
                    "key": "Space",
                    "modifiers": [],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "50": {  # D1 - Play/Pause
                    "mapping_type": "single_key",
                    "trigger_mode": "press",
                    "key": "p",
                    "modifiers": [],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "52": {  # E1 - Stop
                    "mapping_type": "single_key",
                    "trigger_mode": "press",
                    "key": "s",
                    "modifiers": [],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "53": {  # F1 - Record
                    "mapping_type": "single_key",
                    "trigger_mode": "press",
                    "key": "r",
                    "modifiers": [],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "55": {  # G1 - Save
                    "mapping_type": "single_key",
                    "trigger_mode": "press",
                    "key": "s",
                    "modifiers": ["Ctrl"],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "57": {  # A1 - Undo
                    "mapping_type": "single_key",
                    "trigger_mode": "press",
                    "key": "z",
                    "modifiers": ["Ctrl"],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "59": {  # B1 - Redo
                    "mapping_type": "single_key",
                    "trigger_mode": "press",
                    "key": "y",
                    "modifiers": ["Ctrl"],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                }
            },
            "control_mappings": {}
        },
        
        "gaming_controls": {
            "preset_name": "Gaming Controls",
            "description": "WASD movement and common gaming keys",
            "mappings": {
                "48": {  # C1 - W (forward)
                    "mapping_type": "single_key",
                    "trigger_mode": "hold",
                    "key": "w",
                    "modifiers": [],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "50": {  # D1 - A (left)
                    "mapping_type": "single_key",
                    "trigger_mode": "hold",
                    "key": "a",
                    "modifiers": [],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "52": {  # E1 - S (backward)
                    "mapping_type": "single_key",
                    "trigger_mode": "hold",
                    "key": "s",
                    "modifiers": [],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "53": {  # F1 - D (right)
                    "mapping_type": "single_key",
                    "trigger_mode": "hold",
                    "key": "d",
                    "modifiers": [],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "55": {  # G1 - Space (jump)
                    "mapping_type": "single_key",
                    "trigger_mode": "press",
                    "key": "Space",
                    "modifiers": [],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "57": {  # A1 - Shift (run)
                    "mapping_type": "single_key",
                    "trigger_mode": "hold",
                    "key": "Shift_L",
                    "modifiers": [],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "59": {  # B1 - Ctrl (crouch)
                    "mapping_type": "single_key",
                    "trigger_mode": "hold",
                    "key": "Ctrl_L",
                    "modifiers": [],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "60": {  # C2 - E (interact)
                    "mapping_type": "single_key",
                    "trigger_mode": "press",
                    "key": "e",
                    "modifiers": [],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                }
            },
            "control_mappings": {}
        },
        
        "text_shortcuts": {
            "preset_name": "Text Shortcuts",
            "description": "Common text editing and navigation shortcuts",
            "mappings": {
                "48": {  # C1 - Copy
                    "mapping_type": "single_key",
                    "trigger_mode": "press",
                    "key": "c",
                    "modifiers": ["Ctrl"],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "50": {  # D1 - Paste
                    "mapping_type": "single_key",
                    "trigger_mode": "press",
                    "key": "v",
                    "modifiers": ["Ctrl"],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "52": {  # E1 - Select All
                    "mapping_type": "single_key",
                    "trigger_mode": "press",
                    "key": "a",
                    "modifiers": ["Ctrl"],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "53": {  # F1 - Find
                    "mapping_type": "single_key",
                    "trigger_mode": "press",
                    "key": "f",
                    "modifiers": ["Ctrl"],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "55": {  # G1 - New Tab
                    "mapping_type": "single_key",
                    "trigger_mode": "press",
                    "key": "t",
                    "modifiers": ["Ctrl"],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                },
                "57": {  # A1 - Close Tab
                    "mapping_type": "single_key",
                    "trigger_mode": "press",
                    "key": "w",
                    "modifiers": ["Ctrl"],
                    "velocity_sensitive": False,
                    "velocity_threshold": 64
                }
            },
            "control_mappings": {}
        },
        
        "function_keys": {
            "preset_name": "Function Keys",
            "description": "Map keys to F1-F12 function keys",
            "mappings": {
                "48": {"mapping_type": "single_key", "trigger_mode": "press", "key": "F1", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "49": {"mapping_type": "single_key", "trigger_mode": "press", "key": "F2", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "50": {"mapping_type": "single_key", "trigger_mode": "press", "key": "F3", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "51": {"mapping_type": "single_key", "trigger_mode": "press", "key": "F4", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "52": {"mapping_type": "single_key", "trigger_mode": "press", "key": "F5", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "53": {"mapping_type": "single_key", "trigger_mode": "press", "key": "F6", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "54": {"mapping_type": "single_key", "trigger_mode": "press", "key": "F7", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "55": {"mapping_type": "single_key", "trigger_mode": "press", "key": "F8", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "56": {"mapping_type": "single_key", "trigger_mode": "press", "key": "F9", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "57": {"mapping_type": "single_key", "trigger_mode": "press", "key": "F10", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "58": {"mapping_type": "single_key", "trigger_mode": "press", "key": "F11", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "59": {"mapping_type": "single_key", "trigger_mode": "press", "key": "F12", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64}
            },
            "control_mappings": {}
        }
    }
    
    return presets

def install_default_presets(config_dir: Path):
    """Install default presets to the config directory"""
    presets_dir = config_dir / "presets"
    presets_dir.mkdir(parents=True, exist_ok=True)
    
    presets = create_default_presets()
    
    for preset_name, preset_data in presets.items():
        preset_path = presets_dir / f"{preset_name}.json"
        if not preset_path.exists():  # Don't overwrite existing presets
            with open(preset_path, 'w') as f:
                json.dump(preset_data, f, indent=2)
    
    return presets_dir