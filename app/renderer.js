const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
const {bootstrap} = require('bootstrap')
window.$ = window.jQuery = require('jquery');
const {SerialPort} = require('serialport')
const fs = require('fs');
const path = require('path');

const mySettings = require('./mySettings')
const myOthers = require('./myOthers')
const myDeviceConnection = require('./myDeviceConnection')

$(document).ready(function()
{ 
    mySettings.setSettings()
    $("#languageSwitcher2").click(mySettings.changeLanguage)
    $("#languageSwitcher1").click(mySettings.changeLanguage)
    $("#consoleSwitcher").click(() => {currentWindow.webContents.toggleDevTools()})
    $("#devToolsOnSwitcher").click(mySettings.switchDevMode)
    $("#darkThemeSwitcher").click(mySettings.changeTheme)
    $("#lightThemeSwitcher").click(mySettings.changeTheme)
    $("#connectButton").click(myDeviceConnection.connectToDevice)
    $("#chooseDeviceFrame").fadeIn(250)
    myOthers.setLeftPanelHeight()
    myDeviceConnection.setMakeDocumentAbleToRemoveContextMenu()
    myDeviceConnection.startLoopRefreshDeviceList()
});