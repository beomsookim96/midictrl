/**
 * Cross-platform notification system for profile switching
 */

const EventEmitter = require('events');
const { BrowserWindow } = require('electron');
const path = require('path');

class NotificationSystem extends EventEmitter {
    constructor() {
        super();
        this.notificationWindow = null;
        this.hideTimeout = null;
    }

    showProfileNotification(profileName) {
        this.showNotification(`🎹 ${profileName}`, 2500);
    }

    showNotification(message, duration = 2000) {
        // Close any existing notification
        if (this.notificationWindow && !this.notificationWindow.isDestroyed()) {
            this.notificationWindow.close();
        }

        // Clear any existing timeout
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }

        // Create notification window
        this.createNotificationWindow(message);

        // Auto-hide after duration
        this.hideTimeout = setTimeout(() => {
            this.hideNotification();
        }, duration);
    }

    createNotificationWindow(message) {
        const { screen } = require('electron');
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;

        this.notificationWindow = new BrowserWindow({
            width: 250,
            height: 80,
            x: width - 270,
            y: 50,
            frame: false,
            alwaysOnTop: true,
            skipTaskbar: true,
            resizable: false,
            movable: false,
            minimizable: false,
            maximizable: false,
            transparent: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        // Generate HTML content for the notification
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background: transparent;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                }
                
                .notification {
                    background: rgba(45, 45, 45, 0.95);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    border: 2px solid rgba(70, 130, 180, 0.8);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    text-align: center;
                    font-size: 14px;
                    font-weight: bold;
                    animation: slideIn 0.3s ease-out;
                    backdrop-filter: blur(10px);
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(300px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(300px);
                        opacity: 0;
                    }
                }
                
                .notification.hide {
                    animation: slideOut 0.3s ease-in;
                }
            </style>
        </head>
        <body>
            <div class="notification" id="notification">
                ${message}
            </div>
        </body>
        </html>
        `;

        this.notificationWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));

        // Hide on click
        this.notificationWindow.on('click', () => {
            this.hideNotification();
        });

        // Clean up when closed
        this.notificationWindow.on('closed', () => {
            this.notificationWindow = null;
            if (this.hideTimeout) {
                clearTimeout(this.hideTimeout);
                this.hideTimeout = null;
            }
        });

        this.notificationWindow.show();
    }

    hideNotification() {
        if (this.notificationWindow && !this.notificationWindow.isDestroyed()) {
            // Add hide animation before closing
            this.notificationWindow.webContents.executeJavaScript(`
                document.getElementById('notification').classList.add('hide');
                setTimeout(() => {
                    window.close();
                }, 300);
            `);
        }
    }

    cleanup() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        if (this.notificationWindow && !this.notificationWindow.isDestroyed()) {
            this.notificationWindow.close();
        }
    }
}

// Export singleton instance
const notificationSystem = new NotificationSystem();

module.exports = {
    NotificationSystem,
    showProfileNotification: (profileName) => notificationSystem.showProfileNotification(profileName),
    showNotification: (message, duration) => notificationSystem.showNotification(message, duration),
    cleanup: () => notificationSystem.cleanup()
};