const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
const {bootstrap} = require('bootstrap')
window.$ = window.jQuery = require('jquery');
const {SerialPort} = require('serialport')
const fs = require('fs');
const path = require('path');

const myOthers = require('./myOthers')
const mySettings = require('./mySettings')

mySettings.initSettings()
currentWindow.on("resize", myOthers.resizeWindowUpdater)

$(document).ready(function()
{ 
    $("#showMenuButton").click(myOthers.showMenuButtonAction)
    mySettings.applySettings()
    $("body").fadeIn(1000)
    
    $('#changeThemeButton').click(mySettings.changeTheme)
    $('[data-bs-toggle="tooltip"]').tooltip({trigger : 'hover'}) 
    $("#devModeButton").click(mySettings.switchDevMode)
    $("#consoleButton").click(mySettings.showConsole)
    myOthers.resizeWindowUpdater()
});

