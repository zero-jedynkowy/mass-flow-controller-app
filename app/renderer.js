const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
const {ipcRenderer} = require('electron');
const {bootstrap, Toast} = require('bootstrap')
window.$ = window.jQuery = require('jquery');
const { SerialPort } = require('serialport')
const fs = require('fs');
const path = require('path');
const settings = currentWindow.settings;
let languageContent;

// SETTINGS
{
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

    function changeTheme(event)
    {
        if(event.target.id == "darkThemeSwitcher")
        {
            document.querySelector("html").setAttribute("data-bs-theme", "dark")
            settings.setSync("theme", "dark")
            document.querySelector("#devicesList").classList.remove("bg-dark")
            document.querySelector("#devicesList").classList.add("bg-light")
        }
        else
        {
            document.querySelector("html").removeAttribute("data-bs-theme")
            settings.setSync("theme", "light")
            document.querySelector("#devicesList").classList.remove("bg-light")
            document.querySelector("#devicesList").classList.add("bg-dark")
        }
    }

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
        languageContent = JSON.parse(rawData)
        
        let components = document.querySelectorAll(".language")
        for(let i=0; i<components.length; i++)
        {
            components[i].innerHTML = languageContent[components[i].id]
        }
    }
}

// OTHER
{
    function setLeftPanelHeight()
    {
        let temp = document.querySelector("#portsListTitleParent").offsetHeight
        temp = document.querySelector("body").offsetHeight - temp
        document.querySelector(".leftPanel").style.height = temp + "px"
    }
}

let ports = []
let portsKeys = []
let newPortsKeys = []   
let tempPortName;
let tempObj;
let isStartup = true
let rightClickLastElement = null

// DEVICES
{
    
    let parent = document.querySelector("#devicesListContent")
   
    document.addEventListener("click", () => {
        try
        {
            document.querySelector(".contextMenu").remove()
        }
        catch(error)
        {

        }
    })

    function showDetails()
    {
        $("#mainModalTitle").text(languageContent["modalDeviceMoreInformationTitle"])
        $("#mainModalFooter").hide()
        let x = ports[portsKeys.indexOf(rightClickLastElement)]
        $("#mainModalContent").empty()
        for(let a in Object.getOwnPropertyNames(x))
        {
            let y = document.createElement("p")
            y.innerHTML = Object.getOwnPropertyNames(x)[a] + ": " + x[Object.getOwnPropertyNames(x)[a]]
            y.innerHTML = y.innerHTML.charAt(0).toUpperCase() + y.innerHTML.slice(1);
            console.log(y.innerHTML)
            document.querySelector("#mainModalContent").appendChild(y)
        }
        $("#mainModal").modal("show")
    }
   
    function deviceContextMenu(event)
    {
        if(event.which == 3)
        {
            try
            {
                document.querySelector(".contextMenu").remove()
            }
            catch(error){}
            if(rightClickLastElement != event.target.innerHTML)
            {
                
                let x = document.createElement("div")
                x.innerHTML = languageContent["rightContextDetails"]
                x.classList.add("contextMenu" )
                x.classList.add("position-absolute", "w-auto", "h-auto", "p-3", "opacity-100", "bg-warning")
                x.setAttribute("style", "top: " + event.pageY + "px; left: " + event.pageX + "px;" + "display: none;")
                document.querySelector('.chooseDeviceMenu').appendChild(x)
                $(".contextMenu").hide().show(1000)
                $(".contextMenu").click(showDetails)
                rightClickLastElement = event.target.innerHTML
            }
            else
            {
                try
                {
                    rightClickLastElement = null
                    document.querySelector(".contextMenu").remove()
                    
                }
                catch(error){}
            }
            
        }
        if(event.which == 1)
        {
            try
            {
                document.querySelector(".contextMenu").remove()
            }
            catch(error){}
        }
         
    }

    function markDevice(event)
    {
        
            let x = document.querySelector(".marked")
            if(event.target.classList.contains("marked"))
            {
                x.classList.remove("marked")
                    x.classList.remove("bg-primary")
            }
            else
            {
                if(x != null)
                {
                    x.classList.remove("marked")
                    x.classList.remove("bg-primary")
                }
                event.target.classList.add("marked")
                event.target.classList.add("bg-primary")
            }
    }

    function createToast(toastClass, portName)
    {
        temp = document.createElement("div")
        if(toastClass == "deviceAddedAlert") temp.classList.add("bg-success")
        else temp.classList.add("bg-danger")
        temp.classList.add("toast", toastClass, "p-3", "text-start", "text-white")
        document.querySelector(".toast-container").appendChild(temp)
        temp.innerHTML = languageContent[toastClass] + portName
        $(temp).fadeIn(1000).delay(1000).fadeOut(1000, () => {$(temp).remove()})
    }

    function updateDevicesList()
    {
        SerialPort.list().then((newPorts) =>
        {
            newPortsKeys = []
            for(let i=0; i<newPorts.length; i++)
            {
                tempPortName = newPorts[i].path
                newPortsKeys.push(tempPortName)
                if(!portsKeys.includes(tempPortName))
                {
                    portsKeys.unshift(tempPortName)
                    ports.unshift(newPorts[i])
                    tempObj = document.createElement("li")
                    tempObj.classList.add("list-group-item")
                    tempObj.classList.add("deviceListElement")
                    tempObj.innerHTML = tempPortName
                    tempObj.addEventListener("click", markDevice)
                    tempObj.addEventListener('mousedown', deviceContextMenu)
                    let temp = document.querySelectorAll(".deviceListElement")
                    if(temp.length == 0)
                    {
                        $(tempObj).hide().appendTo("#devicesListContent").fadeIn(500);
                    }
                    else
                    {
                        $(tempObj).hide().insertBefore(temp[0]).fadeIn(500);
                    }
                    if(!isStartup)
                    {
                        createToast("deviceAddedAlert", tempPortName)
                    }
                }
            }
            
            for(let i=0; i<ports.length; i++)
            {
                if(!newPortsKeys.includes(portsKeys[i]))
                {
                    createToast("deviceRemovedAlert", portsKeys[i])
                    ports.splice(i, 1);
                    portsKeys.splice(i, 1);
                    $(document.querySelectorAll(".deviceListElement")[i]).animate({  
                        padding: '0',
                        'font-size': '0',
                      }, 500, () =>{$(document.querySelectorAll(".deviceListElement")[i]).remove()})
                }
            }
            if(isStartup)
            {
                isStartup = false
            }
        })
        
    }
}

// CONNECT
{
    function connectToDevice()
    {
        let x = document.querySelector(".marked")
        if(x != null)
        {
            port = ports[portsKeys.indexOf(x.innerHTML)]
            console.log(port)
        }
    }
}

// GENERAL THINGS
$(document).ready(function()
{ 
    setSettings()
    document.querySelector("#languageSwitcher2").addEventListener("click", changeLanguage)
    document.querySelector("#languageSwitcher1").addEventListener("click", changeLanguage)
    document.querySelector("#consoleSwitcher").addEventListener("click", (event) => {currentWindow.webContents.toggleDevTools()})
    document.querySelector("#devToolsOnSwitcher").addEventListener("click", switchDevMode);
    document.querySelector("#devToolsOffSwitcher").addEventListener("click", switchDevMode);
    document.querySelector("#connectButton").addEventListener("click", connectToDevice);
    document.querySelector("#darkThemeSwitcher").addEventListener("click", changeTheme)
    document.querySelector("#lightThemeSwitcher").addEventListener("click", changeTheme)
    $("#chooseDeviceFrame").fadeIn(500)
    setLeftPanelHeight()
    setInterval(async () => {
        await updateDevicesList()
    }, 1000)
});