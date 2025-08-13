// Mapping Management Module
class MappingManager {
    constructor() {
        this.currentMappings = {};
        this.currentNote = null;
        this.modal = null;
        
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        this.init();
    }

    init() {
        this.modal = document.getElementById('mapping-modal');
        this.setupModalEvents();
        this.setupFormEvents();
        this.loadMappings();
    }

    setupModalEvents() {
        // Close modal events
        const closeBtn = this.modal.querySelector('.modal-close');
        const cancelBtn = document.getElementById('cancel-mapping-btn');
        
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        
        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Save mapping
        const saveBtn = document.getElementById('save-mapping-btn');
        saveBtn.addEventListener('click', () => this.saveMapping());
        
        // Delete mapping
        const deleteBtn = document.getElementById('delete-mapping-btn');
        deleteBtn.addEventListener('click', () => this.deleteMapping());
    }

    setupFormEvents() {
        // Mapping type change
        const mappingTypeSelect = document.getElementById('mapping-type');
        mappingTypeSelect.addEventListener('change', () => this.updateFormVisibility());
        
        // Velocity sensitive checkbox
        const velocityCheckbox = document.getElementById('velocity-sensitive');
        velocityCheckbox.addEventListener('change', () => this.updateFormVisibility());
        
        // Velocity threshold slider
        const velocitySlider = document.getElementById('velocity-threshold');
        const velocityValue = document.getElementById('velocity-value');
        velocitySlider.addEventListener('input', (e) => {
            velocityValue.textContent = e.target.value;
        });
        
        // Key capture
        const keyInput = document.getElementById('key-input');
        keyInput.addEventListener('focus', () => this.startKeyCapture());
        keyInput.addEventListener('blur', () => this.stopKeyCapture());
        keyInput.addEventListener('keydown', (e) => this.captureKey(e));
        
        // Preset controls
        const loadPresetBtn = document.getElementById('load-preset-btn');
        const savePresetBtn = document.getElementById('save-preset-btn');
        const clearAllBtn = document.getElementById('clear-all-btn');
        
        loadPresetBtn.addEventListener('click', () => this.loadPreset());
        savePresetBtn.addEventListener('click', () => this.savePreset());
        clearAllBtn.addEventListener('click', () => this.clearAllMappings());
    }

    openMappingDialog(note) {
        this.currentNote = note;
        const noteName = this.getNoteName(note);
        const octave = Math.floor(note / 12) - 2;
        
        // Update modal title
        document.getElementById('modal-note-info').textContent = `${noteName}${octave} (MIDI ${note})`;
        
        // Load existing mapping if any
        const existingMapping = this.currentMappings[note];
        if (existingMapping) {
            this.populateForm(existingMapping);
        } else {
            this.resetForm();
        }
        
        // Show modal
        this.modal.classList.add('show');
        this.updateFormVisibility();
    }

    closeModal() {
        this.modal.classList.remove('show');
        this.currentNote = null;
        this.stopKeyCapture();
    }

    populateForm(mapping) {
        document.getElementById('mapping-type').value = mapping.mapping_type || 'single_key';
        document.getElementById('trigger-mode').value = mapping.trigger_mode || 'press';
        document.getElementById('key-input').value = mapping.key || '';
        document.getElementById('text-input').value = mapping.text || '';
        document.getElementById('command-input').value = mapping.command || '';
        document.getElementById('application-input').value = mapping.application_path || '';
        document.getElementById('website-input').value = mapping.website_url || '';
        document.getElementById('velocity-sensitive').checked = mapping.velocity_sensitive || false;
        document.getElementById('velocity-threshold').value = mapping.velocity_threshold || 64;
        document.getElementById('velocity-value').textContent = mapping.velocity_threshold || 64;
        
        // Set modifiers
        const modifiers = mapping.modifiers || [];
        document.getElementById('ctrl-mod').checked = modifiers.includes('Ctrl');
        document.getElementById('shift-mod').checked = modifiers.includes('Shift');
        document.getElementById('alt-mod').checked = modifiers.includes('Alt');
        document.getElementById('meta-mod').checked = modifiers.includes('Meta');
    }

    resetForm() {
        document.getElementById('mapping-type').value = 'single_key';
        document.getElementById('trigger-mode').value = 'press';
        document.getElementById('key-input').value = '';
        document.getElementById('text-input').value = '';
        document.getElementById('command-input').value = '';
        document.getElementById('velocity-sensitive').checked = false;
        document.getElementById('velocity-threshold').value = 64;
        document.getElementById('velocity-value').textContent = '64';
        
        // Clear modifiers
        document.getElementById('ctrl-mod').checked = false;
        document.getElementById('shift-mod').checked = false;
        document.getElementById('alt-mod').checked = false;
        document.getElementById('meta-mod').checked = false;
    }

    updateFormVisibility() {
        const mappingType = document.getElementById('mapping-type').value;
        const velocitySensitive = document.getElementById('velocity-sensitive').checked;
        
        // Show/hide form groups based on mapping type
        const keyGroup = document.getElementById('key-input-group');
        const modifiersGroup = document.getElementById('modifiers-group');
        const textGroup = document.getElementById('text-input-group');
        const commandGroup = document.getElementById('command-input-group');
        const applicationGroup = document.getElementById('application-input-group');
        const websiteGroup = document.getElementById('website-input-group');
        const velocityThresholdGroup = document.getElementById('velocity-threshold-group');
        
        // Reset visibility
        [keyGroup, modifiersGroup, textGroup, commandGroup, applicationGroup, websiteGroup].forEach(group => {
            if (group) group.style.display = 'none';
        });
        
        // Show relevant groups
        switch (mappingType) {
            case 'single_key':
            case 'key_combo':
                keyGroup.style.display = 'block';
                modifiersGroup.style.display = 'block';
                break;
            case 'text_input':
                textGroup.style.display = 'block';
                break;
            case 'command':
                commandGroup.style.display = 'block';
                break;
            case 'application':
                applicationGroup.style.display = 'block';
                break;
            case 'website':
                websiteGroup.style.display = 'block';
                break;
        }
        
        // Show velocity threshold if velocity sensitive
        if (velocityThresholdGroup) {
            velocityThresholdGroup.style.display = velocitySensitive ? 'block' : 'none';
        }
    }

    startKeyCapture() {
        const keyInput = document.getElementById('key-input');
        keyInput.value = 'Press a key...';
        keyInput.classList.add('capturing');
    }

    stopKeyCapture() {
        const keyInput = document.getElementById('key-input');
        keyInput.classList.remove('capturing');
        if (keyInput.value === 'Press a key...') {
            keyInput.value = '';
        }
    }

    captureKey(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const keyInput = document.getElementById('key-input');
        
        // Map special keys
        const keyMap = {
            ' ': 'Space',
            'Enter': 'Return',
            'Escape': 'Esc',
            'Backspace': 'BackSpace',
            'Delete': 'Delete',
            'Tab': 'Tab',
            'ArrowUp': 'Up',
            'ArrowDown': 'Down',
            'ArrowLeft': 'Left',
            'ArrowRight': 'Right',
            'Home': 'Home',
            'End': 'End',
            'PageUp': 'Page_Up',
            'PageDown': 'Page_Down'
        };
        
        let keyName = e.key;
        
        // Handle special keys
        if (keyMap[keyName]) {
            keyName = keyMap[keyName];
        }
        // Handle function keys
        else if (keyName.startsWith('F') && keyName.length <= 3) {
            keyName = keyName; // Keep as is (F1, F2, etc.)
        }
        // Handle single characters
        else if (keyName.length === 1) {
            keyName = keyName.toLowerCase();
        }
        
        keyInput.value = keyName;
        keyInput.blur(); // Stop capturing
    }

    async saveMapping() {
        if (!this.currentNote) return;
        
        try {
            const mappingData = this.getFormData();
            
            // Send to backend
            const success = await window.electronAPI.setKeyMapping(this.currentNote, mappingData);
            
            if (success) {
                this.currentMappings[this.currentNote] = mappingData;
                this.updatePianoKeyMapping(this.currentNote, mappingData);
                this.updateMappingList();
                this.closeModal();
            } else {
                alert('Failed to save mapping');
            }
        } catch (error) {
            console.error('Error saving mapping:', error);
            alert('Error saving mapping: ' + error.message);
        }
    }

    async deleteMapping() {
        if (!this.currentNote) return;
        
        try {
            // Send null mapping to backend to delete
            const success = await window.electronAPI.setKeyMapping(this.currentNote, null);
            
            if (success) {
                delete this.currentMappings[this.currentNote];
                this.updatePianoKeyMapping(this.currentNote, null);
                this.updateMappingList();
                this.closeModal();
            } else {
                alert('Failed to delete mapping');
            }
        } catch (error) {
            console.error('Error deleting mapping:', error);
            alert('Error deleting mapping: ' + error.message);
        }
    }

    getFormData() {
        const modifiers = [];
        if (document.getElementById('ctrl-mod').checked) modifiers.push('Ctrl');
        if (document.getElementById('shift-mod').checked) modifiers.push('Shift');
        if (document.getElementById('alt-mod').checked) modifiers.push('Alt');
        if (document.getElementById('meta-mod').checked) modifiers.push('Meta');
        
        return {
            mapping_type: document.getElementById('mapping-type').value,
            trigger_mode: document.getElementById('trigger-mode').value,
            key: document.getElementById('key-input').value,
            modifiers: modifiers,
            text: document.getElementById('text-input').value,
            command: document.getElementById('command-input').value,
            application_path: document.getElementById('application-input').value,
            website_url: document.getElementById('website-input').value,
            velocity_sensitive: document.getElementById('velocity-sensitive').checked,
            velocity_threshold: parseInt(document.getElementById('velocity-threshold').value)
        };
    }

    updatePianoKeyMapping(note, mapping) {
        if (window.pianoKeyboard) {
            window.pianoKeyboard.updateKeyMapping(note, mapping);
        }
    }

    updateMappingList() {
        const listContainer = document.getElementById('mapping-list');
        listContainer.innerHTML = '';
        
        Object.entries(this.currentMappings).forEach(([note, mapping]) => {
            const item = this.createMappingListItem(parseInt(note), mapping);
            listContainer.appendChild(item);
        });
        
        if (Object.keys(this.currentMappings).length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'mapping-item';
            emptyMessage.innerHTML = '<div class="mapping-info">No key mappings configured</div>';
            listContainer.appendChild(emptyMessage);
        }
    }

    createMappingListItem(note, mapping) {
        const item = document.createElement('div');
        item.className = 'mapping-item';
        
        const noteName = this.getNoteName(note);
        const octave = Math.floor(note / 12) - 2;
        
        const mappingText = this.getMappingDescription(mapping);
        
        item.innerHTML = `
            <div class="mapping-info">
                <span class="note-name">${noteName}${octave}</span>
                <div class="mapping-details">${mappingText}</div>
            </div>
            <div class="mapping-actions">
                <button class="btn btn-sm" onclick="window.mappingManager.editMapping(${note})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="window.mappingManager.deleteMapping(${note})">Delete</button>
            </div>
        `;
        
        return item;
    }

    editMapping(note) {
        this.openMappingDialog(note);
    }

    getMappingDescription(mapping) {
        if (!mapping) return '';
        
        switch (mapping.mapping_type) {
            case 'single_key':
                return `Key: ${mapping.key}`;
            case 'key_combo':
                const modifiers = mapping.modifiers.length > 0 ? mapping.modifiers.join('+') + '+' : '';
                return `Combo: ${modifiers}${mapping.key}`;
            case 'text_input':
                return `Text: "${mapping.text}"`;
            case 'command':
                return `Command: ${mapping.command}`;
            default:
                return 'Unknown mapping type';
        }
    }

    async loadMappings() {
        try {
            const mappingsData = await window.electronAPI.getKeyMappings();
            this.currentMappings = mappingsData.mappings || {};
            this.updateMappingList();
            
            if (window.pianoKeyboard) {
                window.pianoKeyboard.updateMappings(mappingsData);
            }
        } catch (error) {
            console.error('Error loading mappings:', error);
        }
    }

    async loadPreset() {
        const presetSelect = document.getElementById('preset-select');
        const presetName = presetSelect.value;
        
        if (!presetName) {
            alert('Please select a preset to load');
            return;
        }
        
        try {
            const success = await window.electronAPI.loadPreset(presetName);
            
            if (success) {
                await this.loadMappings(); // Refresh mappings
                alert(`Preset "${presetName}" loaded successfully`);
            } else {
                alert('Failed to load preset');
            }
        } catch (error) {
            console.error('Error loading preset:', error);
            alert('Error loading preset: ' + error.message);
        }
    }

    async savePreset() {
        const presetName = prompt('Enter preset name:');
        
        if (!presetName) return;
        
        try {
            const success = await window.electronAPI.savePreset(presetName, this.currentMappings);
            
            if (success) {
                alert(`Preset "${presetName}" saved successfully`);
            } else {
                alert('Failed to save preset');
            }
        } catch (error) {
            console.error('Error saving preset:', error);
            alert('Error saving preset: ' + error.message);
        }
    }

    async clearAllMappings() {
        if (!confirm('Are you sure you want to clear all mappings?')) {
            return;
        }
        
        try {
            // Clear each mapping individually
            const notes = Object.keys(this.currentMappings);
            for (const note of notes) {
                await window.electronAPI.setKeyMapping(parseInt(note), null);
            }
            
            this.currentMappings = {};
            this.updateMappingList();
            
            if (window.pianoKeyboard) {
                window.pianoKeyboard.clearAllMappings();
            }
            
            alert('All mappings cleared');
        } catch (error) {
            console.error('Error clearing mappings:', error);
            alert('Error clearing mappings: ' + error.message);
        }
    }

    getNoteName(note) {
        return this.noteNames[note % 12];
    }

    // Handle MIDI events from backend
    handleMidiEvent(event) {
        if (event.type === 'note' && window.pianoKeyboard) {
            window.pianoKeyboard.highlightKey(
                event.note,
                event.velocity > 0,
                event.velocity
            );
        }
    }
}

// Initialize mapping manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mappingManager = new MappingManager();
});