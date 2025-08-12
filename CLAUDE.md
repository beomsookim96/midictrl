# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Installation & Setup
```bash
# Install dependencies
python install.py                    # Cross-platform installer
# or
pip install PyQt6 pynput PyYAML mido

# Test installation
python test_install.py

# Windows-specific
install.bat                          # Windows batch installer
```

### Running the Application
```bash
python main.py                       # Main entry point
# or
python run.py                        # Launcher script

# Windows
run.bat                              # Windows batch launcher
```

### Development & Testing
```bash
# Test MIDI device detection and module imports
python test_install.py

# Manual module testing (from test_install.py)
python -c "from midi.midi_backend import get_midi_backend; print('Backend OK')"
```

## Architecture Overview

### Core Components

**MidiCtrl** is a PyQt6-based MIDI key mapper for KORG nanoKEY2 controllers. The architecture follows a modular design:

1. **MIDI Layer** (`midi/`):
   - `device_manager.py`: Handles MIDI device connection/detection with threading
   - `midi_backend.py`: Abstraction layer supporting both RTMidi and Mido backends
   - Auto-detects nanoKEY2 devices by name pattern matching

2. **Core Logic** (`core/`):
   - `key_mapper.py`: Mapping configuration with support for multiple mapping types (single key, combos, text, commands, macros) and trigger modes (press/release/toggle/hold)
   - `keyboard_controller.py`: Executes mapped actions using pynput for cross-platform keyboard simulation

3. **UI Layer** (`ui/`):
   - `main_window.py`: Main application window with device selection and mapping management
   - `nanokey_widget.py`: Visual representation of nanoKEY2 with clickable keys
   - `mapping_dialog.py`: Configuration dialog for key mappings
   - `qt_compat.py`: PyQt6 compatibility helpers

4. **Presets** (`presets/`):
   - `default_presets.py`: Installs default preset files for DAW, gaming, text editing, and function keys

### Key Architecture Patterns

- **Threading**: MIDI input runs in separate `QThread` to prevent UI blocking
- **Signal/Slot**: PyQt signals connect MIDI events to mapping execution
- **Configuration**: JSON-based config with automatic save/load to `~/.midictrl/`
- **Backend Abstraction**: Supports both RTMidi (performance) and Mido (compatibility) through unified interface
- **Preset System**: JSON-based preset files that can be saved/loaded for different use cases

### MIDI Note Mapping
- nanoKEY2 provides 25 keys (C1-C3, MIDI notes 48-72)
- Control buttons: Octave +/-, Pitch +/-, Mod, Sustain
- Each key/control can map to different action types with various trigger modes

### Configuration Storage
- User config: `~/.midictrl/config.json`
- Presets: `~/.midictrl/presets/`
- Settings persist between sessions automatically

### Error Handling
- Graceful fallback from RTMidi to Mido if compilation fails
- MIDI device connection resilience with auto-reconnect attempts
- UI remains responsive even when MIDI backend is unavailable