const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
const bootstrap = require('bootstrap')
window.$ = window.jQuery = require('jquery');
const {SerialPort} = require('serialport')
const fs = require('fs');
const path = require('path');




const myMenu = require('./myMenu')
const mySettings = require('./mySettings')
const myDeviceConnection = require('./myDeviceConnection')




mySettings.initSettings()
currentWindow.on("resize", myMenu.resizeWindowUpdater)




$(document).ready(function()
{ 
    $("#showMenuButton").click(myMenu.showMenuButtonAction)
    mySettings.applySettings()
    
    
    $('#changeThemeButton').click(mySettings.changeTheme)
    $('[data-bs-toggle="tooltip"]').tooltip({trigger : 'hover'}) 
    $("#devModeButton").click(mySettings.switchDevMode)
    $("#consoleButton").click(mySettings.showConsole)
    $("#changeLanguage").click(mySettings.changeLanguageButtonAction)
    myMenu.resizeWindowUpdater()
    myDeviceConnection.startLoopRefreshDeviceList()
    $("body").fadeIn(1000)
});

