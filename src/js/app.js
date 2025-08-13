// Main Application Module - No WebSocket needed!
class MidiCtrlApp {
    constructor() {
        this.midiConnected = false;
        this.currentDevice = null;
        this.devices = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupElectronIPC();
        this.updateUI();
        this.loadInitialData();
        
        console.log('MidiCtrl App initialized (Node.js backend)');
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
        
        // Control buttons
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleControlButton(btn));
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

        // Profile switching events
        window.electronAPI.onProfileSwitched((profileName) => {
            this.handleProfileSwitch(profileName);
        });
    }

    async loadInitialData() {
        // Load mappings on startup
        try {
            await this.refreshDevices();
            
            if (window.mappingManager) {
                await window.mappingManager.loadMappings();
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async refreshDevices() {
        try {
            console.log('🔄 Refreshing MIDI devices...');
            this.devices = await window.electronAPI.getMidiDevices();
            console.log('📱 Frontend received devices:', this.devices);
            this.updateDeviceList();
            
            // Auto-select nanoKEY2 if available
            const nanokey = this.devices.find(device => 
                device.name.toLowerCase().includes('nanokey2') || 
                device.name.toLowerCase().includes('nanokey 2')
            );
            
            if (nanokey) {
                document.getElementById('device-select').value = nanokey.id;
                document.getElementById('connect-btn').disabled = false;
            }
            
            console.log(`Found ${this.devices.length} MIDI devices`);
            
        } catch (error) {
            console.error('Error refreshing devices:', error);
            this.showError('Failed to refresh MIDI devices');
        }
    }

    updateDeviceList() {
        const select = document.getElementById('device-select');
        select.innerHTML = '<option value="">Select a MIDI device...</option>';
        
        this.devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.id;
            option.textContent = device.name;
            select.appendChild(option);
        });
    }

    async connectDevice() {
        const deviceSelect = document.getElementById('device-select');
        const deviceId = parseInt(deviceSelect.value);
        
        if (!Number.isInteger(deviceId)) return;
        
        try {
            const success = await window.electronAPI.connectDevice(deviceId);
            
            if (success) {
                this.midiConnected = true;
                const selectedDevice = this.devices.find(d => d.id === deviceId);
                this.currentDevice = selectedDevice?.name || 'Unknown';
                this.updateConnectionStatus();
                this.updateUI();
                this.showSuccess(`Connected to ${this.currentDevice}`);
            } else {
                this.showError('Failed to connect to MIDI device');
            }
        } catch (error) {
            console.error('Error connecting device:', error);
            this.showError('Error connecting to MIDI device: ' + error.message);
        }
    }

    async disconnectDevice() {
        try {
            await window.electronAPI.disconnectDevice();
            this.midiConnected = false;
            this.currentDevice = null;
            this.updateConnectionStatus();
            this.updateUI();
            this.showSuccess('MIDI device disconnected');
        } catch (error) {
            console.error('Error disconnecting device:', error);
            this.showError('Error disconnecting MIDI device');
        }
    }

    handleControlButton(button) {
        const control = button.dataset.control;
        
        // Visual feedback
        button.classList.add('animate-press', 'pressed');
        setTimeout(() => {
            button.classList.remove('animate-press', 'pressed');
        }, 150);
        
        console.log(`Control button pressed: ${control}`);
        
        // Control buttons can be mapped like regular keys
        // They typically send CC messages
    }

    handleMidiEvent(event) {
        // Forward to piano keyboard for visualization
        if (window.pianoKeyboard) {
            window.pianoKeyboard.highlightKey(
                event.note,
                event.on,
                event.velocity
            );
        }
        
        // Forward to mapping manager for processing
        if (window.mappingManager) {
            window.mappingManager.handleMidiEvent(event);
        }
        
        // Log for debugging
        if (event.type === 'note') {
            console.log(`MIDI Note: ${event.note} ${event.on ? 'ON' : 'OFF'} (velocity: ${event.velocity})`);
        } else if (event.type === 'cc') {
            console.log(`MIDI CC: ${event.controller} = ${event.value}`);
        }
    }

    handleProfileSwitch(profileName) {
        console.log(`Profile switched to: ${profileName}`);
        
        // Update profile status indicator
        const profileStatus = document.getElementById('profile-status');
        if (profileStatus) {
            const profileText = profileStatus.querySelector('.status-text');
            profileText.textContent = profileName;
            
            // Add visual feedback
            profileStatus.classList.add('profile-switched');
            setTimeout(() => {
                profileStatus.classList.remove('profile-switched');
            }, 1000);
        }
        
        // Reload mappings for the new profile
        if (window.mappingManager) {
            window.mappingManager.loadMappings();
        }
        
        // Show success message
        this.showSuccess(`Switched to ${profileName}`);
    }

    updateConnectionStatus() {
        // MIDI status
        const midiStatus = document.getElementById('midi-status');
        if (midiStatus) {
            const midiDot = midiStatus.querySelector('.status-dot');
            const midiText = midiStatus.querySelector('.status-text');
            
            if (this.midiConnected && this.currentDevice) {
                midiDot.className = 'status-dot connected';
                midiText.textContent = `Connected: ${this.currentDevice}`;
            } else {
                midiDot.className = 'status-dot';
                midiText.textContent = 'No Device';
            }
        }
        
        // Update header status
        const headerStatus = document.querySelector('.connection-status');
        if (headerStatus) {
            headerStatus.textContent = this.midiConnected ? 
                `🎹 ${this.currentDevice}` : 
                '⚠️ No MIDI Device';
            headerStatus.className = this.midiConnected ? 
                'connection-status connected' : 
                'connection-status disconnected';
        }
    }

    updateUI() {
        // Enable/disable controls based on connection status
        document.getElementById('device-select').disabled = false;
        document.getElementById('refresh-btn').disabled = false;
        
        const deviceSelect = document.getElementById('device-select');
        const hasSelectedDevice = deviceSelect.value;
        
        document.getElementById('connect-btn').disabled = !hasSelectedDevice || this.midiConnected;
        document.getElementById('disconnect-btn').disabled = !this.midiConnected;
    }

    showError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <span class="toast-icon">❌</span>
            <span class="toast-message">${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showSuccess(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `
            <span class="toast-icon">✅</span>
            <span class="toast-message">${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// Application lifecycle
document.addEventListener('DOMContentLoaded', () => {
    window.midiCtrlApp = new MidiCtrlApp();
});

// Handle app errors
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});