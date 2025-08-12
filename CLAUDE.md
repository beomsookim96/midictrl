# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Installation & Setup
```bash
# Install Node.js dependencies
npm install

# One-command setup (installs everything and starts app)
npm run setup

# Test MIDI functionality
npm run test-midi

# Test keyboard control (robotjs)
npm run test-robotjs

# Windows-specific helpers
node install-windows.js             # Install Windows dependencies
install_windows.bat                  # Batch script installer
fix_robotjs.bat                      # Fix robotjs compilation issues
```

### Running the Application
```bash
npm start                           # Production mode
npm run dev                         # Development mode (with DevTools)

# Alternative Electron commands
electron .                          # Direct Electron execution
electron . --dev                    # Dev mode
```

### Building & Distribution
```bash
npm run build                       # Build for all platforms
npm run pack                        # Package without distribution
npm run dist                        # Create distributable packages

# Platform-specific builds
npm run dist -- --win              # Windows only
npm run dist -- --mac              # macOS only
npm run dist -- --linux            # Linux only
```

### Development & Testing
```bash
# Backend testing
node test-backend.js                # Test Node.js backend
node restart-backend.js             # Restart backend components
node kill-backend.js                # Kill background processes

# MIDI testing
node test-midi.js                   # Test MIDI device detection
node test_robotjs.js                # Test keyboard control
```

## Architecture Overview

### Core Components

**MidiCtrl** is an Electron-based MIDI key mapper for KORG nanoKEY2 controllers with a hybrid architecture:

1. **Frontend Layer** (`src/`):
   - `main.js`: Main Electron process with IPC handlers
   - `preload.js`: Secure IPC bridge between main and renderer
   - `index.html`: Web-based UI
   - `js/`: Frontend JavaScript modules (app.js, piano.js, mapping.js)

2. **Backend Layer** (Node.js modules in `src/`):
   - `core/keyMapper.js`: Configuration management with profile system
   - `core/keyboardController.js`: Cross-platform keyboard automation (robotjs/nut.js)
   - `core/notificationSystem.js`: Desktop notifications for profile switching
   - `midi/midiHandler.js`: MIDI device handling with easymidi


### Key Architecture Patterns

- **Electron Main/Renderer**: Secure IPC communication between processes
- **Event-Driven**: EventEmitter-based architecture for MIDI and keyboard events
- **Profile System**: Dual-profile support with MOD button switching (Profile 1 ↔ Profile 2)
- **Cross-Platform Keyboard Control**: robotjs (primary) with nut.js fallback
- **Virtual Mode**: Graceful degradation when native libraries fail
- **Desktop Notifications**: Native OS notifications for profile changes

### MIDI Event Flow
1. `easymidi` detects MIDI events from nanoKEY2
2. `MidiHandler` processes and emits structured events
3. MOD button (control 1) triggers profile switching
4. `KeyMapper` resolves note → mapping based on current profile
5. `KeyboardController` executes the mapped action
6. Desktop notification shows profile changes

### Mapping Types & Features
- **Enhanced Mapping Types**:
  - `single_key` / `key_combo`: Standard key presses with modifiers
  - `text_input`: Fast text input via clipboard (Ctrl+V) with fallback
  - `command`: System command execution
  - `application`: Cross-platform application launching
  - `website`: URL opening via Electron shell
  - `macro`: Multi-step automation (planned)

- **Profile Management**:
  - Two profiles: "Profile 1" and "Profile 2"
  - MOD button switches profiles with desktop notification
  - Independent mapping configurations per profile
  - Automatic save/restore of profile state

### Configuration Storage
- Main config: `~/.midictrl/config.json`
- Profile data embedded in config with current profile tracking
- Preset system: `~/.midictrl/presets/`
- Settings persist automatically with profile-aware storage

### Error Handling & Fallbacks
- **MIDI Libraries**: easymidi → virtual mode (with fake device simulation)
- **Keyboard Control**: robotjs → nut.js → virtual logging mode
- **Text Input**: clipboard method → character-by-character fallback
- **Profile System**: Graceful handling of missing profile data

### Cross-Platform Considerations
- **Windows**: Uses `start` command for applications, handles robotjs compilation
- **macOS**: Uses `open` command, supports .app bundles
- **Linux**: Uses `xdg-open`, requires audio group membership for MIDI
- **WSL2**: Special handling for Windows subsystem limitations