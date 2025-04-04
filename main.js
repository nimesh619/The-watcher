const { app, BrowserWindow, ipcMain } = require('electron');
const { setupFileScanningHandlers } = require('./src/main/fileScanning.js');
const path = require('path');

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
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src/preload/index.js')
    },
    roundedCorners: true,
    titleBarStyle: 'hidden',
  });

  // Load splash screen
  splashWindow.loadFile('public/splash.html');

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
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src/preload/index.js'),
      webSecurity: true
    },
  });

  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' https:;",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;",
          "style-src 'self' 'unsafe-inline' https:;",
          "img-src 'self' data: https:;",
          "font-src 'self' https: data:;",
          "connect-src 'self' https:;"
        ].join(' ')
      }
    });
  });

  // Load main app
  if (isDev) {
    // In development, load from vite dev server
    mainWindow.loadURL('http://localhost:5173/index.html');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built index.html
    mainWindow.loadFile('dist/index.html');
  }

  // Show main window after delay
  mainWindow.once('ready-to-show', () => {
    // Simulate loading time (2 seconds)
    setTimeout(() => {
      if (mainWindow) mainWindow.show();
      if (splashWindow) splashWindow.close();
    }, 2000);
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

// When Electron is ready, create windows
app.whenReady().then(() => {
  setupWindowControls();
  setupFileScanningHandlers();
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