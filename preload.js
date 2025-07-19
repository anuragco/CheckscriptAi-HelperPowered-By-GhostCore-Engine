const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
        const validChannels = [
            'ocr-complete', 
            'enter-stealth-mode',
            'window-close',
            'window-minimize',
            'window-maximize'
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
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
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});
