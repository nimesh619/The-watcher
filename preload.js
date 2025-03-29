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
    close: () => ipcRenderer.send('close-window')
  }
);

window.addEventListener('DOMContentLoaded', () => {
  console.log('Preload script loaded!');
}); 