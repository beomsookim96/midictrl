// Piano Keyboard Module
class PianoKeyboard {
    constructor() {
        this.keys = new Map();
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.pressedKeys = new Set();
        
        this.init();
    }

    init() {
        this.createKeyboard();
        this.setupEventListeners();
    }

    createKeyboard() {
        const container = document.getElementById('piano-keyboard');
        container.innerHTML = '';

        // First, create all white keys with precise positioning
        const whiteKeys = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72];
        whiteKeys.forEach((note, index) => {
            const key = this.createKey(note);
            key.style.left = `${index * 26}px`; // 26px spacing for white keys
            container.appendChild(key);
            this.keys.set(note, key);
        });

        // Then, create all black keys with precise positioning between white keys
        const blackKeys = [49, 51, 54, 56, 58, 61, 63, 66, 68, 70];
        blackKeys.forEach(note => {
            const key = this.createKey(note);
            const position = this.getBlackKeyPosition(note);
            key.style.left = `${position}px`;
            container.appendChild(key);
            this.keys.set(note, key);
        });
    }

    createKey(note) {
        const isBlack = this.isBlackKey(note);
        const key = document.createElement('div');
        
        key.className = `piano-key ${isBlack ? 'black' : 'white'}`;
        key.dataset.note = note;
        
        // Note information
        const noteName = this.getNoteName(note);
        const octave = Math.floor(note / 12) - 2;
        
        // Create note label
        const noteLabel = document.createElement('div');
        noteLabel.className = 'note-label';
        noteLabel.textContent = `${noteName}${octave}`;
        
        // Create mapping label (initially empty)
        const mappingLabel = document.createElement('div');
        mappingLabel.className = 'mapping-label';
        
        key.appendChild(mappingLabel);
        key.appendChild(noteLabel);
        
        // Position black keys
        if (isBlack) {
            const position = this.getBlackKeyPosition(note);
            key.style.left = `${position}px`;
        }
        
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
        // Calculate precise black key positions based on real piano layout
        const whiteKeyWidth = 26; // Matches white key spacing
        
        // Map each black key to its precise position relative to white keys
        // These positions are calculated to center black keys between white keys
        const blackKeyPositions = {
            49: 18,    // C#1 - between C1(0) and D1(26)
            51: 44,    // D#1 - between D1(26) and E1(52)
            54: 96,    // F#1 - between F1(78) and G1(104)
            56: 122,   // G#1 - between G1(104) and A1(130)
            58: 148,   // A#1 - between A1(130) and B1(156)
            61: 200,   // C#2 - between C2(182) and D2(208)
            63: 226,   // D#2 - between D2(208) and E2(234)
            66: 278,   // F#2 - between F2(260) and G2(286)
            68: 304,   // G#2 - between G2(286) and A2(312)
            70: 330,   // A#2 - between A2(312) and B2(338)
        };

        return blackKeyPositions[note] || 0;
    }

    getWhiteKeyPositions() {
        const positions = [];
        let x = 0;
        const whiteKeySpacing = 22;
        
        for (let note = 48; note <= 72; note++) {
            if (!this.isBlackKey(note)) {
                positions.push(x);
                x += whiteKeySpacing;
            }
        }
        
        return positions;
    }

    setupEventListeners() {
        // Handle key clicks
        this.keys.forEach((keyElement, note) => {
            keyElement.addEventListener('click', (e) => {
                e.preventDefault();
                this.onKeyClick(note);
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

    onKeyClick(note) {
        console.log(`Key clicked: ${note} (${this.getNoteName(note)})`);
        
        // Trigger key mapping dialog
        if (window.mappingManager) {
            window.mappingManager.openMappingDialog(note);
        }
        
        // Visual feedback
        this.animateKeyPress(note);
    }

    animateKeyPress(note) {
        const key = this.keys.get(note);
        if (key) {
            key.classList.add('animate-press');
            setTimeout(() => {
                key.classList.remove('animate-press');
            }, 150);
        }
    }

    highlightKey(note, pressed = false, velocity = 64) {
        const key = this.keys.get(note);
        if (!key) return;

        if (pressed) {
            key.classList.add('pressed');
            this.pressedKeys.add(note);
            
            // Add velocity-based styling with better visual feedback
            const velocityClass = Math.ceil(velocity / 32); // 1-4 classes
            key.classList.add(`velocity-${velocityClass}`);
            
            // Add a brief glow effect for better visibility
            key.style.boxShadow = `0 0 15px rgba(255, 255, 255, ${velocity / 127})`;
            
            // Auto-remove after a delay if not explicitly released
            setTimeout(() => {
                if (this.pressedKeys.has(note)) {
                    this.highlightKey(note, false);
                }
            }, 300);
        } else {
            key.classList.remove('pressed');
            key.classList.remove('velocity-1', 'velocity-2', 'velocity-3', 'velocity-4');
            key.style.boxShadow = ''; // Reset custom shadow
            this.pressedKeys.delete(note);
        }
    }

    updateKeyMapping(note, mapping) {
        const key = this.keys.get(note);
        if (!key) return;

        const mappingLabel = key.querySelector('.mapping-label');
        if (mappingLabel) {
            if (mapping) {
                mappingLabel.textContent = this.getMappingDisplayText(mapping);
                mappingLabel.style.display = 'block';
            } else {
                mappingLabel.textContent = '';
                mappingLabel.style.display = 'none';
            }
        }
    }

    getMappingDisplayText(mapping) {
        if (!mapping) return '';

        switch (mapping.mapping_type) {
            case 'single_key':
                return mapping.key || '';
            case 'key_combo':
                const modifiers = mapping.modifiers || [];
                const key = mapping.key || '';
                return modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;
            case 'text_input':
                return mapping.text ? `"${mapping.text.substring(0, 3)}..."` : 'TXT';
            case 'command':
                return 'CMD';
            default:
                return '';
        }
    }

    clearAllMappings() {
        this.keys.forEach((keyElement) => {
            const mappingLabel = keyElement.querySelector('.mapping-label');
            if (mappingLabel) {
                mappingLabel.textContent = '';
                mappingLabel.style.display = 'none';
            }
        });
    }

    updateMappings(mappings) {
        this.clearAllMappings();
        
        if (mappings && mappings.mappings) {
            Object.entries(mappings.mappings).forEach(([noteStr, mapping]) => {
                const note = parseInt(noteStr);
                this.updateKeyMapping(note, mapping);
            });
        }
    }
}

// Initialize piano keyboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pianoKeyboard = new PianoKeyboard();
});