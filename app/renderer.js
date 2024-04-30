const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
const {ipcRenderer} = require('electron');
const {bootstrap} = require('bootstrap')
window.$ = window.jQuery = require('jquery');
const { SerialPort } = require('serialport')
const fs = require('fs');
const path = require('path');
const { equal } = require('assert');
const settings = currentWindow.settings;


// SETTINGS

function setSettings()
{
    if(settings.getSync("theme") == "dark")
    {
        changeTheme({target:{id: "darkTheme"}})
        document.querySelector("#darkTheme").setAttribute("checked", "")
    }
    else
    {
        changeTheme({target:{id: "lightTheme"}})
        document.querySelector("#lightTheme").setAttribute("checked", "")
    }
    if(settings.getSync("language") == "english")
    {
        changeLanguage({target: {id: "english"}})
        document.querySelector("#english").setAttribute("checked", "")
    }
    else
    {
        changeLanguage({target: {id: "polski"}})
        document.querySelector("#polski").setAttribute("checked", "")
    }
}

setSettings()

// OTHER

function setLeftPanelHeight()
{
    let temp = document.querySelector(".deviceTitleParent").offsetHeight
    temp = document.querySelector("body").offsetHeight - temp
    document.querySelector(".leftPanel").style.height = temp + "px"
}

$(document).ready(function()
{ 
    $("#chooseDeviceWindow").fadeIn(1000)
    setLeftPanelHeight()
});

// CONNECT TO DEVICE

function connectToDevice()
{

}

document.querySelector("#connectButton").addEventListener("click", connectToDevice);

// CHANGE THEME

function changeTheme(event)
{
    if(event.target.id == "darkTheme")
    {
        document.querySelector("html").setAttribute("data-bs-theme", "dark")
        settings.setSync("theme", "dark")
    }
    else
    {
        document.querySelector("html").removeAttribute("data-bs-theme")
        settings.setSync("theme", "light")
    }
}

document.querySelector("#darkTheme").addEventListener("click", changeTheme)
document.querySelector("#lightTheme").addEventListener("click", changeTheme)

// DEV MODE

function switchDevMode(event)
{
    if(event.target.id == "devToolsOn")
    {
        currentWindow.webContents.openDevTools()
        $("#consoleSwitch").fadeIn(1000);
        currentWindow.resizable = true
    }
    else
    {
        currentWindow.webContents.closeDevTools()
        currentWindow.unmaximize()
        $("#consoleSwitch").fadeOut(1000);
        currentWindow.setSize(800, 700)
        currentWindow.resizable = false
    }
}

document.querySelector("#consoleSwitch").addEventListener("click", (event) => {currentWindow.webContents.toggleDevTools()})
document.querySelector("#devToolsOn").addEventListener("click", switchDevMode);
document.querySelector("#devToolsOff").addEventListener("click", switchDevMode);

//language

function changeLanguage(event)
{
    let content;
    let myPath;
    if(event.target.id == "polski")
    {
        myPath = path.join(__dirname, 'languages', 'polski.json');
        settings.setSync("language", "polski")
    }
    else
    {
        myPath = path.join(__dirname, 'languages', 'english.json');
        settings.setSync("language", "english")
    }
    let rawData = fs.readFileSync(myPath,  { encoding: 'utf8', flag: 'r' })
    let myData = JSON.parse(rawData)
    
    let components = document.querySelectorAll(".language")
    for(let i=0; i<components.length; i++)
    {
        components[i].innerHTML = myData[components[i].id]
        console.log(components[i].innerHTML)
    }
}

document.querySelector("#english").addEventListener("click", changeLanguage)
document.querySelector("#polski").addEventListener("click", changeLanguage)