// Enhanced MidiCtrl Application with Profile & Octave Management
class MidiCtrlApp {
    constructor() {
        this.midiConnected = false;
        this.currentDevice = null;
        this.devices = [];
        this.currentProfile = 'Default';
        this.currentOctave = 0;
        this.profiles = [];
        this.profileCycleList = [];
        this.mappings = {};
        this.controlMappings = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupElectronIPC();
        this.updateUI();
        this.loadInitialData();
        
        console.log('Enhanced MidiCtrl App initialized');
    }

    setupEventListeners() {
        // Device controls
        document.getElementById('refresh-btn').addEventListener('click', () => this.refreshDevices());
        document.getElementById('connect-btn').addEventListener('click', () => this.connectDevice());
        document.getElementById('disconnect-btn').addEventListener('click', () => this.disconnectDevice());
        
        // Device selection
        document.getElementById('device-select').addEventListener('change', (e) => {
            const connectBtn = document.getElementById('connect-btn');
            connectBtn.disabled = !e.target.value;
        });
        
        // Profile controls
        document.getElementById('profile-prev-btn').addEventListener('click', () => this.switchProfile('previous'));
        document.getElementById('profile-next-btn').addEventListener('click', () => this.switchProfile('next'));
        document.getElementById('manage-profiles-btn').addEventListener('click', () => this.openProfileModal());
        document.getElementById('profile-select').addEventListener('change', (e) => {
            if (e.target.value) this.switchProfile(e.target.value);
        });
        
        // Octave controls
        document.getElementById('octave-down-btn').addEventListener('click', () => this.changeOctave(-1));
        document.getElementById('octave-up-btn').addEventListener('click', () => this.changeOctave(1));
        document.getElementById('octave-slider').addEventListener('input', (e) => {
            this.setOctave(parseInt(e.target.value));
        });
        
        // Control buttons (right-click for configuration)
        document.querySelectorAll('.control-btn.mappable').forEach(btn => {
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.openControlMappingModal(btn.dataset.control);
            });
            btn.addEventListener('click', () => this.handleControlButton(btn));
        });
        
        // MOD button (profile switching)
        document.querySelector('[data-control="mod"]').addEventListener('click', () => {
            this.switchProfile('next');
        });
        
        // Preset controls
        document.getElementById('load-preset-btn').addEventListener('click', () => this.loadPreset());
        document.getElementById('save-preset-btn').addEventListener('click', () => this.savePreset());
        document.getElementById('clear-all-btn').addEventListener('click', () => this.clearAllMappings());
        
        // Profile modal controls
        this.setupProfileModalListeners();
        this.setupControlModalListeners();
        this.setupModalCloseListeners();
    }
    
    setupProfileModalListeners() {
        document.getElementById('create-profile-btn').addEventListener('click', () => this.createProfile());
        document.getElementById('duplicate-profile-btn').addEventListener('click', () => this.duplicateProfile());
        document.getElementById('rename-profile-btn').addEventListener('click', () => this.renameProfile());
        document.getElementById('delete-profile-btn').addEventListener('click', () => this.deleteProfile());
        document.getElementById('import-profile-btn').addEventListener('click', () => this.importProfile());
        document.getElementById('export-all-profiles-btn').addEventListener('click', () => this.exportAllProfiles());
        document.getElementById('save-cycle-config-btn').addEventListener('click', () => this.saveCycleConfiguration());
        document.getElementById('close-profile-modal-btn').addEventListener('click', () => this.closeModal('profile-modal'));
    }
    
    setupControlModalListeners() {
        document.getElementById('save-control-mapping-btn').addEventListener('click', () => this.saveControlMapping());
        document.getElementById('delete-control-mapping-btn').addEventListener('click', () => this.deleteControlMapping());
        document.getElementById('cancel-control-mapping-btn').addEventListener('click', () => this.closeModal('control-modal'));
        
        // Control mapping type change
        document.getElementById('control-mapping-type').addEventListener('change', (e) => {
            this.updateControlMappingForm(e.target.value);
        });
    }
    
    setupModalCloseListeners() {
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    setupElectronIPC() {
        // Device events
        window.electronAPI.onDeviceConnected((device) => {
            this.midiConnected = true;
            this.currentDevice = device.name;
            this.updateConnectionStatus();
            this.updateUI();
            console.log(`Device connected: ${device.name}`);
        });

        window.electronAPI.onDeviceDisconnected(() => {
            this.midiConnected = false;
            this.currentDevice = null;
            this.updateConnectionStatus();
            this.updateUI();
            console.log('Device disconnected');
        });

        // MIDI events
        window.electronAPI.onMidiEvent((event) => {
            this.handleMidiEvent(event);
        });

        // Profile switching
        window.electronAPI.onProfileSwitched((profileName) => {
            this.currentProfile = profileName;
            this.updateProfileStatus();
            this.refreshMappings();
            console.log(`Profile switched to: ${profileName}`);
        });
        
        // Control actions
        window.electronAPI.onControlAction((event) => {
            this.handleControlAction(event);
        });
    }

    async loadInitialData() {
        try {
            await this.refreshDevices();
            await this.loadProfiles();
            await this.loadCurrentOctave();
            await this.refreshMappings();
            console.log('Initial data loaded');
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }
    
    async loadProfiles() {
        try {
            this.profiles = await window.electronAPI.getAllProfiles();
            this.currentProfile = await window.electronAPI.getCurrentProfile();
            this.profileCycleList = await window.electronAPI.getProfileCycleList();
            this.updateProfileSelect();
            this.updateProfileStatus();
        } catch (error) {
            console.error('Failed to load profiles:', error);
        }
    }
    
    async loadCurrentOctave() {
        try {
            this.currentOctave = await window.electronAPI.getOctave();
            this.updateOctaveUI();
        } catch (error) {
            console.error('Failed to load current octave:', error);
        }
    }

    async refreshDevices() {
        try {
            this.devices = await window.electronAPI.getMidiDevices();
            this.updateDeviceSelect();
            console.log('Devices refreshed:', this.devices);
        } catch (error) {
            console.error('Failed to refresh devices:', error);
        }
    }

    async connectDevice() {
        const select = document.getElementById('device-select');
        if (!select.value) return;

        try {
            const success = await window.electronAPI.connectDevice(parseInt(select.value));
            if (success) {
                console.log('Device connection initiated');
            } else {
                console.error('Failed to connect device');
            }
        } catch (error) {
            console.error('Connection error:', error);
        }
    }

    async disconnectDevice() {
        try {
            await window.electronAPI.disconnectDevice();
            console.log('Device disconnected');
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    }
    
    async switchProfile(direction) {
        try {
            const newProfile = await window.electronAPI.switchProfile(direction);
            this.currentProfile = newProfile;
            this.updateProfileStatus();
            await this.refreshMappings();
            console.log(`Switched to profile: ${newProfile}`);
        } catch (error) {
            console.error('Failed to switch profile:', error);
        }
    }
    
    async changeOctave(delta) {
        const newOctave = Math.max(-3, Math.min(3, this.currentOctave + delta));
        await this.setOctave(newOctave);
    }
    
    async setOctave(octave) {
        try {
            this.currentOctave = await window.electronAPI.setOctave(octave);
            this.updateOctaveUI();
            await this.refreshMappings(); // Refresh to show octave-adjusted mappings
            
            // Update piano keyboard octave display
            if (window.pianoKeyboard) {
                window.pianoKeyboard.updateOctave(this.currentOctave);
            }
            
            console.log(`Octave set to: ${this.currentOctave}`);
        } catch (error) {
            console.error('Failed to set octave:', error);
        }
    }

    async refreshMappings() {
        try {
            const data = await window.electronAPI.getKeyMappings();
            this.mappings = data.mappings || {};
            this.controlMappings = data.controlMappings || {};
            this.currentOctave = data.currentOctave || 0;
            this.updateMappingsList();
            this.updateControlButtonIndicators();
            this.updateOctaveUI();
            
            // Update piano keyboard and mapping manager
            if (window.pianoKeyboard) {
                window.pianoKeyboard.updateMappings(data);
            }
            
            if (window.mappingManager) {
                window.mappingManager.currentMappings = this.mappings;
                window.mappingManager.updateMappingList();
            }
            
        } catch (error) {
            console.error('Failed to refresh mappings:', error);
        }
    }
    
    async loadPreset() {
        const presetSelect = document.getElementById('preset-select');
        if (!presetSelect.value) return;
        
        try {
            const success = await window.electronAPI.loadPreset(presetSelect.value);
            if (success) {
                await this.refreshMappings();
                console.log(`Loaded preset: ${presetSelect.value}`);
            }
        } catch (error) {
            console.error('Failed to load preset:', error);
        }
    }
    
    async savePreset() {
        const name = prompt('Enter preset name:');
        if (!name) return;
        
        const description = prompt('Enter description (optional):') || '';
        
        try {
            const success = await window.electronAPI.savePreset(name, description);
            if (success) {
                console.log(`Saved preset: ${name}`);
            }
        } catch (error) {
            console.error('Failed to save preset:', error);
        }
    }
    
    async clearAllMappings() {
        if (!confirm('Clear all mappings? This cannot be undone.')) return;
        
        try {
            await window.electronAPI.clearAllMappings();
            await this.refreshMappings();
            console.log('All mappings cleared');
        } catch (error) {
            console.error('Failed to clear mappings:', error);
        }
    }
    
    openProfileModal() {
        this.showModal('profile-modal');
        this.updateProfileModal();
    }
    
    async updateProfileModal() {
        // Update profile list
        const profileList = document.getElementById('profile-list');
        profileList.innerHTML = '';
        
        this.profiles.forEach(profile => {
            const item = document.createElement('div');
            item.className = `profile-item ${profile.isCurrent ? 'current' : ''}`;
            item.innerHTML = `
                <div class="profile-info">
                    <div class="profile-name">${profile.name}</div>
                    <div class="profile-description">${profile.description}</div>
                </div>
                <div class="profile-stats">${profile.mappingCount} mappings</div>
                <div class="profile-actions">
                    <button class="btn btn-sm" onclick="app.exportProfile('${profile.name}')">Export</button>
                </div>
            `;
            item.addEventListener('click', () => this.switchProfile(profile.name));
            profileList.appendChild(item);
        });
        
        // Update cycle configuration
        const cycleList = document.getElementById('cycle-list');
        cycleList.innerHTML = '';
        
        this.profiles.forEach((profile, index) => {
            const item = document.createElement('div');
            item.className = 'cycle-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'cycle-checkbox';
            checkbox.checked = profile.inCycleList;
            checkbox.dataset.profileName = profile.name;
            
            const order = document.createElement('div');
            order.className = 'cycle-order';
            order.textContent = profile.inCycleList ? this.profileCycleList.indexOf(profile.name) + 1 : '';
            
            const label = document.createElement('label');
            label.textContent = profile.name;
            
            item.appendChild(checkbox);
            item.appendChild(order);
            item.appendChild(label);
            cycleList.appendChild(item);
        });
    }
    
    openControlMappingModal(controlType) {
        this.currentControlType = controlType;
        this.showModal('control-modal');
        
        // Update modal title
        document.getElementById('control-modal-name').textContent = controlType.replace('_', ' ').toUpperCase();
        
        // Load existing mapping if any
        const existing = this.controlMappings[controlType];
        if (existing) {
            document.getElementById('control-mapping-type').value = existing.mapping_type || 'single_key';
            document.getElementById('control-trigger-mode').value = existing.trigger_mode || 'press';
            
            if (existing.key) {
                document.getElementById('control-key-input').value = existing.key;
            }
            
            // Set modifiers
            const modifiers = existing.modifiers || [];
            document.getElementById('control-ctrl-mod').checked = modifiers.includes('ctrl');
            document.getElementById('control-shift-mod').checked = modifiers.includes('shift');
            document.getElementById('control-alt-mod').checked = modifiers.includes('alt');
            document.getElementById('control-meta-mod').checked = modifiers.includes('meta');
            
            if (existing.text) {
                document.getElementById('control-text-input').value = existing.text;
            }
            
            if (existing.command) {
                document.getElementById('control-command-input').value = existing.command;
            }
        } else {
            // Clear form
            this.clearControlMappingForm();
        }
        
        this.updateControlMappingForm(document.getElementById('control-mapping-type').value);
    }
    
    clearControlMappingForm() {
        document.getElementById('control-mapping-type').value = 'single_key';
        document.getElementById('control-trigger-mode').value = 'press';
        document.getElementById('control-key-input').value = '';
        document.getElementById('control-ctrl-mod').checked = false;
        document.getElementById('control-shift-mod').checked = false;
        document.getElementById('control-alt-mod').checked = false;
        document.getElementById('control-meta-mod').checked = false;
        document.getElementById('control-text-input').value = '';
        document.getElementById('control-command-input').value = '';
    }
    
    updateControlMappingForm(mappingType) {
        // Show/hide relevant form groups
        const groups = {
            'control-key-input-group': ['single_key', 'key_combo'],
            'control-modifiers-group': ['key_combo'],
            'control-text-input-group': ['text_input'],
            'control-command-input-group': ['command']
        };
        
        Object.entries(groups).forEach(([groupId, types]) => {
            const group = document.getElementById(groupId);
            group.style.display = types.includes(mappingType) ? 'block' : 'none';
        });
    }
    
    async saveControlMapping() {
        const controlType = this.currentControlType;
        const mappingType = document.getElementById('control-mapping-type').value;
        const triggerMode = document.getElementById('control-trigger-mode').value;
        
        const mapping = {
            mapping_type: mappingType,
            trigger_mode: triggerMode
        };
        
        if (mappingType === 'single_key' || mappingType === 'key_combo') {
            mapping.key = document.getElementById('control-key-input').value;
            
            if (mappingType === 'key_combo') {
                const modifiers = [];
                if (document.getElementById('control-ctrl-mod').checked) modifiers.push('ctrl');
                if (document.getElementById('control-shift-mod').checked) modifiers.push('shift');
                if (document.getElementById('control-alt-mod').checked) modifiers.push('alt');
                if (document.getElementById('control-meta-mod').checked) modifiers.push('meta');
                mapping.modifiers = modifiers;
            }
        } else if (mappingType === 'text_input') {
            mapping.text = document.getElementById('control-text-input').value;
        } else if (mappingType === 'command') {
            mapping.command = document.getElementById('control-command-input').value;
        }
        
        try {
            await window.electronAPI.setControlMapping(controlType, mapping);
            await this.refreshMappings();
            this.closeModal('control-modal');
            console.log(`Saved control mapping for ${controlType}`);
        } catch (error) {
            console.error('Failed to save control mapping:', error);
        }
    }
    
    async deleteControlMapping() {
        const controlType = this.currentControlType;
        
        try {
            await window.electronAPI.setControlMapping(controlType, null);
            await this.refreshMappings();
            this.closeModal('control-modal');
            console.log(`Deleted control mapping for ${controlType}`);
        } catch (error) {
            console.error('Failed to delete control mapping:', error);
        }
    }
    
    async createProfile() {
        const name = prompt('Enter profile name:');
        if (!name) return;
        
        const description = prompt('Enter description (optional):') || '';
        
        try {
            const result = await window.electronAPI.createProfile(name, description);
            if (result.success) {
                await this.loadProfiles();
                this.updateProfileModal();
                console.log(`Created profile: ${name}`);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Failed to create profile:', error);
        }
    }
    
    async duplicateProfile() {
        if (this.profiles.length === 0) {
            alert('No profiles to duplicate');
            return;
        }
        
        const sourceProfile = prompt('Enter source profile name:', this.currentProfile);
        if (!sourceProfile) return;
        
        const newName = prompt('Enter new profile name:');
        if (!newName) return;
        
        try {
            const result = await window.electronAPI.duplicateProfile(sourceProfile, newName);
            if (result.success) {
                await this.loadProfiles();
                this.updateProfileModal();
                console.log(`Duplicated profile: ${sourceProfile} → ${newName}`);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Failed to duplicate profile:', error);
        }
    }
    
    async renameProfile() {
        if (this.profiles.length === 0) {
            alert('No profiles to rename');
            return;
        }
        
        const oldName = prompt('Enter profile to rename:', this.currentProfile);
        if (!oldName) return;
        
        const newName = prompt('Enter new name:');
        if (!newName) return;
        
        const description = prompt('Enter description (optional):') || '';
        
        try {
            const result = await window.electronAPI.updateProfile(oldName, newName, description);
            if (result.success) {
                await this.loadProfiles();
                this.updateProfileModal();
                console.log(`Renamed profile: ${oldName} → ${newName}`);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Failed to rename profile:', error);
        }
    }
    
    async deleteProfile() {
        if (this.profiles.length <= 1) {
            alert('Cannot delete the last profile');
            return;
        }
        
        const profileName = prompt('Enter profile name to delete:');
        if (!profileName) return;
        
        if (!confirm(`Delete profile "${profileName}"? This cannot be undone.`)) return;
        
        try {
            const result = await window.electronAPI.deleteProfile(profileName);
            if (result.success) {
                await this.loadProfiles();
                this.updateProfileModal();
                console.log(`Deleted profile: ${profileName}`);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Failed to delete profile:', error);
        }
    }
    
    async saveCycleConfiguration() {
        const checkboxes = document.querySelectorAll('.cycle-checkbox:checked');
        const selectedProfiles = Array.from(checkboxes).map(cb => cb.dataset.profileName);
        
        try {
            const result = await window.electronAPI.setProfileCycleList(selectedProfiles);
            if (result.success) {
                this.profileCycleList = selectedProfiles;
                console.log('Cycle configuration saved:', selectedProfiles);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Failed to save cycle configuration:', error);
        }
    }
    
    async exportProfile(profileName) {
        try {
            const allProfiles = await window.electronAPI.getAllProfiles();
            const profileData = allProfiles.find(p => p.name === profileName);
            
            if (!profileData) {
                alert('Profile not found');
                return;
            }
            
            // Get full profile data with mappings
            const fullData = await window.electronAPI.getKeyMappings();
            
            const exportData = {
                name: profileData.name,
                description: profileData.description,
                mappings: fullData.mappings || {},
                controlMappings: fullData.controlMappings || {},
                version: '3.0',
                exportedAt: new Date().toISOString()
            };
            
            // Download as JSON file
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `midictrl-profile-${profileName.toLowerCase().replace(/\s+/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log(`Exported profile: ${profileName}`);
        } catch (error) {
            console.error('Failed to export profile:', error);
            alert('Failed to export profile');
        }
    }
    
    async exportAllProfiles() {
        try {
            const allProfiles = await window.electronAPI.getAllProfiles();
            const cycleList = await window.electronAPI.getProfileCycleList();
            
            const exportData = {
                profiles: [],
                profileCycleList: cycleList,
                version: '3.0',
                exportedAt: new Date().toISOString()
            };
            
            // Get data for each profile
            for (const profile of allProfiles) {
                // Switch to profile to get its data
                await window.electronAPI.switchProfile(profile.name);
                const profileData = await window.electronAPI.getKeyMappings();
                
                exportData.profiles.push({
                    name: profile.name,
                    description: profile.description,
                    mappings: profileData.mappings || {},
                    controlMappings: profileData.controlMappings || {}
                });
            }
            
            // Switch back to current profile
            await window.electronAPI.switchProfile(this.currentProfile);
            
            // Download as JSON file
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `midictrl-all-profiles-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('Exported all profiles');
        } catch (error) {
            console.error('Failed to export all profiles:', error);
            alert('Failed to export all profiles');
        }
    }
    
    async importProfile() {
        try {
            // Create file input
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                try {
                    const text = await file.text();
                    const importData = JSON.parse(text);
                    
                    // Validate import data
                    if (!importData.name && !importData.profiles) {
                        alert('Invalid profile file format');
                        return;
                    }
                    
                    if (importData.profiles) {
                        // Multiple profiles import
                        await this.importMultipleProfiles(importData);
                    } else {
                        // Single profile import
                        await this.importSingleProfile(importData);
                    }
                    
                } catch (parseError) {
                    console.error('Failed to parse import file:', parseError);
                    alert('Invalid JSON file');
                }
            };
            
            input.click();
            
        } catch (error) {
            console.error('Failed to import profile:', error);
            alert('Failed to import profile');
        }
    }
    
    async importSingleProfile(profileData) {
        let profileName = profileData.name;
        
        // Check if profile exists and ask for new name if needed
        const existingProfiles = await window.electronAPI.getAllProfiles();
        if (existingProfiles.find(p => p.name === profileName)) {
            const newName = prompt(`Profile "${profileName}" already exists. Enter a new name:`, `${profileName} (Imported)`);
            if (!newName) return;
            profileName = newName;
        }
        
        try {
            // Create new profile
            const createResult = await window.electronAPI.createProfile(profileName, profileData.description || '');
            if (!createResult.success) {
                alert('Error creating profile: ' + createResult.error);
                return;
            }
            
            // Switch to new profile
            await window.electronAPI.switchProfile(profileName);
            
            // Import mappings
            for (const [noteKey, mapping] of Object.entries(profileData.mappings || {})) {
                const note = mapping.note || parseInt(noteKey);
                const octave = mapping.octave || 0;
                await window.electronAPI.setKeyMappingWithOctave(note, octave, mapping);
            }
            
            // Import control mappings
            for (const [controlType, mapping] of Object.entries(profileData.controlMappings || {})) {
                await window.electronAPI.setControlMapping(controlType, mapping);
            }
            
            await this.loadProfiles();
            this.updateProfileModal();
            await this.refreshMappings();
            
            alert(`Profile "${profileName}" imported successfully!`);
            
        } catch (error) {
            console.error('Failed to import profile data:', error);
            alert('Failed to import profile data');
        }
    }
    
    async importMultipleProfiles(importData) {
        const confirmMessage = `Import ${importData.profiles.length} profiles?\n\nProfiles: ${importData.profiles.map(p => p.name).join(', ')}`;
        if (!confirm(confirmMessage)) return;
        
        let importedCount = 0;
        const existingProfiles = await window.electronAPI.getAllProfiles();
        
        for (const profileData of importData.profiles) {
            let profileName = profileData.name;
            
            // Handle name conflicts
            if (existingProfiles.find(p => p.name === profileName)) {
                profileName = `${profileName} (Imported)`;
                let counter = 1;
                while (existingProfiles.find(p => p.name === profileName)) {
                    profileName = `${profileData.name} (Imported ${counter++})`;
                }
            }
            
            try {
                // Create profile
                const createResult = await window.electronAPI.createProfile(profileName, profileData.description || '');
                if (!createResult.success) continue;
                
                // Switch to profile and import data
                await window.electronAPI.switchProfile(profileName);
                
                // Import mappings
                for (const [noteKey, mapping] of Object.entries(profileData.mappings || {})) {
                    const note = mapping.note || parseInt(noteKey);
                    const octave = mapping.octave || 0;
                    await window.electronAPI.setKeyMappingWithOctave(note, octave, mapping);
                }
                
                // Import control mappings
                for (const [controlType, mapping] of Object.entries(profileData.controlMappings || {})) {
                    await window.electronAPI.setControlMapping(controlType, mapping);
                }
                
                importedCount++;
                
            } catch (error) {
                console.error(`Failed to import profile ${profileName}:`, error);
            }
        }
        
        // Import cycle configuration if provided
        if (importData.profileCycleList) {
            try {
                await window.electronAPI.setProfileCycleList(importData.profileCycleList);
            } catch (error) {
                console.warn('Failed to import cycle configuration:', error);
            }
        }
        
        await this.loadProfiles();
        this.updateProfileModal();
        await this.refreshMappings();
        
        alert(`Successfully imported ${importedCount} of ${importData.profiles.length} profiles!`);
    }

    // UI Update Methods
    updateConnectionStatus() {
        const statusElement = document.getElementById('midi-status');
        const dot = statusElement.querySelector('.status-dot');
        const text = statusElement.querySelector('.status-text');

        if (this.midiConnected) {
            dot.className = 'status-dot connected';
            text.textContent = this.currentDevice || 'Connected';
        } else {
            dot.className = 'status-dot';
            text.textContent = 'No Device';
        }
    }
    
    updateProfileStatus() {
        const statusElement = document.getElementById('profile-status');
        const text = statusElement.querySelector('.status-text');
        text.textContent = this.currentProfile;
        
        // Update profile select
        const profileSelect = document.getElementById('profile-select');
        profileSelect.value = this.currentProfile;
    }
    
    updateOctaveUI() {
        const statusElement = document.getElementById('octave-status');
        const text = statusElement.querySelector('.status-text');
        text.textContent = `Oct: ${this.currentOctave >= 0 ? '+' : ''}${this.currentOctave}`;
        
        // Update octave controls
        document.getElementById('octave-slider').value = this.currentOctave;
        document.getElementById('octave-display').textContent = this.currentOctave >= 0 ? `+${this.currentOctave}` : this.currentOctave;
    }
    
    updateProfileSelect() {
        const select = document.getElementById('profile-select');
        select.innerHTML = '<option value="">Select Profile...</option>';
        
        this.profiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.name;
            option.textContent = profile.name;
            option.selected = profile.isCurrent;
            select.appendChild(option);
        });
    }

    updateDeviceSelect() {
        const select = document.getElementById('device-select');
        const connectBtn = document.getElementById('connect-btn');
        
        select.innerHTML = '<option value="">Select a MIDI device...</option>';
        
        this.devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.id;
            option.textContent = device.name;
            select.appendChild(option);
        });
        
        select.disabled = this.devices.length === 0;
        connectBtn.disabled = true;
    }
    
    updateControlButtonIndicators() {
        document.querySelectorAll('.control-btn.mappable').forEach(btn => {
            const controlType = btn.dataset.control;
            const hasMapping = this.controlMappings[controlType];
            
            btn.classList.toggle('has-mapping', !!hasMapping);
        });
    }

    updateMappingsList() {
        const listContainer = document.getElementById('mapping-list');
        listContainer.innerHTML = '';

        Object.entries(this.mappings).forEach(([key, mapping]) => {
            const mappingItem = document.createElement('div');
            mappingItem.className = 'mapping-item';
            
            // Check if this is an octave-adjusted mapping
            const isOctaveMapped = mapping.octave !== undefined && mapping.octave !== 0;
            if (isOctaveMapped) {
                mappingItem.classList.add('octave-mapped');
            }
            
            const noteName = this.getNoteNameWithOctave(mapping.actualNote || parseInt(key));
            const octaveInfo = isOctaveMapped ? `<span class="octave-indicator">Oct ${mapping.octave >= 0 ? '+' : ''}${mapping.octave}</span>` : '';
            
            mappingItem.innerHTML = `
                <div class="mapping-info">
                    <span class="note-name">${noteName}</span>${octaveInfo}
                    <div class="mapping-details">${this.formatMappingDetails(mapping)}</div>
                </div>
                <div class="mapping-actions">
                    <button class="btn btn-primary" onclick="app.editMapping(${key})">Edit</button>
                    <button class="btn btn-danger" onclick="app.deleteMapping(${key})">Delete</button>
                </div>
            `;
            
            listContainer.appendChild(mappingItem);
        });
    }

    updateUI() {
        this.updateConnectionStatus();
        
        // Enable/disable controls based on connection
        const controlsToToggle = [
            'profile-prev-btn', 'profile-next-btn', 'manage-profiles-btn',
            'octave-down-btn', 'octave-up-btn', 'octave-slider'
        ];
        
        controlsToToggle.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.disabled = !this.midiConnected;
            }
        });
        
        // Update disconnect button
        document.getElementById('disconnect-btn').disabled = !this.midiConnected;
    }

    // Utility Methods
    getNoteNameWithOctave(midiNote) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteName = noteNames[midiNote % 12];
        const octave = Math.floor(midiNote / 12) - 2;
        return `${noteName}${octave}`;
    }

    formatMappingDetails(mapping) {
        let details = `${mapping.mapping_type}`;
        
        if (mapping.key) {
            details += `: ${mapping.key}`;
            if (mapping.modifiers && mapping.modifiers.length > 0) {
                details += ` (${mapping.modifiers.join('+')})`;
            }
        } else if (mapping.text) {
            details += `: "${mapping.text.substring(0, 30)}${mapping.text.length > 30 ? '...' : ''}"`;
        } else if (mapping.command) {
            details += `: ${mapping.command}`;
        }
        
        return details;
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
    }

    handleControlButton(btn) {
        const control = btn.dataset.control;
        console.log(`Control button pressed: ${control}`);
    }
    
    handleControlAction(event) {
        console.log(`Control action: ${event.control}`, event);
        
        // Visual feedback
        const btn = document.querySelector(`[data-control="${event.control}"]`);
        if (btn) {
            btn.classList.add('active');
            setTimeout(() => btn.classList.remove('active'), 150);
        }
    }

    handleMidiEvent(event) {
        // Visual feedback for piano keys and note events
        if (event.type === 'note') {
            console.log(`MIDI Note: ${event.note}, On: ${event.on}, Velocity: ${event.velocity}`);
            
            // Forward to piano keyboard for visual feedback
            if (window.pianoKeyboard) {
                window.pianoKeyboard.handleMidiEvent(event);
            }
            
            // Forward to mapping manager
            if (window.mappingManager) {
                window.mappingManager.handleMidiEvent(event);
            }
        }
    }

    // Enhanced mapping methods with octave support
    editMapping(noteKey) {
        if (window.mappingManager) {
            const mapping = this.mappings[noteKey];
            if (mapping) {
                window.mappingManager.editMapping(mapping.note || parseInt(noteKey), mapping.octave || 0);
            } else {
                // For legacy mappings, assume note is the key and octave is 0
                window.mappingManager.editMapping(parseInt(noteKey), 0);
            }
        } else {
            console.log(`Edit mapping for note: ${noteKey}`);
        }
    }

    async deleteMapping(noteKey) {
        if (confirm('Delete this mapping?')) {
            try {
                const mapping = this.mappings[noteKey];
                if (mapping) {
                    await window.electronAPI.setKeyMappingWithOctave(
                        mapping.note || parseInt(noteKey), 
                        mapping.octave || 0, 
                        null
                    );
                } else {
                    // Legacy fallback
                    await window.electronAPI.setKeyMapping(parseInt(noteKey), null);
                }
                
                await this.refreshMappings();
                console.log(`Deleted mapping for note: ${noteKey}`);
            } catch (error) {
                console.error('Failed to delete mapping:', error);
                alert('Failed to delete mapping');
            }
        }
    }

    // Method to open mapping dialog for a specific note with current octave
    openMappingForNote(note) {
        if (window.mappingManager) {
            window.mappingManager.openMappingDialog(note, this.currentOctave);
        }
    }
}

// Initialize the application
const app = new MidiCtrlApp();