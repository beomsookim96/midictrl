/**
 * Node.js MIDI Handler for KORG nanoKEY2
 * Using easymidi or jazz-midi for MIDI operations
 */

const EventEmitter = require('events');

class MidiHandler extends EventEmitter {
    constructor(keyMapper = null) {
        super();
        this.midiInput = null;
        this.currentDevice = null;
        this.devices = [];
        this.keyMapper = keyMapper;
        
        // Try to load MIDI library
        this.initMidiLibrary();
    }

    initMidiLibrary() {
        // Try to load real MIDI libraries first
        try {
            this.midi = require('easymidi');
            // Test if easymidi actually works by calling getInputs()
            const testInputs = this.midi.getInputs();
            this.libraryType = 'easymidi';
            console.log('✅ easymidi loaded and working - real MIDI devices available');
        } catch (e) {
            console.log('⚠️ easymidi not working:', e.message);
            console.log('📦 Falling back to virtual mode for testing');
            this.libraryType = 'virtual';
            this.setupVirtualMode();
        }
    }

    getAvailableDevices() {
        if (this.libraryType === 'easymidi') {
            try {
                const inputs = this.midi.getInputs();
                console.log('🎹 Raw MIDI inputs found:', inputs);
                
                this.devices = inputs.map((name, index) => ({
                    id: index,
                    name: name,
                    type: 'input'
                }));
                
                console.log('📋 Available MIDI devices:', this.devices);
                
                // Always return all devices, let user choose
                return this.devices;
                
            } catch (error) {
                console.error('❌ Error getting MIDI devices:', error);
                return [];
            }
            
        } else if (this.libraryType === 'jazz-midi') {
            const inputs = this.jazz.MidiInList();
            this.devices = inputs.map((name, index) => ({
                id: index,
                name: name,
                type: 'input'
            }));
            
            return this.devices;
            
        } else {
            // Virtual mode - return fake devices
            return [
                { id: 0, name: 'Virtual nanoKEY2 (Test)', type: 'input' },
                { id: 1, name: 'Virtual MIDI Device', type: 'input' }
            ];
        }
    }

    connectDevice(deviceId) {
        try {
            // Prevent duplicate connections
            if (this.midiInput && this.currentDevice) {
                console.log('⚠️ Device already connected, disconnecting first...');
                this.disconnectDevice();
                // Add a small delay to ensure proper cleanup
                setTimeout(() => this.attemptConnection(deviceId), 100);
                return true;
            }

            return this.attemptConnection(deviceId);
        } catch (error) {
            console.error('❌ Failed to connect MIDI device:', error.message);
            this.emit('device-error', error);
            return false;
        }
    }

    attemptConnection(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        if (!device) {
            throw new Error(`Device with ID ${deviceId} not found`);
        }

        console.log(`🔌 Attempting to connect to device: "${device.name}"`);

        if (this.libraryType === 'easymidi') {
            try {
                console.log('📡 Creating easymidi Input...');
                this.midiInput = new this.midi.Input(device.name);
                console.log('✅ easymidi Input created successfully');
                
                // Set up event handlers
                this.midiInput.on('noteon', (msg) => {
                    this.emit('midi-event', {
                        type: 'note',
                        note: msg.note,
                        velocity: msg.velocity,
                        channel: msg.channel,
                        on: true
                    });
                });

                this.midiInput.on('noteoff', (msg) => {
                    this.emit('midi-event', {
                        type: 'note',
                        note: msg.note,
                        velocity: 0,
                        channel: msg.channel,
                        on: false
                    });
                });

                this.midiInput.on('cc', (msg) => {
                    // Special handling for mod button (controller 1) - profile switching
                    if (msg.controller === 1 && msg.value > 63 && this.keyMapper) {
                        const newProfile = this.keyMapper.switchProfile();
                        this.emit('profile-switched', newProfile);
                    }
                    
                    this.emit('midi-event', {
                        type: 'cc',
                        controller: msg.controller,
                        value: msg.value,
                        channel: msg.channel
                    });
                });

            } catch (midiError) {
                console.error('❌ easymidi connection failed:', midiError.message);
                throw midiError;
            }
            
        } else if (this.libraryType === 'jazz-midi') {
            this.midiInput = this.jazz.MidiInOpen(deviceId, (timestamp, message) => {
                this.handleRawMidiMessage(message);
            });
            
        } else {
            // Virtual mode
            this.startVirtualDevice(device);
        }

        this.currentDevice = device;
        this.emit('device-connected', device);
        
        console.log(`✅ Connected to MIDI device: ${device.name}`);
        return true;
    }

    disconnectDevice() {
        if (this.midiInput) {
            if (this.libraryType === 'easymidi') {
                this.midiInput.close();
            } else if (this.libraryType === 'jazz-midi') {
                this.jazz.MidiInClose(this.midiInput);
            } else {
                this.stopVirtualDevice();
            }
            
            this.midiInput = null;
        }

        if (this.currentDevice) {
            this.emit('device-disconnected', this.currentDevice);
            this.currentDevice = null;
        }
    }

    handleRawMidiMessage(message) {
        // Parse raw MIDI message for jazz-midi
        const status = message[0];
        const note = message[1];
        const velocity = message[2];
        
        const messageType = status & 0xF0;
        const channel = status & 0x0F;

        if (messageType === 0x90) { // Note On
            this.emit('midi-event', {
                type: 'note',
                note: note,
                velocity: velocity,
                channel: channel,
                on: velocity > 0
            });
        } else if (messageType === 0x80) { // Note Off
            this.emit('midi-event', {
                type: 'note',
                note: note,
                velocity: 0,
                channel: channel,
                on: false
            });
        } else if (messageType === 0xB0) { // Control Change
            this.emit('midi-event', {
                type: 'cc',
                controller: note,
                value: velocity,
                channel: channel
            });
        }
    }

    // Virtual mode for testing
    setupVirtualMode() {
        this.virtualTimer = null;
    }

    startVirtualDevice(device) {
        // Simulate random MIDI events for testing
        const notes = [48, 50, 52, 53, 55, 57, 59, 60]; // C major scale
        
        this.virtualTimer = setInterval(() => {
            const note = notes[Math.floor(Math.random() * notes.length)];
            const velocity = Math.floor(Math.random() * 64) + 64;
            
            // Send note on
            this.emit('midi-event', {
                type: 'note',
                note: note,
                velocity: velocity,
                channel: 0,
                on: true
            });
            
            // Send note off after delay
            setTimeout(() => {
                this.emit('midi-event', {
                    type: 'note',
                    note: note,
                    velocity: 0,
                    channel: 0,
                    on: false
                });
            }, Math.random() * 500 + 100);
            
        }, 3000 + Math.random() * 5000);
    }

    stopVirtualDevice() {
        if (this.virtualTimer) {
            clearInterval(this.virtualTimer);
            this.virtualTimer = null;
        }
    }

    cleanup() {
        this.disconnectDevice();
        this.removeAllListeners();
    }
}

module.exports = MidiHandler;