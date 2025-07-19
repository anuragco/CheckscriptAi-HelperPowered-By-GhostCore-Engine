// preload.js
// This script acts as a bridge between the renderer process and the main process.
// It exposes a secure API for communication, following modern Electron security practices.

const { contextBridge, ipcRenderer } = require('electron');

// Expose a controlled set of functions to the renderer process
contextBridge.exposeInMainWorld('api', {
    // Function to send data from renderer to main
    send: (channel, data) => {
        // Whitelist channels to prevent arbitrary IPC messages
        const validChannels = [
            'ocr-complete', 
            'enter-stealth-mode',
            // NEW: Add channels for window controls
            'window-close',
            'window-minimize',
            'window-maximize'
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    // Function to receive data from main to renderer
    on: (channel, func) => {
        const validChannels = [
            'update-status', 
            'start-ocr', 
            'api-result', 
            'update-calibration', 
            'clear-calibration', 
            'activation-failed',
            'ocr-text-display',
            'update-capture-region',
            'engine-message'
        ];
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});
