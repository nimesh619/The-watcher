// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing all of electron
contextBridge.exposeInMainWorld(
  'electronAPI', {
    platform: process.platform,
    versions: {
      node: process.versions.node,
      electron: process.versions.electron
    },
    // Window control functions
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window'),
    
    // VirusTotal API methods
    scanFile: (hash) => ipcRenderer.invoke('scan-file', hash),
    getFileReport: (hash) => ipcRenderer.invoke('get-file-report', hash)
  }
);

window.addEventListener('DOMContentLoaded', () => {
  console.log('Preload script loaded!');
});