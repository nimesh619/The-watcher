const { app, BrowserWindow, ipcMain } = require('electron');
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

// When Electron is ready, create windows
app.whenReady().then(() => {
  setupWindowControls();
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