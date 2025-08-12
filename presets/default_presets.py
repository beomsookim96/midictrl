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
        },
        
        "chromatic_numbers": {
            "preset_name": "Chromatic Numbers",
            "description": "Map all 25 keys chromatically to numbers and symbols",
            "mappings": {
                # First octave: C1-B1 (notes 48-59)
                "48": {"mapping_type": "single_key", "trigger_mode": "press", "key": "1", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "49": {"mapping_type": "single_key", "trigger_mode": "press", "key": "!", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},  # C#1
                "50": {"mapping_type": "single_key", "trigger_mode": "press", "key": "2", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "51": {"mapping_type": "single_key", "trigger_mode": "press", "key": "@", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},  # D#1
                "52": {"mapping_type": "single_key", "trigger_mode": "press", "key": "3", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "53": {"mapping_type": "single_key", "trigger_mode": "press", "key": "4", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "54": {"mapping_type": "single_key", "trigger_mode": "press", "key": "$", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},  # F#1
                "55": {"mapping_type": "single_key", "trigger_mode": "press", "key": "5", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "56": {"mapping_type": "single_key", "trigger_mode": "press", "key": "%", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},  # G#1
                "57": {"mapping_type": "single_key", "trigger_mode": "press", "key": "6", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "58": {"mapping_type": "single_key", "trigger_mode": "press", "key": "^", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},  # A#1
                "59": {"mapping_type": "single_key", "trigger_mode": "press", "key": "7", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                
                # Second octave: C2-B2 (notes 60-71)
                "60": {"mapping_type": "single_key", "trigger_mode": "press", "key": "8", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "61": {"mapping_type": "single_key", "trigger_mode": "press", "key": "*", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},  # C#2
                "62": {"mapping_type": "single_key", "trigger_mode": "press", "key": "9", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "63": {"mapping_type": "single_key", "trigger_mode": "press", "key": "(", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},  # D#2
                "64": {"mapping_type": "single_key", "trigger_mode": "press", "key": "0", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "65": {"mapping_type": "single_key", "trigger_mode": "press", "key": "-", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "66": {"mapping_type": "single_key", "trigger_mode": "press", "key": "_", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},  # F#2
                "67": {"mapping_type": "single_key", "trigger_mode": "press", "key": "=", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "68": {"mapping_type": "single_key", "trigger_mode": "press", "key": "+", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},  # G#2
                "69": {"mapping_type": "single_key", "trigger_mode": "press", "key": "[", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "70": {"mapping_type": "single_key", "trigger_mode": "press", "key": "{", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},  # A#2
                "71": {"mapping_type": "single_key", "trigger_mode": "press", "key": "]", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                
                # Third octave: C3 (note 72)
                "72": {"mapping_type": "single_key", "trigger_mode": "press", "key": "}", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64}
            },
            "control_mappings": {}
        },
        
        "chromatic_letters": {
            "preset_name": "Chromatic Letters", 
            "description": "Map all 25 keys chromatically to alphabet letters",
            "mappings": {
                # Map to A-Z (25 keys covers A-Y)
                "48": {"mapping_type": "single_key", "trigger_mode": "press", "key": "a", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "49": {"mapping_type": "single_key", "trigger_mode": "press", "key": "b", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "50": {"mapping_type": "single_key", "trigger_mode": "press", "key": "c", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "51": {"mapping_type": "single_key", "trigger_mode": "press", "key": "d", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "52": {"mapping_type": "single_key", "trigger_mode": "press", "key": "e", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "53": {"mapping_type": "single_key", "trigger_mode": "press", "key": "f", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "54": {"mapping_type": "single_key", "trigger_mode": "press", "key": "g", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "55": {"mapping_type": "single_key", "trigger_mode": "press", "key": "h", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "56": {"mapping_type": "single_key", "trigger_mode": "press", "key": "i", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "57": {"mapping_type": "single_key", "trigger_mode": "press", "key": "j", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "58": {"mapping_type": "single_key", "trigger_mode": "press", "key": "k", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "59": {"mapping_type": "single_key", "trigger_mode": "press", "key": "l", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "60": {"mapping_type": "single_key", "trigger_mode": "press", "key": "m", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "61": {"mapping_type": "single_key", "trigger_mode": "press", "key": "n", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "62": {"mapping_type": "single_key", "trigger_mode": "press", "key": "o", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "63": {"mapping_type": "single_key", "trigger_mode": "press", "key": "p", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "64": {"mapping_type": "single_key", "trigger_mode": "press", "key": "q", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "65": {"mapping_type": "single_key", "trigger_mode": "press", "key": "r", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "66": {"mapping_type": "single_key", "trigger_mode": "press", "key": "s", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "67": {"mapping_type": "single_key", "trigger_mode": "press", "key": "t", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "68": {"mapping_type": "single_key", "trigger_mode": "press", "key": "u", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "69": {"mapping_type": "single_key", "trigger_mode": "press", "key": "v", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "70": {"mapping_type": "single_key", "trigger_mode": "press", "key": "w", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "71": {"mapping_type": "single_key", "trigger_mode": "press", "key": "x", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64},
                "72": {"mapping_type": "single_key", "trigger_mode": "press", "key": "y", "modifiers": [], "velocity_sensitive": False, "velocity_threshold": 64}
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