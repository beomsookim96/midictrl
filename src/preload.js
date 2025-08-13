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
    setKeyMappingWithOctave: (note, octave, mapping) => ipcRenderer.invoke('set-key-mapping-with-octave', note, octave, mapping),
    setControlMapping: (controlType, mapping) => ipcRenderer.invoke('set-control-mapping', controlType, mapping),
    getKeyMappings: () => ipcRenderer.invoke('get-key-mappings'),
    
    // Preset operations
    loadPreset: (presetName) => ipcRenderer.invoke('load-preset', presetName),
    savePreset: (presetName, description) => ipcRenderer.invoke('save-preset', presetName, description),
    getPresets: () => ipcRenderer.invoke('get-presets'),
    clearAllMappings: () => ipcRenderer.invoke('clear-all-mappings'),
    
    // Enhanced Profile operations
    switchProfile: (direction) => ipcRenderer.invoke('switch-profile', direction),
    getCurrentProfile: () => ipcRenderer.invoke('get-current-profile'),
    getAllProfiles: () => ipcRenderer.invoke('get-all-profiles'),
    createProfile: (name, description) => ipcRenderer.invoke('create-profile', name, description),
    updateProfile: (oldName, newName, description) => ipcRenderer.invoke('update-profile', oldName, newName, description),
    deleteProfile: (name) => ipcRenderer.invoke('delete-profile', name),
    duplicateProfile: (sourceName, newName) => ipcRenderer.invoke('duplicate-profile', sourceName, newName),
    setProfileCycleList: (profileNames) => ipcRenderer.invoke('set-profile-cycle-list', profileNames),
    getProfileCycleList: () => ipcRenderer.invoke('get-profile-cycle-list'),
    
    // Octave operations
    setOctave: (octave) => ipcRenderer.invoke('set-octave', octave),
    getOctave: () => ipcRenderer.invoke('get-octave'),
    
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
    onProfileSwitched: (callback) => ipcRenderer.on('profile-switched', (event, data) => callback(data)),
    onControlAction: (callback) => ipcRenderer.on('control-action', (event, data) => callback(data)),
    
    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});