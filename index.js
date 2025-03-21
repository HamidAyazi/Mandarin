try {
    require('electron-reloader')(module, {
        debug: true, // Enable debug logs
        watchRenderer: true, // Watch renderer files as well
    });
} catch (error) {
    console.log('Hot reload not enabled:', error);
}

const path = require('path');
const electronReload = require('electron-reload');

// Enable hot reload for renderer files
electronReload(path.join(__dirname, 'index.html'), {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'), // Path to Electron executable
    hardResetMethod: 'exit', // Force restart the app on changes
});
const { app, BrowserWindow, ipcMain } = require("electron");

let win;
let winX, winY, dragStartX, dragStartY;

function createWindow() {
    win = new BrowserWindow({
        width: 200,
        height: 200,
        transparent: true,
        frame: false,
        resizable: false,
        alwaysOnTop: true,
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });

    win.loadFile("index.html");
    win.setIgnoreMouseEvents(true, { forward: true });

    ipcMain.on("toggle-ignore-mouse", (event, ignore) => {
        win.setIgnoreMouseEvents(ignore, { forward: true });
    });

    ipcMain.on("start-drag", (event, startX, startY) => {
        const bounds = win.getBounds();
        winX = bounds.x;
        winY = bounds.y;
        dragStartX = startX;
        dragStartY = startY;
    });

    ipcMain.on("move-window", (event, screenX, screenY) => {
        if (win) {
            win.setBounds({
                x: winX + (screenX - dragStartX),
                y: winY + (screenY - dragStartY),
                width: win.getBounds().width,
                height: win.getBounds().height
            });
        }
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
