const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const MidiHandler = require('./midi/midiHandler');
const KeyMapper = require('./core/keyMapper');
const KeyboardController = require('./core/keyboardController');
const { showProfileNotification, cleanup: cleanupNotifications } = require('./core/notificationSystem');

class MidiCtrlApp {
    constructor() {
        this.mainWindow = null;
        this.midiHandler = null;
        this.keyMapper = null;
        this.keyboardController = null;
        this.isDev = process.argv.includes('--dev');
        
        this.setupApp();
    }

    setupApp() {
        // Handle app ready
        app.whenReady().then(async () => {
            await this.initializeBackend();
            this.createWindow();
            this.setupIPC();
            
            app.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) {
                    this.createWindow();
                }
            });
        });

        // Handle app quit
        app.on('window-all-closed', () => {
            this.cleanup();
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        app.on('before-quit', () => {
            this.cleanup();
        });
    }

    async initializeBackend() {
        console.log('🚀 Initializing Node.js backend...');
        
        // Initialize key mapper
        this.keyMapper = new KeyMapper();
        
        // Initialize MIDI handler with key mapper reference
        this.midiHandler = new MidiHandler(this.keyMapper);
        
        // Initialize keyboard controller with key mapper reference
        this.keyboardController = new KeyboardController(this.keyMapper);
        await this.keyboardController.initRobot();
        
        // Connect MIDI events to keyboard controller
        this.midiHandler.on('midi-event', async (event) => {
            if (event.type === 'note') {
                const mapping = this.keyMapper.getMapping(event.note);
                
                if (mapping) {
                    if (event.on) {
                        // Note on - execute mapping based on trigger mode
                        if (mapping.trigger_mode !== 'release') {
                            await this.keyboardController.executeMapping(mapping, event.velocity);
                        }
                    } else {
                        // Note off - handle release and held keys
                        if (mapping.trigger_mode === 'release') {
                            await this.keyboardController.executeMapping(mapping);
                        } else if (mapping.trigger_mode === 'hold') {
                            await this.keyboardController.releaseKey(
                                mapping.key, 
                                mapping.modifiers
                            );
                        }
                    }
                }
                
                // Forward event to renderer
                if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                    this.mainWindow.webContents.send('midi-event', event);
                }
            }
        });
        
        // Forward device events to renderer
        this.midiHandler.on('device-connected', (device) => {
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                this.mainWindow.webContents.send('device-connected', device);
            }
        });
        
        this.midiHandler.on('device-disconnected', (device) => {
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                this.mainWindow.webContents.send('device-disconnected', device);
            }
        });
        
        // Handle profile switching
        this.midiHandler.on('profile-switched', (profileName) => {
            console.log(`Profile switched to: ${profileName}`);
            showProfileNotification(profileName);
            
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                this.mainWindow.webContents.send('profile-switched', profileName);
            }
        });
        
        console.log('✅ Backend initialized successfully');
    }

    createWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                nodeIntegration: false
            },
            icon: path.join(__dirname, '../assets/icon.png'),
            title: 'MidiCtrl - KORG nanoKEY2 Mapper'
        });

        // Load the app
        this.mainWindow.loadFile(path.join(__dirname, 'index.html'));

        // Show window when ready
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
            console.log('📱 Main window ready and shown');
            
            if (this.isDev) {
                this.mainWindow.webContents.openDevTools();
            }
        });
        
        // Log when DOM is ready
        this.mainWindow.webContents.once('dom-ready', () => {
            console.log('🌐 DOM content loaded in renderer');
        });

        // Handle window closed
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }

    setupIPC() {
        // MIDI device operations
        ipcMain.handle('get-midi-devices', async () => {
            console.log('🔍 IPC: get-midi-devices called');
            const devices = this.midiHandler.getAvailableDevices();
            console.log('📋 IPC: returning devices:', devices);
            return devices;
        });

        ipcMain.handle('connect-device', async (event, deviceId) => {
            return this.midiHandler.connectDevice(deviceId);
        });

        ipcMain.handle('disconnect-device', async () => {
            this.midiHandler.disconnectDevice();
            return true;
        });

        // Key mapping operations
        ipcMain.handle('set-key-mapping', async (event, note, mapping) => {
            return this.keyMapper.setMapping(note, mapping);
        });

        ipcMain.handle('get-key-mappings', async () => {
            return {
                mappings: this.keyMapper.getAllMappings()
            };
        });

        ipcMain.handle('load-preset', async (event, presetName) => {
            return this.keyMapper.loadPreset(presetName);
        });

        ipcMain.handle('save-preset', async (event, presetName) => {
            return this.keyMapper.savePreset(presetName);
        });
        
        ipcMain.handle('get-presets', async () => {
            return this.keyMapper.getAvailablePresets();
        });
        
        ipcMain.handle('clear-all-mappings', async () => {
            return this.keyMapper.clearAllMappings();
        });

        // Profile operations
        ipcMain.handle('switch-profile', async () => {
            return this.keyMapper.switchProfile();
        });

        ipcMain.handle('get-current-profile', async () => {
            return this.keyMapper.currentProfile;
        });

        // File operations
        ipcMain.handle('show-open-dialog', async (event, options) => {
            const result = await dialog.showOpenDialog(this.mainWindow, options);
            return result;
        });

        ipcMain.handle('show-save-dialog', async (event, options) => {
            const result = await dialog.showSaveDialog(this.mainWindow, options);
            return result;
        });
        
        // App info
        ipcMain.handle('get-app-info', async () => {
            return {
                version: app.getVersion(),
                platform: process.platform,
                nodeVersion: process.versions.node,
                electronVersion: process.versions.electron
            };
        });
    }

    cleanup() {
        console.log('🧹 Cleaning up application...');
        
        if (this.keyboardController) {
            this.keyboardController.cleanup();
        }
        
        if (this.midiHandler) {
            this.midiHandler.cleanup();
        }
        
        if (this.keyMapper) {
            this.keyMapper.removeAllListeners();
        }
        
        // Clean up notifications
        cleanupNotifications();
    }
}

// Create and start the app
new MidiCtrlApp();