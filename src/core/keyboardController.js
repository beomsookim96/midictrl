/**
 * Node.js Keyboard Controller using robotjs or nut.js
 */

const EventEmitter = require('events');

class KeyboardController extends EventEmitter {
    constructor(keyMapper = null) {
        super();
        this.robot = null;
        this.keyMapper = keyMapper;
        this.initRobot();
        this.activeKeys = new Set();
        this.toggleStates = new Map();
    }

    async initRobot() {
        // Start in virtual mode
        this.libraryType = 'virtual';
        console.log('Keyboard controller initializing...');
        
        // Try nut-js first (more modern and cross-platform)
        try {
            const { keyboard, Key } = require('@nut-tree-fork/nut-js');
            // Test if nut-js actually works
            await keyboard.type(''); // Empty test
            this.nutKeyboard = keyboard;
            this.nutKey = Key;
            this.libraryType = 'nutjs';
            console.log('✅ nut-js loaded and working - real keyboard control enabled');
            return;
        } catch (e) {
            console.log('⚠️ nut-js failed to load:', e.message);
        }
        
        // Fallback to robotjs
        try {
            this.robot = require('robotjs');
            // Test if robotjs actually works
            this.robot.getMousePos(); // Simple test call
            this.libraryType = 'robotjs';
            console.log('✅ robotjs loaded and working - real keyboard control enabled');
            return;
        } catch (e) {
            console.log('⚠️ robotjs failed to load:', e.message);
        }
        
        console.log('📦 Using virtual mode - keyboard actions will be logged only');
        console.log('💡 For real keyboard control:');
        console.log('   1. On Windows: Run fix_robotjs.bat as Administrator');
        console.log('   2. Make sure Visual Studio Build Tools are installed');
        console.log('   3. Use npm run test-robotjs to verify');
    }

    async executeMapping(mapping, velocity = 127) {
        if (this.libraryType === 'virtual') {
            const action = this.getActionDescription(mapping, velocity);
            console.log(`🎹 Virtual Keyboard: ${action}`);
            this.emit('virtual-execute', { mapping, velocity, action });
            return;
        }

        const { 
            mapping_type, 
            trigger_mode, 
            key, 
            modifiers = [], 
            text, 
            command,
            application_path,
            website_url,
            velocity_sensitive,
            velocity_threshold = 64
        } = mapping;

        // Check velocity threshold if velocity sensitive
        if (velocity_sensitive && velocity < velocity_threshold) {
            return;
        }

        try {
            switch (mapping_type) {
                case 'single_key':
                    await this.pressKey(key, modifiers, trigger_mode);
                    break;
                    
                case 'key_combo':
                    await this.pressKeyCombo(key, modifiers, trigger_mode);
                    break;
                    
                case 'text_input':
                    if (text) {
                        await this.typeText(text);
                    }
                    break;
                    
                case 'command':
                    if (command) {
                        this.executeCommand(command);
                    }
                    break;
                    
                case 'application':
                    if (application_path) {
                        this.executeApplication(application_path);
                    }
                    break;
                    
                case 'website':
                    if (website_url) {
                        this.executeWebsite(website_url);
                    }
                    break;
                    
                case 'macro':
                    // TODO: Implement macro playback
                    break;
            }
        } catch (error) {
            console.error('Failed to execute mapping:', error);
            this.emit('execution-error', { mapping, error });
        }
    }

    async pressKey(key, modifiers = [], triggerMode = 'press') {
        const keyName = this.normalizeKeyName(key);
        
        if (triggerMode === 'toggle') {
            const isPressed = this.toggleStates.get(keyName) || false;
            if (isPressed) {
                await this.releaseKey(keyName, modifiers);
                this.toggleStates.set(keyName, false);
            } else {
                await this.holdKey(keyName, modifiers);
                this.toggleStates.set(keyName, true);
            }
            return;
        }

        if (this.libraryType === 'robotjs') {
            // Apply modifiers
            for (const mod of modifiers) {
                this.robot.keyToggle(this.normalizeKeyName(mod), 'down');
            }
            
            if (triggerMode === 'press' || triggerMode === 'hold') {
                this.robot.keyToggle(keyName, 'down');
                
                if (triggerMode === 'press') {
                    setTimeout(() => {
                        this.robot.keyToggle(keyName, 'up');
                        
                        // Release modifiers
                        for (const mod of modifiers.reverse()) {
                            this.robot.keyToggle(this.normalizeKeyName(mod), 'up');
                        }
                    }, 50);
                } else {
                    // Hold mode - will be released on note off
                    this.activeKeys.add(keyName);
                }
            } else if (triggerMode === 'release') {
                // Will be executed on note off event
                this.activeKeys.add(keyName);
            }
            
        } else if (this.libraryType === 'nutjs') {
            // nut.js implementation (async)
            const keys = [];
            
            for (const mod of modifiers) {
                keys.push(this.getNutKey(mod));
            }
            keys.push(this.getNutKey(keyName));
            
            if (triggerMode === 'press') {
                await this.nutKeyboard.type(...keys);
            } else if (triggerMode === 'hold') {
                await this.nutKeyboard.pressKey(...keys);
                this.activeKeys.add(keyName);
            }
        }
    }

    async pressKeyCombo(key, modifiers = [], triggerMode = 'press') {
        // Key combo is similar to single key but always includes modifiers
        await this.pressKey(key, modifiers, triggerMode);
    }

    async releaseKey(key, modifiers = []) {
        const keyName = this.normalizeKeyName(key);
        
        if (this.libraryType === 'robotjs') {
            this.robot.keyToggle(keyName, 'up');
            
            // Release modifiers
            for (const mod of modifiers.reverse()) {
                this.robot.keyToggle(this.normalizeKeyName(mod), 'up');
            }
        } else if (this.libraryType === 'nutjs') {
            const keys = [this.getNutKey(keyName)];
            for (const mod of modifiers) {
                keys.push(this.getNutKey(mod));
            }
            await this.nutKeyboard.releaseKey(...keys);
        }
        
        this.activeKeys.delete(keyName);
    }

    async holdKey(key, modifiers = []) {
        const keyName = this.normalizeKeyName(key);
        
        if (this.libraryType === 'robotjs') {
            // Apply modifiers
            for (const mod of modifiers) {
                this.robot.keyToggle(this.normalizeKeyName(mod), 'down');
            }
            this.robot.keyToggle(keyName, 'down');
            
        } else if (this.libraryType === 'nutjs') {
            const keys = [];
            for (const mod of modifiers) {
                keys.push(this.getNutKey(mod));
            }
            keys.push(this.getNutKey(keyName));
            await this.nutKeyboard.pressKey(...keys);
        }
        
        this.activeKeys.add(keyName);
    }

    async typeText(text) {
        try {
            // Try to use clipboard for faster text input
            const { clipboard } = require('electron');
            if (clipboard) {
                const originalClipboard = clipboard.readText();
                clipboard.writeText(text);
                
                // Paste using Ctrl+V
                if (this.libraryType === 'robotjs') {
                    this.robot.keyToggle('control', 'down');
                    this.robot.keyToggle('v', 'down');
                    this.robot.keyToggle('v', 'up');
                    this.robot.keyToggle('control', 'up');
                } else if (this.libraryType === 'nutjs') {
                    await this.nutKeyboard.type(this.nutKey.LeftControl, this.nutKey.V);
                }
                
                // Restore original clipboard after a delay
                setTimeout(() => {
                    clipboard.writeText(originalClipboard);
                }, 100);
                
                return;
            }
        } catch (error) {
            console.log('Clipboard method failed, using character-by-character typing');
        }
        
        // Fallback to character-by-character typing
        if (this.libraryType === 'robotjs') {
            this.robot.typeString(text);
        } else if (this.libraryType === 'nutjs') {
            await this.nutKeyboard.type(text);
        }
    }

    executeCommand(command) {
        // Execute system command (be careful with this!)
        const { exec } = require('child_process');
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Command execution failed:', error);
                this.emit('command-error', { command, error });
            } else {
                console.log('Command executed:', command);
                this.emit('command-executed', { command, stdout });
            }
        });
    }

    executeApplication(applicationPath) {
        const { exec } = require('child_process');
        const os = require('os');
        
        let command;
        if (os.platform() === 'win32') {
            command = `start "" "${applicationPath}"`;
        } else if (os.platform() === 'darwin') {
            command = `open "${applicationPath}"`;
        } else {
            command = `xdg-open "${applicationPath}"`;
        }
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Application execution failed:', error);
                this.emit('application-error', { applicationPath, error });
            } else {
                console.log('Application executed:', applicationPath);
                this.emit('application-executed', { applicationPath });
            }
        });
    }

    executeWebsite(websiteUrl) {
        const { shell } = require('electron');
        
        try {
            shell.openExternal(websiteUrl);
            console.log('Website opened:', websiteUrl);
            this.emit('website-opened', { websiteUrl });
        } catch (error) {
            console.error('Website opening failed:', error);
            this.emit('website-error', { websiteUrl, error });
        }
    }

    releaseAllKeys() {
        // Release all held keys
        for (const key of this.activeKeys) {
            if (this.libraryType === 'robotjs') {
                this.robot.keyToggle(key, 'up');
            }
        }
        this.activeKeys.clear();
        this.toggleStates.clear();
    }

    normalizeKeyName(key) {
        // Normalize key names for robotjs
        const keyMap = {
            'ctrl': 'control',
            'cmd': 'command',
            'meta': 'command',
            'win': 'command',
            'return': 'enter',
            'esc': 'escape',
            'del': 'delete',
            'Delete': 'delete',
            'ins': 'insert',
            'pgup': 'pageup',
            'pgdn': 'pagedown',
            'caps': 'capslock',
            'num': 'numlock',
            'scroll': 'scrolllock',
            'break': 'pause',
            'plus': '+',
            'minus': '-',
            'equals': '=',
            'comma': ',',
            'period': '.',
            'slash': '/',
            'backslash': '\\',
            'semicolon': ';',
            'quote': "'",
            'bracket_left': '[',
            'bracket_right': ']',
            'grave': '`'
        };
        
        const normalized = key.toLowerCase();
        return keyMap[normalized] || normalized;
    }

    getNutKey(keyName) {
        // Map key names to nut.js Key enum
        const keyMap = {
            // Common keys
            'enter': this.nutKey.Enter,
            'space': this.nutKey.Space,
            'tab': this.nutKey.Tab,
            'escape': this.nutKey.Escape,
            'backspace': this.nutKey.Backspace,
            'delete': this.nutKey.Delete,
            
            // Modifiers
            'ctrl': this.nutKey.LeftControl,
            'control': this.nutKey.LeftControl,
            'shift': this.nutKey.LeftShift,
            'alt': this.nutKey.LeftAlt,
            'meta': this.nutKey.LeftSuper,
            'cmd': this.nutKey.LeftSuper,
            'win': this.nutKey.LeftSuper,
            
            // Function keys
            'f1': this.nutKey.F1,
            'f2': this.nutKey.F2,
            'f3': this.nutKey.F3,
            'f4': this.nutKey.F4,
            'f5': this.nutKey.F5,
            'f6': this.nutKey.F6,
            'f7': this.nutKey.F7,
            'f8': this.nutKey.F8,
            'f9': this.nutKey.F9,
            'f10': this.nutKey.F10,
            'f11': this.nutKey.F11,
            'f12': this.nutKey.F12,
            
            // Arrow keys
            'up': this.nutKey.Up,
            'down': this.nutKey.Down,
            'left': this.nutKey.Left,
            'right': this.nutKey.Right,
            
            // Numbers
            '0': this.nutKey.Num0,
            '1': this.nutKey.Num1,
            '2': this.nutKey.Num2,
            '3': this.nutKey.Num3,
            '4': this.nutKey.Num4,
            '5': this.nutKey.Num5,
            '6': this.nutKey.Num6,
            '7': this.nutKey.Num7,
            '8': this.nutKey.Num8,
            '9': this.nutKey.Num9,
        };
        
        const normalized = keyName.toLowerCase();
        
        // Check if it's in our map
        if (keyMap[normalized]) {
            return keyMap[normalized];
        }
        
        // For single letters, use the Key enum directly
        if (normalized.length === 1 && normalized >= 'a' && normalized <= 'z') {
            const upperKey = normalized.toUpperCase();
            return this.nutKey[upperKey] || this.nutKey.A;
        }
        
        // Fallback
        return this.nutKey.A;
    }

    getActionDescription(mapping, velocity = 127) {
        const { mapping_type, key, modifiers = [], text, command, application_path, website_url, trigger_mode } = mapping;
        
        switch (mapping_type) {
            case 'single_key':
                const modStr = modifiers.length > 0 ? modifiers.join('+') + '+' : '';
                return `Press ${modStr}${key} (${trigger_mode} mode)`;
                
            case 'key_combo':
                const comboStr = [...modifiers, key].join('+');
                return `Key combo: ${comboStr} (${trigger_mode} mode)`;
                
            case 'text_input':
                return `Type text: "${text}"`;
                
            case 'command':
                return `Execute command: "${command}"`;
                
            case 'application':
                return `Launch application: "${application_path}"`;
                
            case 'website':
                return `Open website: "${website_url}"`;
                
            case 'macro':
                return `Run macro (not implemented)`;
                
            default:
                return `Unknown mapping type: ${mapping_type}`;
        }
    }

    cleanup() {
        this.releaseAllKeys();
        this.removeAllListeners();
    }
}

module.exports = KeyboardController;