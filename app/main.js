const {app, BrowserWindow} = require('electron/main')
const settings = require("electron-settings")


function createWindow () 
{
  const win = new BrowserWindow(
  {
    minHeight: 500,
    minWidth: 800,
    title: "Mass Flow Controller App",
    autoHideMenuBar: true,
    webPreferences: 
    {
      // preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true, 
      contextIsolation: false
    }
  })
  // win.webContents.openDevTools()
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