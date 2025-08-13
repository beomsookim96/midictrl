# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Installation & Setup
```bash
# Install Node.js dependencies
npm install

# Rebuild native modules for current platform
npm rebuild

# Test MIDI functionality
npm run test-midi

# Test keyboard control (robotjs)
npm run test-robotjs
```

### Running the Application
```bash
npm start                           # Production mode
npm run dev                         # Development mode (with DevTools)
electron .                          # Direct Electron execution
```

### Building & Distribution
```bash
npm run build                       # Build for all platforms
npm run pack                        # Package without distribution
npm run dist                        # Create distributable packages
npm run dist -- --win              # Windows only build
```

### Diagnostic & Testing
```bash
node test-midi.js                   # Test MIDI device detection
node diagnose-midi.js               # Comprehensive MIDI diagnostics
```

## Architecture Overview

**MidiCtrl** is an Electron-based MIDI key mapper for KORG nanoKEY2 controllers with a hybrid architecture:

### Core Components

1. **Electron Main Process** (`src/main.js`):
   - Manages application lifecycle
   - Handles IPC communication with renderer
   - Initializes backend services (MIDI, keyboard control)
   - Profile management and switching

2. **MIDI Handler** (`src/midi/midiHandler.js`):
   - Device detection and connection with retry logic
   - Event processing with MOD button debouncing (300ms)
   - Falls back to virtual mode when hardware unavailable
   - Supports easymidi, jazz-midi, and virtual testing modes

3. **Key Mapper** (`src/core/keyMapper.js`):
   - Dual-profile system (Profile 1/2) with MOD button switching
   - Configuration persistence at `~/.midictrl/config.json`
   - Preset management with default presets
   - Note-to-action mapping resolution

4. **Keyboard Controller** (`src/core/keyboardController.js`):
   - Cross-platform keyboard automation
   - robotjs primary, nut.js fallback, virtual mode as last resort
   - Text input optimization via clipboard
   - Command and application launching support

### Event Flow & Profile System

1. MIDI input → `MidiHandler` processes events
2. MOD button (CC#1) triggers debounced profile switch
3. `KeyMapper` saves current profile, loads new profile mappings
4. Desktop notification confirms profile change
5. Note events resolve to actions based on active profile

### MIDI Connection Handling

The system implements robust connection handling:
- 3 retry attempts with increasing delays (500ms, 1000ms)
- Automatic fallback to virtual mode on failure
- Proper cleanup of existing connections before retry
- Platform-specific error handling (Windows MIDI port conflicts)

### Platform-Specific Considerations

**Windows**:
- Must run from PowerShell/CMD, not WSL2
- MIDI devices inaccessible from WSL2
- May need to rebuild native modules: `npm rebuild`
- Check for DAWs or browsers using MIDI ports

**WSL2 Limitations**:
- Cannot access Windows MIDI devices
- Automatically falls back to virtual mode
- Use Windows batch files for proper execution

### Error Recovery Strategies

1. **MIDI Connection Failures**:
   - Retry with delays
   - Check for port conflicts
   - Fall back to virtual mode

2. **Native Module Issues**:
   - Detect platform mismatches (ELF header errors)
   - Provide platform-specific rebuild instructions
   - Virtual mode as ultimate fallback

3. **Profile Switching**:
   - Debouncing prevents rapid switching
   - State preserved between switches
   - Graceful handling of corrupted config