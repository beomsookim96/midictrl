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
            this.devices = [
                { id: 0, name: 'Virtual nanoKEY2 (Test)', type: 'input' },
                { id: 1, name: 'Virtual MIDI Device', type: 'input' }
            ];
            return this.devices;
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
            console.log('📱 Starting virtual device mode...');
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
        console.log('🎹 Virtual MIDI device started');
        console.log('💡 Use keyboard keys 1-9, Q-O, A-L to simulate MIDI notes');
        console.log('💡 Use M key to simulate MOD button for profile switching');
        
        // Set up keyboard simulation for testing
        this.setupKeyboardSimulation();
    }

    setupKeyboardSimulation() {
        // Enable keyboard simulation for testing without real MIDI device
        if (typeof process !== 'undefined' && process.stdin && process.stdin.setRawMode) {
            try {
                process.stdin.setRawMode(true);
                process.stdin.resume();
                process.stdin.setEncoding('utf8');
                
                process.stdin.on('data', (key) => {
                // Handle special keys
                if (key === '\u0003') { // Ctrl+C
                    process.exit();
                }
                
                // Map keyboard keys to MIDI notes (nanoKEY2 range: 48-72)
                const keyMap = {
                    '1': 48, '2': 49, '3': 50, '4': 51, '5': 52,
                    '6': 53, '7': 54, '8': 55, '9': 56, '0': 57,
                    'q': 58, 'w': 59, 'e': 60, 'r': 61, 't': 62,
                    'y': 63, 'u': 64, 'i': 65, 'o': 66, 'p': 67,
                    'a': 68, 's': 69, 'd': 70, 'f': 71, 'g': 72
                };
                
                const note = keyMap[key.toLowerCase()];
                if (note) {
                    // Send note on
                    this.emit('midi-event', {
                        type: 'note',
                        note: note,
                        velocity: 100,
                        channel: 0,
                        on: true
                    });
                    
                    // Send note off after 200ms
                    setTimeout(() => {
                        this.emit('midi-event', {
                            type: 'note',
                            note: note,
                            velocity: 0,
                            channel: 0,
                            on: false
                        });
                    }, 200);
                    
                    console.log(`🎵 Virtual note: ${note} (${key})`);
                }
                
                // MOD button simulation
                if (key.toLowerCase() === 'm') {
                    this.emit('midi-event', {
                        type: 'cc',
                        controller: 1, // MOD button
                        value: 127,
                        channel: 0
                    });
                    console.log('🎛️ Virtual MOD button pressed');
                }
            });
            } catch (error) {
                console.log('⚠️ Keyboard simulation not available in this environment');
            }
        } else {
            console.log('⚠️ Keyboard simulation not supported in this environment');
        }
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