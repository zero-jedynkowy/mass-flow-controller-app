const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
const bootstrap = require('bootstrap')
window.$ = window.jQuery = require('jquery');
const {SerialPort} = require('serialport')
const fs = require('fs');
const path = require('path');
const shell = require('electron').shell;

const myOthers = require('./myOthers')
const mySettings = require('./mySettings')
const myDeviceConnection = require('./myDeviceConnection')

function addContent(filePath, destination)
{
    let data = fs.readFileSync(filePath)
    document.querySelector(destination).innerHTML = document.querySelector(destination).innerHTML + data
}



mySettings.initSettings()
currentWindow.on("resize", myOthers.resizeWindowUpdater)
currentWindow.on("maximize", myOthers.resizeWindowUpdater)



$(document).ready(function()
{ 
    addContent('window.html', '#bodyContent')
    addContent('mainContent.html', '#mainContent')
    addContent("menu.html", "#menuAndContentContainer")
    addContent('buttons.html', "#bodyContent")
    addContent('modals.html', "#bodyContent")
    

    $("#showMenuButton").click(myOthers.showMenuButtonAction)
    $('#changeThemeButton').click(mySettings.changeTheme)
    $('[data-bs-toggle="tooltip"]').tooltip({trigger : 'hover'}) 
    $("#devModeButton").click(mySettings.switchDevMode)
    $("#toggleConsoleButton").click(mySettings.showConsole)
    $("#changeLanguageButton").click(mySettings.changeLanguageButtonAction)
    myOthers.resizeWindowUpdater()
    myDeviceConnection.startLoopRefreshDeviceList()
    $("#moreSettingsButton").click(() => {$('#extraSettingsModal').modal('toggle')})
    $("#aboutProgramButton").click(() => {$("#aboutProgramModal").modal("toggle")})
    $("#channelsChartSwitcher").click(mySettings.switchChannelsChartButtonAction)
    // mySettings.applySettings()
    $("#connectButton").click(myDeviceConnection.connectToDevice)
    $(document).on('click', 'a[href^="http"]', function(event) {
        event.preventDefault();
        shell.openExternal(this.href);
    });

    
    $("body").fadeIn(1000)
});

