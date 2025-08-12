/**
 * Node.js Key Mapper for MIDI to Keyboard mapping
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const EventEmitter = require('events');

class KeyMapper extends EventEmitter {
    constructor() {
        super();
        this.mappings = {};
        this.profiles = { "Profile 1": {}, "Profile 2": {} };
        this.currentProfile = "Profile 1";
        this.configDir = path.join(os.homedir(), '.midictrl');
        this.configFile = path.join(this.configDir, 'config.json');
        
        this.initConfig();
    }

    async initConfig() {
        try {
            // Create config directory if it doesn't exist
            await fs.mkdir(this.configDir, { recursive: true });
            await this.loadConfig();
        } catch (error) {
            console.log('Creating new config:', error.message);
            this.mappings = {};
        }
    }

    async loadConfig() {
        try {
            const data = await fs.readFile(this.configFile, 'utf8');
            const config = JSON.parse(data);
            this.mappings = config.mappings || {};
            this.profiles = config.profiles || { "Profile 1": {}, "Profile 2": {} };
            this.currentProfile = config.currentProfile || "Profile 1";
            
            // Load current profile mappings
            const currentProfileData = this.profiles[this.currentProfile] || {};
            this.mappings = currentProfileData.mappings || this.mappings;
            
            console.log('Loaded config from:', this.configFile);
            console.log('Current profile:', this.currentProfile);
        } catch (error) {
            console.log('No existing config found, starting fresh');
            this.mappings = {};
            this.profiles = { "Profile 1": {}, "Profile 2": {} };
            this.currentProfile = "Profile 1";
        }
    }

    async saveConfig() {
        try {
            // Update current profile data before saving
            this.profiles[this.currentProfile] = {
                mappings: this.mappings
            };
            
            const config = {
                version: '2.0',
                mappings: this.mappings,
                profiles: this.profiles,
                currentProfile: this.currentProfile,
                lastModified: new Date().toISOString()
            };
            
            await fs.writeFile(
                this.configFile, 
                JSON.stringify(config, null, 2),
                'utf8'
            );
            
            console.log('Config saved to:', this.configFile);
            return true;
        } catch (error) {
            console.error('Failed to save config:', error);
            return false;
        }
    }

    setMapping(note, mapping) {
        if (!mapping) {
            // Delete mapping
            delete this.mappings[note];
        } else {
            // Set or update mapping
            this.mappings[note] = {
                ...mapping,
                note: note,
                created: this.mappings[note]?.created || new Date().toISOString(),
                modified: new Date().toISOString()
            };
        }
        
        this.emit('mapping-changed', { note, mapping: this.mappings[note] });
        this.saveConfig();
        
        return true;
    }

    getMapping(note) {
        return this.mappings[note] || null;
    }

    getAllMappings() {
        return { ...this.mappings };
    }

    clearAllMappings() {
        this.mappings = {};
        this.emit('mappings-cleared');
        this.saveConfig();
        return true;
    }

    switchProfile() {
        // Save current profile data
        this.profiles[this.currentProfile] = {
            mappings: this.mappings
        };
        
        // Switch to the other profile
        if (this.currentProfile === "Profile 1") {
            this.currentProfile = "Profile 2";
        } else {
            this.currentProfile = "Profile 1";
        }
        
        // Load the new profile data
        const profileData = this.profiles[this.currentProfile] || {};
        this.mappings = profileData.mappings || {};
        
        this.emit('profile-switched', this.currentProfile);
        this.saveConfig();
        
        console.log(`Switched to: ${this.currentProfile}`);
        return this.currentProfile;
    }

    async loadPreset(presetName) {
        try {
            const presetFile = path.join(this.configDir, 'presets', `${presetName}.json`);
            const data = await fs.readFile(presetFile, 'utf8');
            const preset = JSON.parse(data);
            
            this.mappings = preset.mappings || {};
            this.emit('preset-loaded', presetName);
            await this.saveConfig();
            
            return true;
        } catch (error) {
            console.error('Failed to load preset:', error);
            return false;
        }
    }

    async savePreset(presetName) {
        try {
            const presetDir = path.join(this.configDir, 'presets');
            await fs.mkdir(presetDir, { recursive: true });
            
            const presetFile = path.join(presetDir, `${presetName}.json`);
            const preset = {
                name: presetName,
                mappings: this.mappings,
                created: new Date().toISOString()
            };
            
            await fs.writeFile(
                presetFile,
                JSON.stringify(preset, null, 2),
                'utf8'
            );
            
            console.log('Preset saved:', presetFile);
            return true;
        } catch (error) {
            console.error('Failed to save preset:', error);
            return false;
        }
    }

    async getAvailablePresets() {
        try {
            const presetDir = path.join(this.configDir, 'presets');
            await fs.mkdir(presetDir, { recursive: true });
            
            const files = await fs.readdir(presetDir);
            const presets = files
                .filter(f => f.endsWith('.json'))
                .map(f => f.replace('.json', ''));
            
            // Add default presets if they don't exist
            await this.installDefaultPresets(presetDir);
            
            return presets;
        } catch (error) {
            console.error('Failed to get presets:', error);
            return [];
        }
    }

    async installDefaultPresets(presetDir) {
        const defaultPresets = {
            'daw-shortcuts': {
                name: 'DAW Shortcuts',
                mappings: {
                    '48': { mapping_type: 'single_key', key: 'space', trigger_mode: 'press' }, // Play/Pause
                    '49': { mapping_type: 'single_key', key: 'r', trigger_mode: 'press' }, // Record
                    '50': { mapping_type: 'key_combo', key: 's', modifiers: ['Ctrl'], trigger_mode: 'press' }, // Save
                    '51': { mapping_type: 'key_combo', key: 'z', modifiers: ['Ctrl'], trigger_mode: 'press' }, // Undo
                    '52': { mapping_type: 'key_combo', key: 'y', modifiers: ['Ctrl'], trigger_mode: 'press' }, // Redo
                }
            },
            'gaming': {
                name: 'Gaming Controls',
                mappings: {
                    '48': { mapping_type: 'single_key', key: 'w', trigger_mode: 'press' },
                    '49': { mapping_type: 'single_key', key: 'a', trigger_mode: 'press' },
                    '50': { mapping_type: 'single_key', key: 's', trigger_mode: 'press' },
                    '51': { mapping_type: 'single_key', key: 'd', trigger_mode: 'press' },
                    '52': { mapping_type: 'single_key', key: 'space', trigger_mode: 'press' },
                    '53': { mapping_type: 'single_key', key: 'shift', trigger_mode: 'press' },
                }
            },
            'chromatic-numbers': {
                name: 'Chromatic Numbers',
                mappings: {}
            },
            'chromatic-letters': {
                name: 'Chromatic Letters', 
                mappings: {}
            }
        };

        // Generate chromatic mappings
        for (let i = 0; i < 25; i++) {
            const note = 48 + i;
            
            // Numbers preset (0-9, then symbols)
            if (i < 10) {
                defaultPresets['chromatic-numbers'].mappings[note] = {
                    mapping_type: 'single_key',
                    key: i.toString(),
                    trigger_mode: 'press'
                };
            }
            
            // Letters preset (a-z)
            if (i < 26) {
                defaultPresets['chromatic-letters'].mappings[note] = {
                    mapping_type: 'single_key',
                    key: String.fromCharCode(97 + i), // a-z
                    trigger_mode: 'press'
                };
            }
        }

        // Install default presets if they don't exist
        for (const [filename, preset] of Object.entries(defaultPresets)) {
            const presetFile = path.join(presetDir, `${filename}.json`);
            try {
                await fs.access(presetFile);
                // File exists, skip
            } catch {
                // File doesn't exist, create it
                await fs.writeFile(
                    presetFile,
                    JSON.stringify(preset, null, 2),
                    'utf8'
                );
                console.log(`Installed default preset: ${filename}`);
            }
        }
    }

    // Get note name for display
    getNoteName(noteNumber) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(noteNumber / 12) - 2;
        const noteName = noteNames[noteNumber % 12];
        return `${noteName}${octave}`;
    }
}

module.exports = KeyMapper;