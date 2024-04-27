const {app, BrowserWindow, ipcMain} = require('electron/main')
const path = require('node:path')
const settings = require("electron-settings")

settings.configure(
{
  atomicSave: true,
  numSpaces: 2,
  prettify: true
})



if(settings.getSync("language") == null || settings.getSync("theme") == null)
{
  settings.setSync("language", "english")
  settings.setSync("theme", "light")
}

function createWindow () 
{
  const win = new BrowserWindow(
  {
    width: 800,
    height: 700,
    autoHideMenuBar: true,
    resizable: false,
    
    webPreferences: 
    {
      // preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true, 
      contextIsolation: false
    }
  })
  win.loadFile('index.html')
  win.settings = settings
  
  require("@electron/remote/main").initialize();
  const mainRemote = require("@electron/remote/main");
  mainRemote.enable(win.webContents);
}

app.whenReady().then(() => 
{
  createWindow()
  app.on('activate', () => 
  {
    if (BrowserWindow.getAllWindows().length === 0) 
    {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => 
{
  if (process.platform !== 'darwin') 
  {
    app.quit()
  }
})