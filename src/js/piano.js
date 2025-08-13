// Enhanced Piano Keyboard with Octave Support
class PianoKeyboard {
    constructor() {
        this.keys = new Map();
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.pressedKeys = new Set();
        this.currentOctave = 0;
        this.mappings = {};
        
        this.init();
    }

    init() {
        this.createKeyboard();
        this.setupEventListeners();
    }

    createKeyboard() {
        const container = document.getElementById('piano-keyboard');
        if (!container) return;
        
        container.innerHTML = '';

        // Create 25 keys (C1 to C3) - standard nanoKEY2 range
        const startNote = 48; // C1 (MIDI)
        const endNote = 72;   // C3 (MIDI)

        // First, create all white keys
        const whiteKeys = [];
        for (let note = startNote; note <= endNote; note++) {
            if (!this.isBlackKey(note)) {
                whiteKeys.push(note);
            }
        }

        whiteKeys.forEach((note, index) => {
            const key = this.createKey(note);
            key.style.left = `${index * 26}px`;
            container.appendChild(key);
            this.keys.set(note, key);
        });

        // Then, create all black keys
        for (let note = startNote; note <= endNote; note++) {
            if (this.isBlackKey(note)) {
                const key = this.createKey(note);
                const position = this.getBlackKeyPosition(note);
                key.style.left = `${position}px`;
                container.appendChild(key);
                this.keys.set(note, key);
            }
        }
    }

    createKey(note) {
        const isBlack = this.isBlackKey(note);
        const key = document.createElement('div');
        
        key.className = `piano-key ${isBlack ? 'black' : 'white'}`;
        key.dataset.note = note;
        key.dataset.baseNote = note - 48; // 0-based note for mapping
        
        // Note information
        const noteName = this.getNoteName(note);
        const octave = Math.floor(note / 12) - 2;
        
        // Create note label
        const noteLabel = document.createElement('div');
        noteLabel.className = 'note-label';
        noteLabel.textContent = `${noteName}${octave}`;
        
        // Create octave indicator
        const octaveIndicator = document.createElement('div');
        octaveIndicator.className = 'octave-indicator';
        
        // Create mapping indicator
        const mappingIndicator = document.createElement('div');
        mappingIndicator.className = 'mapping-indicator';
        
        // Create mapping label
        const mappingLabel = document.createElement('div');
        mappingLabel.className = 'mapping-label';
        
        key.appendChild(octaveIndicator);
        key.appendChild(mappingLabel);
        key.appendChild(noteLabel);
        
        return key;
    }

    isBlackKey(note) {
        const noteInOctave = note % 12;
        return [1, 3, 6, 8, 10].includes(noteInOctave); // C#, D#, F#, G#, A#
    }

    getNoteName(note) {
        return this.noteNames[note % 12];
    }

    getBlackKeyPosition(note) {
        // Calculate precise black key positions
        const baseWhiteKeyPositions = {
            48: 0,   // C1
            50: 26,  // D1
            52: 52,  // E1
            53: 78,  // F1
            55: 104, // G1
            57: 130, // A1
            59: 156, // B1
            60: 182, // C2
            62: 208, // D2
            64: 234, // E2
            65: 260, // F2
            67: 286, // G2
            69: 312, // A2
            71: 338, // B2
            72: 364  // C3
        };
        
        const blackKeyOffsets = {
            49: 18,  // C#1
            51: 44,  // D#1
            54: 96,  // F#1
            56: 122, // G#1
            58: 148, // A#1
            61: 200, // C#2
            63: 226, // D#2
            66: 278, // F#2
            68: 304, // G#2
            70: 330  // A#2
        };
        
        return blackKeyOffsets[note] || 0;
    }

    setupEventListeners() {
        this.keys.forEach((keyElement, note) => {
            keyElement.addEventListener('click', (e) => {
                e.preventDefault();
                const baseNote = parseInt(keyElement.dataset.baseNote);
                this.onKeyClick(baseNote);
            });

            keyElement.addEventListener('mousedown', (e) => {
                e.preventDefault();
                keyElement.classList.add('active');
            });

            keyElement.addEventListener('mouseup', (e) => {
                e.preventDefault();
                keyElement.classList.remove('active');
            });

            keyElement.addEventListener('mouseleave', (e) => {
                keyElement.classList.remove('active');
            });
        });
    }

    onKeyClick(baseNote) {
        console.log(`Key clicked: ${baseNote} at octave ${this.currentOctave}`);
        
        // Open mapping dialog with current octave
        if (window.app) {
            window.app.openMappingForNote(baseNote);
        } else if (window.mappingManager) {
            window.mappingManager.openMappingDialog(baseNote, this.currentOctave);
        }
        
        // Visual feedback
        this.animateKeyPress(baseNote + 48); // Convert back to MIDI note for animation
    }

    animateKeyPress(midiNote) {
        const key = this.keys.get(midiNote);
        if (key) {
            key.classList.add('animate-press');
            setTimeout(() => {
                key.classList.remove('animate-press');
            }, 150);
        }
    }

    highlightKey(baseNote, pressed = false, velocity = 64) {
        // Convert base note to MIDI note for finding key
        const midiNote = baseNote + 48;
        const key = this.keys.get(midiNote);
        if (!key) return;

        if (pressed) {
            key.classList.add('pressed');
            this.pressedKeys.add(baseNote);
            
            // Velocity-based styling
            const velocityClass = Math.ceil(velocity / 32); // 1-4 classes
            key.classList.add(`velocity-${velocityClass}`);
            
            // Glow effect
            const intensity = velocity / 127;
            key.style.boxShadow = `0 0 15px rgba(76, 175, 80, ${intensity})`;
            
            // Auto-remove after delay
            setTimeout(() => {
                if (this.pressedKeys.has(baseNote)) {
                    this.highlightKey(baseNote, false);
                }
            }, 300);
        } else {
            key.classList.remove('pressed');
            key.classList.remove('velocity-1', 'velocity-2', 'velocity-3', 'velocity-4');
            key.style.boxShadow = '';
            this.pressedKeys.delete(baseNote);
        }
    }

    updateOctave(octave) {
        this.currentOctave = octave;
        
        // Update octave indicators on all keys
        this.keys.forEach((keyElement, midiNote) => {
            const octaveIndicator = keyElement.querySelector('.octave-indicator');
            if (octaveIndicator) {
                if (octave !== 0) {
                    octaveIndicator.textContent = `${octave >= 0 ? '+' : ''}${octave}`;
                    octaveIndicator.style.display = 'block';
                } else {
                    octaveIndicator.style.display = 'none';
                }
            }
        });
        
        // Update mapping indicators for new octave
        this.updateAllMappingIndicators();
    }

    updateKeyMapping(note, octave, mapping) {
        // Find the key that corresponds to this base note
        const midiNote = note + 48; // Convert to MIDI note
        const key = this.keys.get(midiNote);
        if (!key) return;

        const mappingLabel = key.querySelector('.mapping-label');
        const mappingIndicator = key.querySelector('.mapping-indicator');
        
        if (mappingLabel && mappingIndicator) {
            if (mapping && octave === this.currentOctave) {
                // Show mapping for current octave only
                mappingLabel.textContent = this.getMappingDisplayText(mapping);
                mappingLabel.style.display = 'block';
                mappingIndicator.style.display = 'block';
                mappingIndicator.className = `mapping-indicator ${mapping.mapping_type}`;
            } else {
                // Check if there's a mapping for current octave
                const currentOctaveMapping = this.getMappingForCurrentOctave(note);
                if (currentOctaveMapping) {
                    mappingLabel.textContent = this.getMappingDisplayText(currentOctaveMapping);
                    mappingLabel.style.display = 'block';
                    mappingIndicator.style.display = 'block';
                    mappingIndicator.className = `mapping-indicator ${currentOctaveMapping.mapping_type}`;
                } else {
                    mappingLabel.textContent = '';
                    mappingLabel.style.display = 'none';
                    mappingIndicator.style.display = 'none';
                }
            }
        }
    }

    getMappingForCurrentOctave(baseNote) {
        const mappingKey = `${baseNote + (this.currentOctave * 12)}`;
        return this.mappings[mappingKey] || null;
    }

    updateAllMappingIndicators() {
        this.keys.forEach((keyElement, midiNote) => {
            const baseNote = midiNote - 48;
            const mapping = this.getMappingForCurrentOctave(baseNote);
            this.updateKeyMapping(baseNote, this.currentOctave, mapping);
        });
    }

    getMappingDisplayText(mapping) {
        if (!mapping) return '';

        switch (mapping.mapping_type) {
            case 'single_key':
                return mapping.key ? mapping.key.toUpperCase() : '';
            case 'key_combo':
                const modifiers = mapping.modifiers || [];
                const key = mapping.key || '';
                if (modifiers.length > 0) {
                    const shortMods = modifiers.map(m => m.substring(0, 1).toUpperCase());
                    return `${shortMods.join('')}+${key.toUpperCase()}`;
                }
                return key.toUpperCase();
            case 'text_input':
                return mapping.text ? `"${mapping.text.substring(0, 3)}..."` : 'TXT';
            case 'command':
                return 'CMD';
            case 'application':
                return 'APP';
            case 'website':
                return 'WEB';
            default:
                return 'MAP';
        }
    }

    clearAllMappings() {
        this.mappings = {};
        this.keys.forEach((keyElement) => {
            const mappingLabel = keyElement.querySelector('.mapping-label');
            const mappingIndicator = keyElement.querySelector('.mapping-indicator');
            if (mappingLabel) {
                mappingLabel.textContent = '';
                mappingLabel.style.display = 'none';
            }
            if (mappingIndicator) {
                mappingIndicator.style.display = 'none';
            }
        });
    }

    updateMappings(mappingsData) {
        this.mappings = mappingsData.mappings || {};
        this.currentOctave = mappingsData.currentOctave || 0;
        
        // Update octave display
        this.updateOctave(this.currentOctave);
        
        // Update all mapping indicators
        this.updateAllMappingIndicators();
    }

    // Handle MIDI events
    handleMidiEvent(event) {
        if (event.type === 'note') {
            // Convert MIDI note to base note (0-24 range)
            const baseNote = event.note;
            this.highlightKey(baseNote, event.on, event.velocity);
        }
    }
}

// Initialize piano keyboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pianoKeyboard = new PianoKeyboard();
    
    // Connect to app events if available
    if (window.app) {
        // Listen for octave changes
        document.addEventListener('octave-changed', (e) => {
            window.pianoKeyboard.updateOctave(e.detail.octave);
        });
        
        // Listen for mapping changes
        document.addEventListener('mappings-updated', (e) => {
            window.pianoKeyboard.updateMappings(e.detail);
        });
    }
});