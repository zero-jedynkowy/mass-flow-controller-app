const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
const bootstrap = require('bootstrap')
window.$ = window.jQuery = require('jquery');
const {SerialPort} = require('serialport')
const fs = require('fs');
const path = require('path');
const shell = require('electron').shell;




const myMenu = require('./myMenu')
const mySettings = require('./mySettings')
const myDeviceConnection = require('./myDeviceConnection')




mySettings.initSettings()
currentWindow.on("resize", myMenu.resizeWindowUpdater)




$(document).ready(function()
{ 
    $("#showMenuButton").click(myMenu.showMenuButtonAction)
    
    
    $("body").show()
    $('#changeThemeButton').click(mySettings.changeTheme)
    $('[data-bs-toggle="tooltip"]').tooltip({trigger : 'hover'}) 
    $("#devModeButton").click(mySettings.switchDevMode)
    $("#consoleButton").click(mySettings.showConsole)
    $("#changeLanguage").click(mySettings.changeLanguageButtonAction)
    myMenu.resizeWindowUpdater()
    myDeviceConnection.startLoopRefreshDeviceList()
    $("#moreSettingsButton").click(() => {$('#extraSettingsModal').modal('toggle')})
    $("#aboutProgramButton").click(() => {$("#aboutProgramModal").modal("toggle")})
    $("#channelsChartSwitcher").click(mySettings.switchChannelsChartButtonAction)
    mySettings.applySettings()

    $(document).on('click', 'a[href^="http"]', function(event) {
        event.preventDefault();
        shell.openExternal(this.href);
    });

    // $("body").fadeIn(1000)
});

