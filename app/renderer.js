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
        changeTheme({target:{id: "darkThemeSwitcher"}})
        document.querySelector("#darkThemeSwitcher").setAttribute("checked", "")
    }
    else
    {
        changeTheme({target:{id: "lightThemeSwitcher"}})
        document.querySelector("#lightThemeSwitcher").setAttribute("checked", "")
    }
    if(settings.getSync("language") == "english")
    {
        changeLanguage({target: {id: "languageSwitcher2"}})
        document.querySelector("#languageSwitcher2").setAttribute("checked", "")
    }
    else
    {
        changeLanguage({target: {id: "languageSwitcher1"}})
        document.querySelector("#languageSwitcher1").setAttribute("checked", "")
    }
}

setSettings()

// OTHER

function setLeftPanelHeight()
{
    let temp = document.querySelector("#portsListTitleParent").offsetHeight
    temp = document.querySelector("body").offsetHeight - temp
    document.querySelector(".leftPanel").style.height = temp + "px"
}

$(document).ready(function()
{ 
    $("#chooseDeviceFrame").fadeIn(1000)
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
    if(event.target.id == "darkThemeSwitcher")
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

document.querySelector("#darkThemeSwitcher").addEventListener("click", changeTheme)
document.querySelector("#lightThemeSwitcher").addEventListener("click", changeTheme)

// DEV MODE

function switchDevMode(event)
{
    if(event.target.id == "devToolsOnSwitcher")
    {
        currentWindow.webContents.openDevTools()
        $("#consoleSwitcher").fadeIn(1000);
        currentWindow.resizable = true
    }
    else
    {
        currentWindow.webContents.closeDevTools()
        currentWindow.unmaximize()
        $("#consoleSwitcher").fadeOut(1000);
        currentWindow.setSize(800, 700)
        currentWindow.resizable = false
    }
}

document.querySelector("#consoleSwitcher").addEventListener("click", (event) => {currentWindow.webContents.toggleDevTools()})
document.querySelector("#devToolsOnSwitcher").addEventListener("click", switchDevMode);
document.querySelector("#devToolsOffSwitcher").addEventListener("click", switchDevMode);

//language

function changeLanguage(event)
{
    let content;
    let myPath;
    if(event.target.id == "languageSwitcher1")
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

document.querySelector("#languageSwitcher2").addEventListener("click", changeLanguage)
document.querySelector("#languageSwitcher1").addEventListener("click", changeLanguage)