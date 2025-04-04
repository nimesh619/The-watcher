const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    // Window controls
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    maximizeWindow: () => ipcRenderer.send('maximize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),

    // File scanning
    selectFile: () => ipcRenderer.invoke('select-file'),
    scanFile: (filePath) => ipcRenderer.invoke('scan-file', filePath),
    getScanHistory: () => ipcRenderer.invoke('get-scan-history')
});