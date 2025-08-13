/**
 * Enhanced Key Mapper with Extended Octave Range and Advanced Profile Management
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const EventEmitter = require('events');

class KeyMapper extends EventEmitter {
    constructor() {
        super();
        this.mappings = {};
        this.profiles = {};
        this.currentProfile = "Default";
        this.profileCycleList = ["Default"]; // Profiles to cycle through with MOD button
        this.currentOctave = 0; // Current octave shift (-3 to +3)
        this.controlMappings = {}; // Mappings for Pitch/Sustain buttons
        
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
            this.createDefaultProfile();
        }
    }

    createDefaultProfile() {
        this.profiles = {
            "Default": {
                mappings: {},
                controlMappings: {},
                description: "Default profile"
            }
        };
        this.currentProfile = "Default";
        this.profileCycleList = ["Default"];
        this.mappings = {};
        this.controlMappings = {};
    }

    async loadConfig() {
        try {
            const data = await fs.readFile(this.configFile, 'utf8');
            const config = JSON.parse(data);
            
            // Load profiles with backward compatibility
            if (config.profiles) {
                this.profiles = config.profiles;
                // Ensure all profiles have required structure
                Object.keys(this.profiles).forEach(name => {
                    if (!this.profiles[name].mappings) {
                        this.profiles[name] = {
                            mappings: this.profiles[name],
                            controlMappings: {},
                            description: ""
                        };
                    }
                });
            } else {
                this.createDefaultProfile();
            }
            
            this.currentProfile = config.currentProfile || "Default";
            this.profileCycleList = config.profileCycleList || Object.keys(this.profiles);
            this.currentOctave = config.currentOctave || 0;
            
            // Ensure current profile exists
            if (!this.profiles[this.currentProfile]) {
                this.currentProfile = Object.keys(this.profiles)[0] || "Default";
                if (!this.profiles[this.currentProfile]) {
                    this.createDefaultProfile();
                }
            }
            
            // Load current profile data
            const currentProfileData = this.profiles[this.currentProfile];
            this.mappings = currentProfileData.mappings || {};
            this.controlMappings = currentProfileData.controlMappings || {};
            
            console.log('Loaded config from:', this.configFile);
            console.log('Current profile:', this.currentProfile);
            console.log('Available profiles:', Object.keys(this.profiles));
            console.log('Profile cycle list:', this.profileCycleList);
            
        } catch (error) {
            console.log('No existing config found, starting fresh');
            this.createDefaultProfile();
        }
    }

    async saveConfig() {
        try {
            // Update current profile data before saving
            if (this.profiles[this.currentProfile]) {
                this.profiles[this.currentProfile] = {
                    mappings: this.mappings,
                    controlMappings: this.controlMappings,
                    description: this.profiles[this.currentProfile].description || ""
                };
            }
            
            const config = {
                version: '3.0',
                profiles: this.profiles,
                currentProfile: this.currentProfile,
                profileCycleList: this.profileCycleList,
                currentOctave: this.currentOctave,
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

    // Extended octave support: Map MIDI note with octave shift
    getMappingWithOctave(note, octave = 0) {
        // Apply octave shift to the note
        const shiftedNote = note + (octave * 12);
        
        // Create a key that includes octave information
        const mappingKey = `${shiftedNote}`;
        
        return this.mappings[mappingKey] || null;
    }

    setMappingWithOctave(note, octave, mapping) {
        const shiftedNote = note + (octave * 12);
        const mappingKey = `${shiftedNote}`;
        
        if (!mapping) {
            delete this.mappings[mappingKey];
        } else {
            this.mappings[mappingKey] = {
                ...mapping,
                note: note,
                octave: octave,
                actualNote: shiftedNote,
                created: this.mappings[mappingKey]?.created || new Date().toISOString(),
                modified: new Date().toISOString()
            };
        }
        
        this.emit('mapping-changed', { 
            note, 
            octave, 
            mapping: this.mappings[mappingKey] 
        });
        this.saveConfig();
        
        return true;
    }

    // Control button mappings (Pitch Up/Down, Sustain)
    setControlMapping(controlType, mapping) {
        if (!mapping) {
            delete this.controlMappings[controlType];
        } else {
            this.controlMappings[controlType] = {
                ...mapping,
                control: controlType,
                created: this.controlMappings[controlType]?.created || new Date().toISOString(),
                modified: new Date().toISOString()
            };
        }
        
        this.emit('control-mapping-changed', { 
            control: controlType, 
            mapping: this.controlMappings[controlType] 
        });
        this.saveConfig();
        
        return true;
    }

    getControlMapping(controlType) {
        return this.controlMappings[controlType] || null;
    }

    // Profile CRUD operations
    createProfile(name, description = "") {
        if (this.profiles[name]) {
            return { success: false, error: 'Profile already exists' };
        }
        
        this.profiles[name] = {
            mappings: {},
            controlMappings: {},
            description: description
        };
        
        this.emit('profile-created', name);
        this.saveConfig();
        
        return { success: true };
    }

    updateProfile(oldName, newName, description) {
        if (!this.profiles[oldName]) {
            return { success: false, error: 'Profile not found' };
        }
        
        if (oldName !== newName && this.profiles[newName]) {
            return { success: false, error: 'New profile name already exists' };
        }
        
        if (oldName !== newName) {
            // Rename profile
            this.profiles[newName] = this.profiles[oldName];
            delete this.profiles[oldName];
            
            // Update current profile if needed
            if (this.currentProfile === oldName) {
                this.currentProfile = newName;
            }
            
            // Update cycle list
            const cycleIndex = this.profileCycleList.indexOf(oldName);
            if (cycleIndex !== -1) {
                this.profileCycleList[cycleIndex] = newName;
            }
        }
        
        if (description !== undefined) {
            this.profiles[newName || oldName].description = description;
        }
        
        this.emit('profile-updated', { oldName, newName: newName || oldName });
        this.saveConfig();
        
        return { success: true };
    }

    deleteProfile(name) {
        if (!this.profiles[name]) {
            return { success: false, error: 'Profile not found' };
        }
        
        if (Object.keys(this.profiles).length === 1) {
            return { success: false, error: 'Cannot delete the last profile' };
        }
        
        delete this.profiles[name];
        
        // Remove from cycle list
        this.profileCycleList = this.profileCycleList.filter(p => p !== name);
        
        // Switch to another profile if current was deleted
        if (this.currentProfile === name) {
            this.currentProfile = Object.keys(this.profiles)[0];
            this.loadProfile(this.currentProfile);
        }
        
        this.emit('profile-deleted', name);
        this.saveConfig();
        
        return { success: true };
    }

    duplicateProfile(sourceName, newName) {
        if (!this.profiles[sourceName]) {
            return { success: false, error: 'Source profile not found' };
        }
        
        if (this.profiles[newName]) {
            return { success: false, error: 'Profile name already exists' };
        }
        
        // Deep copy the profile
        this.profiles[newName] = JSON.parse(JSON.stringify(this.profiles[sourceName]));
        this.profiles[newName].description = `Copy of ${sourceName}`;
        
        this.emit('profile-duplicated', { source: sourceName, new: newName });
        this.saveConfig();
        
        return { success: true };
    }

    // Profile cycling configuration
    setProfileCycleList(profileNames) {
        // Validate that all profiles exist
        const validProfiles = profileNames.filter(name => this.profiles[name]);
        
        if (validProfiles.length === 0) {
            return { success: false, error: 'No valid profiles in cycle list' };
        }
        
        this.profileCycleList = validProfiles;
        this.emit('cycle-list-changed', this.profileCycleList);
        this.saveConfig();
        
        return { success: true };
    }

    // Enhanced profile switching with cycle support
    switchProfile(direction = 'next') {
        // Save current profile data
        if (this.profiles[this.currentProfile]) {
            this.profiles[this.currentProfile] = {
                mappings: this.mappings,
                controlMappings: this.controlMappings,
                description: this.profiles[this.currentProfile].description || ""
            };
        }
        
        // Find current position in cycle list
        let currentIndex = this.profileCycleList.indexOf(this.currentProfile);
        if (currentIndex === -1) {
            // Current profile not in cycle list, add it
            this.profileCycleList.push(this.currentProfile);
            currentIndex = this.profileCycleList.length - 1;
        }
        
        // Calculate next profile index
        let nextIndex;
        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % this.profileCycleList.length;
        } else if (direction === 'previous') {
            nextIndex = (currentIndex - 1 + this.profileCycleList.length) % this.profileCycleList.length;
        } else if (typeof direction === 'string') {
            // Direct profile name
            if (this.profiles[direction]) {
                return this.loadProfile(direction);
            } else {
                return this.currentProfile;
            }
        }
        
        const nextProfile = this.profileCycleList[nextIndex];
        return this.loadProfile(nextProfile);
    }

    loadProfile(profileName) {
        if (!this.profiles[profileName]) {
            console.error(`Profile "${profileName}" not found`);
            return this.currentProfile;
        }
        
        // Save current profile before switching
        if (this.profiles[this.currentProfile]) {
            this.profiles[this.currentProfile] = {
                mappings: this.mappings,
                controlMappings: this.controlMappings,
                description: this.profiles[this.currentProfile].description || ""
            };
        }
        
        // Load new profile
        this.currentProfile = profileName;
        const profileData = this.profiles[profileName];
        this.mappings = profileData.mappings || {};
        this.controlMappings = profileData.controlMappings || {};
        
        this.emit('profile-switched', this.currentProfile);
        this.saveConfig();
        
        console.log(`Switched to profile: ${this.currentProfile}`);
        return this.currentProfile;
    }

    // Octave management
    setCurrentOctave(octave) {
        // Clamp octave between -3 and +3
        this.currentOctave = Math.max(-3, Math.min(3, octave));
        this.emit('octave-changed', this.currentOctave);
        this.saveConfig();
        return this.currentOctave;
    }

    getCurrentOctave() {
        return this.currentOctave;
    }

    // Legacy compatibility methods
    setMapping(note, mapping) {
        return this.setMappingWithOctave(note, this.currentOctave, mapping);
    }

    getMapping(note) {
        return this.getMappingWithOctave(note, this.currentOctave);
    }

    getAllMappings() {
        return { ...this.mappings };
    }

    clearAllMappings() {
        this.mappings = {};
        this.controlMappings = {};
        this.emit('mappings-cleared');
        this.saveConfig();
        return true;
    }

    // Get all profiles info
    getAllProfiles() {
        return Object.keys(this.profiles).map(name => ({
            name,
            description: this.profiles[name].description || "",
            mappingCount: Object.keys(this.profiles[name].mappings || {}).length,
            isCurrent: name === this.currentProfile,
            inCycleList: this.profileCycleList.includes(name)
        }));
    }

    // Preset management (enhanced)
    async loadPreset(presetName) {
        try {
            const presetFile = path.join(this.configDir, 'presets', `${presetName}.json`);
            const data = await fs.readFile(presetFile, 'utf8');
            const preset = JSON.parse(data);
            
            this.mappings = preset.mappings || {};
            this.controlMappings = preset.controlMappings || {};
            
            this.emit('preset-loaded', presetName);
            await this.saveConfig();
            
            return true;
        } catch (error) {
            console.error('Failed to load preset:', error);
            return false;
        }
    }

    async savePreset(presetName, description = "") {
        try {
            const presetDir = path.join(this.configDir, 'presets');
            await fs.mkdir(presetDir, { recursive: true });
            
            const presetFile = path.join(presetDir, `${presetName}.json`);
            const preset = {
                name: presetName,
                description: description,
                mappings: this.mappings,
                controlMappings: this.controlMappings,
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

    // Get note name with octave for display
    getNoteNameWithOctave(noteNumber, octave = 0) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const actualNote = noteNumber + (octave * 12);
        const noteName = noteNames[actualNote % 12];
        const noteOctave = Math.floor(actualNote / 12) - 2;
        return `${noteName}${noteOctave}`;
    }

    // Get note name for display (legacy)
    getNoteName(noteNumber) {
        return this.getNoteNameWithOctave(noteNumber, 0);
    }
}

module.exports = KeyMapper;