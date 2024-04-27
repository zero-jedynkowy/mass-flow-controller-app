const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
$ = currentWindow.jQuery = require('jquery');

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
    }
    else
    {
        document.querySelector("html").removeAttribute("data-bs-theme")
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