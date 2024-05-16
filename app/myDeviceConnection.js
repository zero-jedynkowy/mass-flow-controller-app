const mySettings = require('./mySettings')

let ports = [];
let portsKeys = [];
let tempPortName;
let isStartup = true

function connectToDevice()
{
    console.log($(".marked"))
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
                tempObj.classList.add("p-3")
                tempObj.innerHTML = tempPortName
                tempObj.addEventListener("click", markDevice)
        //         tempObj.addEventListener('mousedown', deviceContextMenu)
                let temp = document.querySelectorAll(".deviceListElement")
                if(temp.length == 0)
                {
                    $(tempObj).hide().appendTo("#devicesListContent").fadeIn();
                }
                else
                {
                    $(tempObj).hide().insertBefore(temp[0]).fadeIn(500);
                }
                if(!isStartup)
                {
        //             // createToast("deviceAddedAlert", tempPortName)
                }
            }
        }
        
        for(let i=0; i<ports.length; i++)
        {
            if(!newPortsKeys.includes(portsKeys[i]))
            {
        //         // createToast("deviceRemovedAlert", portsKeys[i])
                ports.splice(i, 1);
                portsKeys.splice(i, 1);
                $(document.querySelectorAll(".deviceListElement")[i]).fadeOut(500, () => $(document.querySelectorAll(".deviceListElement")[i]).remove())
                // $(document.querySelectorAll(".deviceListElement")[i]).animate(
                // {  
                //     padding: '0',
                //     'font-size': '0',
                // }, 500, () =>{$(document.querySelectorAll(".deviceListElement")[i]).remove()})
            }
        }
        if(isStartup)
        {
            isStartup = false
        }
        if(document.querySelector("#devicesListContent").children.length != 0) ($("#noDevicesPlaceholder").parent()).fadeOut(500)
        else $("#noDevicesPlaceholder").parent().fadeIn(500)
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
    stopLoopRefreshDeviceList
}