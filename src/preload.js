const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // MIDI device operations
    getMidiDevices: () => ipcRenderer.invoke('get-midi-devices'),
    connectDevice: (deviceId) => ipcRenderer.invoke('connect-device', deviceId),
    disconnectDevice: () => ipcRenderer.invoke('disconnect-device'),
    
    // Key mapping operations
    setKeyMapping: (note, mapping) => ipcRenderer.invoke('set-key-mapping', note, mapping),
    getKeyMappings: () => ipcRenderer.invoke('get-key-mappings'),
    
    // Preset operations
    loadPreset: (presetName) => ipcRenderer.invoke('load-preset', presetName),
    savePreset: (presetName) => ipcRenderer.invoke('save-preset', presetName),
    getPresets: () => ipcRenderer.invoke('get-presets'),
    clearAllMappings: () => ipcRenderer.invoke('clear-all-mappings'),
    getAppInfo: () => ipcRenderer.invoke('get-app-info'),
    
    // File operations
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    
    // Event listeners
    onBackendConnected: (callback) => ipcRenderer.on('backend-connected', callback),
    onBackendDisconnected: (callback) => ipcRenderer.on('backend-disconnected', callback),
    onMidiEvent: (callback) => ipcRenderer.on('midi-event', (event, data) => callback(data)),
    onDeviceConnected: (callback) => ipcRenderer.on('device-connected', (event, data) => callback(data)),
    onDeviceDisconnected: (callback) => ipcRenderer.on('device-disconnected', (event, data) => callback(data)),
    
    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});