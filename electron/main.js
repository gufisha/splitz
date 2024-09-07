const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

// Suppress the sysctlbyname warning
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// Enable sandbox
app.enableSandbox();

let mainWindow;

function createWindow() {
  console.log('Creating window...');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true // Enable sandbox mode
    }
  });

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../out/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  console.log('Loading URL:', startUrl);
  
  // Check if the file exists
  if (fs.existsSync(path.join(__dirname, '../out/index.html'))) {
    console.log('index.html file exists');
  } else {
    console.log('index.html file does not exist');
    console.log('Current directory:', __dirname);
    console.log('Files in current directory:', fs.readdirSync(__dirname));
    console.log('Files in parent directory:', fs.readdirSync(path.join(__dirname, '..')));
  }

  mainWindow.loadURL(startUrl).catch(err => {
    console.error('Failed to load URL:', err);
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

process.on('uncaughtException', function (error) {
  console.log('Uncaught Exception:', error);
});