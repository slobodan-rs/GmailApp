// Modules to control application life and create native browser window
const { app, BrowserWindow, Notification, Menu, Tray } = require("electron");
let mainWindow = null;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  // Create myWindow, load the rest of the app, etc...
  app.on("ready", () => {
    createWindow();
  });
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: "build/icon.png",
    webPreferences: {
      preload: `${__dirname}/preload.js`,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL("https://mail.google.com/mail/u/0/#inbox");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Open window maximized
  mainWindow.maximize();

  // Hide to tray on minimize
  /*   mainWindow.on("minimize", function (event) {
    event.preventDefault();
    mainWindow.hide();
  }); */

  mainWindow.on("close", function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }

    return false;
  });

  // Tray icon
  let appIcon = null;
  app.whenReady().then(() => {
    appIcon = new Tray(require("path").resolve(__dirname, "icon.png"));
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show App",
        click: function () {
          mainWindow.isFocused() ? mainWindow.focus() : mainWindow.show();
        },
      },
      {
        label: "Quit",
        click: function () {
          app.isQuiting = true;
          app.quit();
        },
      },
    ]);

    // Make a change to the context menu
    contextMenu.items[1].checked = false;

    // Call this again for Linux because we modified the context menu
    appIcon.setContextMenu(contextMenu);
  });
}

/* const NOTIFICATION_TITLE = "Basic Notification";
const NOTIFICATION_BODY = "Notification from the Main process";

function showNotification() {
  new Notification({
    title: NOTIFICATION_TITLE,
    body: NOTIFICATION_BODY,
  }).show();
} */
/* app.whenReady().then(createWindow).then(showNotification); */

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

var ipcMain = require("electron").ipcMain;
ipcMain.on("asynchronous-message", function (evt, message) {
  if (message == "createNewWindow") {
    // Message received.
    // Create new window here.
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
