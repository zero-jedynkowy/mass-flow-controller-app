const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
const bootstrap = require('bootstrap')
window.$ = window.jQuery = require('jquery');
const {SerialPort} = require('serialport')
const fs = require('fs');
const path = require('path');
const shell = require('electron').shell;


const myLibrary = require('./myLibrary')



currentWindow.on("resize", myLibrary.resizeWindowUpdater)
currentWindow.on("maximize", myLibrary.resizeWindowUpdater)

$(document).ready(function()
{ 
    myLibrary.addContent('window.html', '#bodyContent')
    myLibrary.addContent('mainContent.html', '#mainContent')
    myLibrary.addContent("menu.html", "#menuAndContentContainer")
    myLibrary.addContent('buttons.html', "#bodyContent")
    myLibrary.addContent('modals.html', "#bodyContent")
    

    $("#showMenuButton").click(myLibrary.showMenuButtonAction)
    $("#connectButton").click(myLibrary.connectActionButton)
    $("#disconnectButton").click(myLibrary.disconnectActionButton)
    // $('#changeThemeButton').click(mySettings.changeTheme)
    // $('[data-bs-toggle="tooltip"]').tooltip({trigger : 'hover'}) 
    // $("#devModeButton").click(mySettings.switchDevMode)
    // $("#toggleConsoleButton").click(mySettings.showConsole)
    // $("#changeLanguageButton").click(mySettings.changeLanguageButtonAction)
    // myOthers.resizeWindowUpdater()
    // myDeviceConnection.startLoopRefreshDeviceList()
    // $("#moreSettingsButton").click(() => {$('#extraSettingsModal').modal('toggle')})
    // $("#aboutProgramButton").click(() => {$("#aboutProgramModal").modal("toggle")})
    // $("#channelsChartSwitcher").click(mySettings.switchChannelsChartButtonAction)
    // // mySettings.applySettings()
    // $("#connectButton").click(myDeviceConnection.connectToDevice)
    // $(document).on('click', 'a[href^="http"]', function(event) {
    //     event.preventDefault();
    //     shell.openExternal(this.href);
    // });
    $("#devicePanel").parent().hide()
    myLibrary.resizeWindowUpdater()
    $("body").fadeIn(1000, () => {myLibrary.startRefreshing()})
});

