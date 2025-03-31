const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');

// VirusTotal API key
const VIRUSTOTAL_API_KEY = 'd60f914e126037a5f8d62cdf6474760784b88719a84981eedbebb16f16855630';
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3';

// Use process.env.NODE_ENV directly instead of electron-is-dev
const isDev = process.env.NODE_ENV === 'development';

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow = null;
let splashWindow = null;

const createSplashWindow = () => {
  // Create the splash window
  splashWindow = new BrowserWindow({
    width: 360,
    height: 400,
    transparent: true,
    backgroundColor: undefined,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    roundedCorners: true,
    titleBarStyle: 'hidden',
  });

  // Load splash screen
  if (isDev) {
    splashWindow.loadFile(path.join(__dirname, 'public/splash.html'));
  } else {
    splashWindow.loadFile(path.join(__dirname, 'public/splash.html'));
  }

  // Show splash screen when ready
  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
  });

  // Handle window close
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
};

const createMainWindow = () => {
  // Create the main application window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  // Load main app
  if (isDev) {
    mainWindow.loadFile(path.join(__dirname, 'public/index.html'));
    // Open DevTools in development mode
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'public/index.html'));
  }

  // Show main window after delay
  mainWindow.once('ready-to-show', () => {
    // Simulate loading time (5 seconds)
    setTimeout(() => {
      if (mainWindow) mainWindow.show();
      if (splashWindow) splashWindow.close();
    }, 5000);
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Set up IPC handlers for window controls
const setupWindowControls = () => {
  ipcMain.on('minimize-window', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) window.minimize();
  });

  ipcMain.on('maximize-window', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
  });

  ipcMain.on('close-window', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) window.close();
  });
};

// Setup VirusTotal API handlers
const setupVirusTotalApi = () => {
  // Submit a file for scanning
  ipcMain.handle('scan-file', async (event, hash) => {
    try {
      console.log(`Submitting file with hash ${hash} for scanning...`);
      // In a real implementation, we would upload the file to VirusTotal
      // For now, we'll just simulate a successful response
      return {
        success: true,
        message: 'File submitted for scanning',
        data: {
          id: hash,
          links: {
            self: `https://www.virustotal.com/api/v3/analyses/${hash}`,
          }
        }
      };
    } catch (error) {
      console.error('Error submitting file for scanning:', error);
      return {
        success: false,
        message: error.message || 'Failed to submit file for scanning',
      };
    }
  });
  
  // Get report for a file by its hash
  ipcMain.handle('get-file-report', async (event, hash) => {
    try {
      console.log(`Getting report for file with hash ${hash}...`);
      // In a real implementation, we would make an API request like:
      /*
      const response = await axios.get(
        `${VIRUSTOTAL_API_URL}/files/${hash}`,
        {
          headers: {
            'x-apikey': VIRUSTOTAL_API_KEY
          }
        }
      );
      return {
        success: true,
        data: response.data
      };
      */
      
      // For now simulate a response
      // Generate a random number of detections
      const totalEngines = 68;
      const detections = Math.floor(Math.random() * totalEngines);
      const isMalicious = detections > 5;
      
      return {
        success: true,
        data: {
          data: {
            attributes: {
              last_analysis_stats: {
                harmless: totalEngines - detections,
                malicious: detections,
                suspicious: 0,
                undetected: 0,
                timeout: 0
              },
              last_analysis_date: Date.now() / 1000,
              meaningful_name: `sample-${hash.substring(0, 8)}.exe`,
              total_votes: {
                harmless: isMalicious ? 2 : 15,
                malicious: isMalicious ? 18 : 1
              }
            },
            id: hash,
            links: {
              self: `https://www.virustotal.com/gui/file/${hash}/detection`
            },
            type: 'file'
          }
        }
      };
    } catch (error) {
      console.error('Error getting file report:', error);
      return {
        success: false,
        message: error.message || 'Failed to get file report',
      };
    }
  });
};

// When Electron is ready, create windows
app.whenReady().then(() => {
  setupWindowControls();
  setupVirusTotalApi();
  createSplashWindow();
  createMainWindow();

  // For macOS: recreate window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});