const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
const {bootstrap} = require('bootstrap')
window.$ = window.jQuery = require('jquery');
const {SerialPort} = require('serialport')
const fs = require('fs');
const path = require('path');






const myOthers = require('./myOthers')


currentWindow.on("resize", myOthers.resizeWindowUpdater)

$(document).ready(function()
{ 
    
    $("#showMenuButton").click(myOthers.showMenuButtonAction)
    
    $("body").fadeIn(1000)
    myOthers.resizeWindowUpdater()
    $('[data-bs-toggle="tooltip"]').tooltip(); 

});