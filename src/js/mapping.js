// Enhanced Mapping Management with Octave Support
class MappingManager {
    constructor() {
        this.currentMappings = {};
        this.currentNote = null;
        this.currentOctave = 0;
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
    }

    // Open mapping dialog with octave support
    openMappingDialog(note, octave = null) {
        this.currentNote = note;
        this.currentOctave = octave !== null ? octave : window.app?.currentOctave || 0;
        
        const noteName = this.getNoteName(note);
        const displayOctave = Math.floor((note + (this.currentOctave * 12)) / 12) - 2;
        
        // Update modal title with octave info
        document.getElementById('modal-note-info').textContent = `${noteName}${displayOctave} (MIDI ${note})`;
        
        // Show octave indicator if not at octave 0
        const octaveInfo = document.getElementById('modal-octave-info');
        if (octaveInfo) {
            if (this.currentOctave !== 0) {
                octaveInfo.textContent = `Octave: ${this.currentOctave >= 0 ? '+' : ''}${this.currentOctave}`;
                octaveInfo.style.display = 'inline-block';
            } else {
                octaveInfo.style.display = 'none';
            }
        }
        
        // Load existing mapping for this note at this octave
        const mappingKey = this.getMappingKey(note, this.currentOctave);
        const existingMapping = this.currentMappings[mappingKey];
        
        if (existingMapping) {
            this.populateForm(existingMapping);
            document.getElementById('delete-mapping-btn').disabled = false;
        } else {
            this.resetForm();
            document.getElementById('delete-mapping-btn').disabled = true;
        }
        
        // Show modal
        this.modal.classList.add('show');
        this.updateFormVisibility();
    }

    // Get unique key for note+octave combination
    getMappingKey(note, octave) {
        return `${note + (octave * 12)}`;
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
        document.getElementById('application-input').value = mapping.application || '';
        document.getElementById('website-input').value = mapping.website || '';
        document.getElementById('velocity-sensitive').checked = mapping.velocity_sensitive || false;
        document.getElementById('velocity-threshold').value = mapping.velocity_threshold || 64;
        document.getElementById('velocity-value').textContent = mapping.velocity_threshold || 64;
        
        // Set modifiers
        const modifiers = mapping.modifiers || [];
        document.getElementById('ctrl-mod').checked = modifiers.includes('ctrl');
        document.getElementById('shift-mod').checked = modifiers.includes('shift');
        document.getElementById('alt-mod').checked = modifiers.includes('alt');
        document.getElementById('meta-mod').checked = modifiers.includes('meta');
    }

    resetForm() {
        document.getElementById('mapping-type').value = 'single_key';
        document.getElementById('trigger-mode').value = 'press';
        document.getElementById('key-input').value = '';
        document.getElementById('text-input').value = '';
        document.getElementById('command-input').value = '';
        document.getElementById('application-input').value = '';
        document.getElementById('website-input').value = '';
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
        const groups = {
            'key-input-group': ['single_key', 'key_combo'],
            'modifiers-group': ['key_combo'],
            'text-input-group': ['text_input'],
            'command-input-group': ['command'],
            'application-input-group': ['application'],
            'website-input-group': ['website']
        };
        
        Object.entries(groups).forEach(([groupId, types]) => {
            const group = document.getElementById(groupId);
            if (group) {
                group.style.display = types.includes(mappingType) ? 'block' : 'none';
            }
        });
        
        // Show velocity threshold if velocity sensitive
        const velocityThresholdGroup = document.getElementById('velocity-threshold-group');
        if (velocityThresholdGroup) {
            velocityThresholdGroup.style.display = velocitySensitive ? 'block' : 'none';
        }
    }

    startKeyCapture() {
        const keyInput = document.getElementById('key-input');
        keyInput.placeholder = 'Press a key...';
        keyInput.classList.add('capturing');
    }

    stopKeyCapture() {
        const keyInput = document.getElementById('key-input');
        keyInput.classList.remove('capturing');
        keyInput.placeholder = 'Click and press a key...';
    }

    captureKey(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const keyInput = document.getElementById('key-input');
        
        // Map special keys
        const keyMap = {
            ' ': 'space',
            'Enter': 'enter',
            'Escape': 'escape',
            'Backspace': 'backspace',
            'Delete': 'delete',
            'Tab': 'tab',
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'Home': 'home',
            'End': 'end',
            'PageUp': 'pageup',
            'PageDown': 'pagedown',
            'Insert': 'insert',
            'Control': 'ctrl',
            'Shift': 'shift',
            'Alt': 'alt',
            'Meta': 'meta'
        };
        
        let keyName = e.key;
        
        // Handle special keys
        if (keyMap[keyName]) {
            keyName = keyMap[keyName];
        }
        // Handle function keys
        else if (e.code.startsWith('F') && e.code.length <= 3) {
            keyName = e.code.toLowerCase();
        }
        // Handle single characters
        else if (keyName.length === 1) {
            keyName = keyName.toLowerCase();
        }
        
        keyInput.value = keyName;
        keyInput.blur(); // Stop capturing
    }

    async saveMapping() {
        if (this.currentNote === null) return;
        
        try {
            const mappingData = this.getFormData();
            
            // Validate mapping data
            if (!this.validateMapping(mappingData)) {
                return;
            }
            
            // Send to backend with octave information
            const success = await window.electronAPI.setKeyMappingWithOctave(
                this.currentNote, 
                this.currentOctave, 
                mappingData
            );
            
            if (success) {
                const mappingKey = this.getMappingKey(this.currentNote, this.currentOctave);
                this.currentMappings[mappingKey] = {
                    ...mappingData,
                    note: this.currentNote,
                    octave: this.currentOctave,
                    actualNote: this.currentNote + (this.currentOctave * 12)
                };
                
                this.updateMappingList();
                this.closeModal();
                
                // Refresh mappings in main app
                if (window.app) {
                    await window.app.refreshMappings();
                }
            } else {
                alert('Failed to save mapping');
            }
        } catch (error) {
            console.error('Error saving mapping:', error);
            alert('Error saving mapping: ' + error.message);
        }
    }

    async deleteMapping() {
        if (this.currentNote === null) return;
        
        if (!confirm('Delete this mapping?')) return;
        
        try {
            // Send null mapping to backend to delete
            const success = await window.electronAPI.setKeyMappingWithOctave(
                this.currentNote, 
                this.currentOctave, 
                null
            );
            
            if (success) {
                const mappingKey = this.getMappingKey(this.currentNote, this.currentOctave);
                delete this.currentMappings[mappingKey];
                
                this.updateMappingList();
                this.closeModal();
                
                // Refresh mappings in main app
                if (window.app) {
                    await window.app.refreshMappings();
                }
            } else {
                alert('Failed to delete mapping');
            }
        } catch (error) {
            console.error('Error deleting mapping:', error);
            alert('Error deleting mapping: ' + error.message);
        }
    }

    validateMapping(mapping) {
        switch (mapping.mapping_type) {
            case 'single_key':
            case 'key_combo':
                if (!mapping.key) {
                    alert('Please enter a key');
                    return false;
                }
                break;
            case 'text_input':
                if (!mapping.text) {
                    alert('Please enter text to type');
                    return false;
                }
                break;
            case 'command':
                if (!mapping.command) {
                    alert('Please enter a command');
                    return false;
                }
                break;
            case 'application':
                if (!mapping.application) {
                    alert('Please enter an application path');
                    return false;
                }
                break;
            case 'website':
                if (!mapping.website) {
                    alert('Please enter a website URL');
                    return false;
                }
                break;
        }
        return true;
    }

    getFormData() {
        const modifiers = [];
        if (document.getElementById('ctrl-mod').checked) modifiers.push('ctrl');
        if (document.getElementById('shift-mod').checked) modifiers.push('shift');
        if (document.getElementById('alt-mod').checked) modifiers.push('alt');
        if (document.getElementById('meta-mod').checked) modifiers.push('meta');
        
        const mappingType = document.getElementById('mapping-type').value;
        const data = {
            mapping_type: mappingType,
            trigger_mode: document.getElementById('trigger-mode').value,
            velocity_sensitive: document.getElementById('velocity-sensitive').checked,
            velocity_threshold: parseInt(document.getElementById('velocity-threshold').value)
        };
        
        // Add type-specific data
        switch (mappingType) {
            case 'single_key':
                data.key = document.getElementById('key-input').value;
                break;
            case 'key_combo':
                data.key = document.getElementById('key-input').value;
                data.modifiers = modifiers;
                break;
            case 'text_input':
                data.text = document.getElementById('text-input').value;
                break;
            case 'command':
                data.command = document.getElementById('command-input').value;
                break;
            case 'application':
                data.application = document.getElementById('application-input').value;
                break;
            case 'website':
                data.website = document.getElementById('website-input').value;
                break;
        }
        
        return data;
    }

    updateMappingList() {
        const listContainer = document.getElementById('mapping-list');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        // Group mappings by octave
        const mappingsByOctave = {};
        Object.entries(this.currentMappings).forEach(([key, mapping]) => {
            const octave = mapping.octave || 0;
            if (!mappingsByOctave[octave]) {
                mappingsByOctave[octave] = [];
            }
            mappingsByOctave[octave].push({ key, ...mapping });
        });
        
        // Sort octaves and display
        const sortedOctaves = Object.keys(mappingsByOctave).sort((a, b) => parseInt(a) - parseInt(b));
        
        if (sortedOctaves.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'mapping-item';
            emptyMessage.innerHTML = '<div class="mapping-info">No key mappings configured</div>';
            listContainer.appendChild(emptyMessage);
            return;
        }
        
        sortedOctaves.forEach(octave => {
            // Add octave header if there are multiple octaves
            if (sortedOctaves.length > 1) {
                const octaveHeader = document.createElement('div');
                octaveHeader.className = 'octave-header';
                octaveHeader.innerHTML = `<strong>Octave ${octave >= 0 ? '+' : ''}${octave}</strong>`;
                octaveHeader.style.padding = '10px';
                octaveHeader.style.backgroundColor = '#2d1b69';
                octaveHeader.style.borderLeft = '4px solid #ff9800';
                octaveHeader.style.marginBottom = '5px';
                listContainer.appendChild(octaveHeader);
            }
            
            // Sort mappings by note within octave
            mappingsByOctave[octave].sort((a, b) => a.note - b.note);
            
            // Display each mapping
            mappingsByOctave[octave].forEach(mapping => {
                const item = this.createMappingListItem(mapping);
                listContainer.appendChild(item);
            });
        });
    }

    createMappingListItem(mapping) {
        const item = document.createElement('div');
        item.className = 'mapping-item';
        
        if (mapping.octave !== 0) {
            item.classList.add('octave-mapped');
        }
        
        const noteName = this.getNoteName(mapping.note);
        const displayOctave = Math.floor((mapping.note + (mapping.octave * 12)) / 12) - 2;
        
        const mappingText = this.getMappingDescription(mapping);
        const octaveIndicator = mapping.octave !== 0 ? 
            `<span class="octave-indicator">Oct ${mapping.octave >= 0 ? '+' : ''}${mapping.octave}</span>` : '';
        
        item.innerHTML = `
            <div class="mapping-info">
                <span class="note-name">${noteName}${displayOctave}</span>
                ${octaveIndicator}
                <div class="mapping-details">${mappingText}</div>
            </div>
            <div class="mapping-actions">
                <button class="btn btn-sm" onclick="window.mappingManager.editMapping(${mapping.note}, ${mapping.octave || 0})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="window.mappingManager.deleteMappingFromList(${mapping.note}, ${mapping.octave || 0})">Delete</button>
            </div>
        `;
        
        return item;
    }

    editMapping(note, octave = 0) {
        this.openMappingDialog(note, octave);
    }

    async deleteMappingFromList(note, octave = 0) {
        this.currentNote = note;
        this.currentOctave = octave;
        await this.deleteMapping();
    }

    getMappingDescription(mapping) {
        if (!mapping) return '';
        
        let description = '';
        
        switch (mapping.mapping_type) {
            case 'single_key':
                description = `Key: ${mapping.key}`;
                break;
            case 'key_combo':
                const modifiers = mapping.modifiers && mapping.modifiers.length > 0 ? 
                    mapping.modifiers.join('+') + '+' : '';
                description = `Combo: ${modifiers}${mapping.key}`;
                break;
            case 'text_input':
                const text = mapping.text.length > 30 ? 
                    mapping.text.substring(0, 30) + '...' : mapping.text;
                description = `Text: "${text}"`;
                break;
            case 'command':
                description = `Command: ${mapping.command}`;
                break;
            case 'application':
                description = `App: ${mapping.application}`;
                break;
            case 'website':
                description = `URL: ${mapping.website}`;
                break;
            default:
                description = 'Unknown mapping type';
        }
        
        if (mapping.trigger_mode && mapping.trigger_mode !== 'press') {
            description += ` [${mapping.trigger_mode}]`;
        }
        
        if (mapping.velocity_sensitive) {
            description += ` (vel>${mapping.velocity_threshold})`;
        }
        
        return description;
    }

    async loadMappings() {
        try {
            const mappingsData = await window.electronAPI.getKeyMappings();
            this.currentMappings = mappingsData.mappings || {};
            this.updateMappingList();
        } catch (error) {
            console.error('Error loading mappings:', error);
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