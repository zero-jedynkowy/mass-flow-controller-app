const mySettings = require('./mySettings')

let myInterval;
let ports = []
let portsKeys = []
let newPortsKeys = []   
let tempPortName;
let tempObj;
let isStartup = true
let rightClickLastElement = null

function connectToDevice()
{
    
}

function setMakeDocumentAbleToRemoveContextMenu()
{
    $(document).click(() => 
    {
        try
        {
            $(".contextMenu").remove()
        }
        catch(error)
        {}
    })
}

function showDetails()
{
    $("#mainModalTitle").text(mySettings.getLanguageContent("modalDeviceMoreInformationTitle"))
    $("#mainModalFooter").hide()
    let x = ports[portsKeys.indexOf(rightClickLastElement)]
    $("#mainModalContent").empty()
    for(let a in Object.getOwnPropertyNames(x))
    {
        let y = document.createElement("p")
        y.innerHTML = Object.getOwnPropertyNames(x)[a] + ": " + x[Object.getOwnPropertyNames(x)[a]]
        y.innerHTML = y.innerHTML.charAt(0).toUpperCase() + y.innerHTML.slice(1);
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
            x.innerHTML = mySettings.getLanguageContent("rightContextDetails")
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

function refreshDeviceList()
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
                $(document.querySelectorAll(".deviceListElement")[i]).animate(
                {  
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

function startLoopRefreshDeviceList()
{
    myInterval = setInterval(async () => {await refreshDeviceList()}, 1000)
}

function stopLoopRefreshDeviceList()
{
    clearInterval(myInterval)
}

function sendData()
{

}

function getData()
{
    
}

module.exports = 
{
    connectToDevice, 
    startLoopRefreshDeviceList, 
    stopLoopRefreshDeviceList, 
    setMakeDocumentAbleToRemoveContextMenu
}