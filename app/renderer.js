const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
const bootstrap = require('bootstrap')
window.$ = window.jQuery = require('jquery');
const {SerialPort} = require('serialport')
const fs = require('fs');
const path = require('path');
const shell = require('electron').shell;


const myLibrary = require('./myLibrary')


$(document).ready(function()
{ 
    myLibrary.addContent(['resources', 'window.html'], '#bodyContent')
    myLibrary.addContent(['resources', 'mainContent.html'], '#mainContent')
    myLibrary.addContent(['resources',"menu.html"], "#menuAndContentContainer")
    myLibrary.addContent(['resources','buttons.html'], "#bodyContent")
    myLibrary.addContent(['resources','modals.html'], "#bodyContent")
    // // myLibrary.addContent('channel.html', "#channelsLeftList")
    // // myLibrary.addContent('channel.html', "#channelsRightList")
    myLibrary.addContent(['resources','chart.html'], "#devicePanel")
    myLibrary.addContent(['resources','gasPicker.html'], "#bodyContent")

    myLibrary.initWindow()

    myLibrary.initSettings()
    myLibrary.applySettings()

    myLibrary.initDevMode()

    myLibrary.initGasesList()

    

    $("#showMenuButton").click(myLibrary.showMenuButtonAction)
    $("#connectButton").click(myLibrary.connectActionButton)
    $("#disconnectButton").click(myLibrary.disconnectActionButton)
    $('#changeThemeButton').click(myLibrary.updateSettingsAction)
    // $('[data-bs-toggle="tooltip"]').tooltip({trigger : 'hover'}) 
    $("#devModeButton").click(myLibrary.openDevMode)
    $("#toggleConsoleButton").click(myLibrary.showConsole)
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
    // $("body").fadeIn(1000, () => {/*myLibrary.startRefreshing()*/})
    $("body").fadeIn(1000, () => {myLibrary.startRefreshing()})

    // myLibrary.switchDevicePanel(true)
    
});

