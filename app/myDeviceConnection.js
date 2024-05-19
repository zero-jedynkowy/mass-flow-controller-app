const { SerialPort } = require('serialport');
const mySettings = require('./mySettings')
const fs = require('fs');
const { count } = require('console');

class Timer
{
    constructor(max_count, step_time)
    {
        this.max_count = max_count
        this.step_time = step_time
        this.count = 0
        this.state = false
        this.interval = null
        this.fun = {}
    }

    calc()
    {
        let a = this
        async function temp()
        {
            
            a.count++;
            try
            {
                a.fun[a.count](a)
            }
            catch(error)
            {

            }
            if(a.count >= a.max_count)
            {
                a.stop()
            }
        }
        return temp
    }

    start()
    {
        this.state = true
        this.interval = setInterval(this.calc(), this.step_time)
    }

    stop()
    {
        this.state = false
        clearInterval(this.interval)
    }

    reset()
    {
        this.count = 0
    }
}

connectDeviceObject = 
{
    ports: [],
    portsKeys: [],
    tempPortName: null,
    isStartup: true,
    tempTimer: null
}

serviceDeviceObject =
{
    currentChoosenPort: null,
    tempDataStr: null,
    tempDataObj: null,
}

function markDevice(event)
{
    let x = document.querySelector(".marked")
    if(event.target.classList.contains("marked"))
    {
        x.classList.remove("marked")
        x.classList.remove("bg-success-subtle")
    }
    else
    {
        if(x != null)
        {
            x.classList.remove("marked")
            x.classList.remove("bg-success-subtle")
        }
        event.target.classList.add("marked")
        event.target.classList.add("bg-success-subtle")
    }
}

function refreshDeviceList()
{
    SerialPort.list().then((newPorts) =>
    {
        newPortsKeys = []
        for(let i=0; i<newPorts.length; i++)
        {
            connectDeviceObject.tempPortName = newPorts[i].path
            newPortsKeys.push(connectDeviceObject.tempPortName)
            if(!connectDeviceObject.portsKeys.includes(connectDeviceObject.tempPortName))
            {
                connectDeviceObject.portsKeys.unshift(connectDeviceObject.tempPortName)
                connectDeviceObject.ports.unshift(newPorts[i])
                tempObj = document.createElement("li")
                tempObj.classList.add("list-group-item")
                tempObj.classList.add("deviceListElement")
                tempObj.classList.add("p-3")
                tempObj.innerHTML = connectDeviceObject.tempPortName
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
                if(!connectDeviceObject.isStartup)
                {
        //             // createToast("deviceAddedAlert", tempPortName)
                }
            }
        }
        
        for(let i=0; i<connectDeviceObject.ports.length; i++)
        {
            if(!newPortsKeys.includes(connectDeviceObject.portsKeys[i]))
            {
        //         // createToast("deviceRemovedAlert", portsKeys[i])
                connectDeviceObject.ports.splice(i, 1);
                connectDeviceObject.portsKeys.splice(i, 1);
                $(document.querySelectorAll(".deviceListElement")[i]).fadeOut(500, () => $(document.querySelectorAll(".deviceListElement")[i]).remove())
            }
        }
        if(connectDeviceObject.isStartup)
        {
            connectDeviceObject.isStartup = false
        }
        if(document.querySelector("#devicesListContent").children.length != 0) ($("#devicesListStatePlaceholderTitle").parent()).fadeOut(500)
        else $("#devicesListStatePlaceholderTitle").parent().fadeIn(500)
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

function connectToDevice()
{
    if($(".marked").length == 0) $('#connectNotChoosenDeviceModal').modal('toggle')
    else
    {
        if(serviceDeviceObject.isConnected)
        {
            $("#connectingButtonClickAlreadyConnectedModal").modal("toggle")
            return
        }
        serviceDeviceObject.tempDataStr = ""
        try
        {
            serviceDeviceObject.currentChoosenPort = new SerialPort({path: $(".marked").text(), baudRate: 9600})
        }
        catch(error)
        {
            $("#errorConnectingModal").modal("toggle")
            return
        }
        setPort()
        serviceDeviceObject.currentChoosenPort.write('{"request":"GET_DATA"}')
    }
}

function getCurrentTime() 
{
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}:${milliseconds}`;
}

function setPort()
{
    serviceDeviceObject.currentChoosenPort.on('close', () => 
    {
        serviceDeviceObject.tempDataStr = ""
        console.log("CLOSE CLOSE CLOSE")
        serviceDeviceObject.timer = []
        serviceDeviceObject.timer[0] = 0
        serviceDeviceObject.timer[1] = setInterval(() => {
            console.log("WHILE WHILE WHILE")
            try 
            {
                if(!serviceDeviceObject.currentChoosenPort.isOpen)
                {
                    serviceDeviceObject.currentChoosenPort.open(function(error)
                    {
                        if(error != null)
                        {
                            clearInterval(serviceDeviceObject.timer[1])
                            errorConnecting()
                        }
                        else
                        {
                            clearInterval(serviceDeviceObject.timer[1])
                            serviceDeviceObject.currentChoosenPort.write('{"request":"GET_DATA"}')
                        }
                        
                        
                    })
                }
                else
                {
                    clearInterval(serviceDeviceObject.timer[1])
                    serviceDeviceObject.currentChoosenPort.write('{"request":"GET_DATA"}')
                } 
            }
            catch(error)
            {}
            if(serviceDeviceObject.timer[0] == 10)
            {
                clearInterval(serviceDeviceObject.timer[1])
                if(serviceDeviceObject.currentChoosenPort.isOpen) serviceDeviceObject.currentChoosenPort.write('{"request":"GET_DATA"}')
                else errorConnecting()
            }
            serviceDeviceObject.timer[0]++
        }, 1000)
    })

    serviceDeviceObject.currentChoosenPort.on('data', (data) => 
    {
        try
        {
            serviceDeviceObject.tempDataStr += String.fromCharCode(...data)
            console.log(serviceDeviceObject.tempDataStr)
            serviceDeviceObject.tempDataObj = JSON.parse(serviceDeviceObject.tempDataStr)
            console.log(getCurrentTime())
            serviceDeviceObject.tempDataStr = ""
            serviceDeviceObject.timer = new Timer(2, 1000)
            serviceDeviceObject.timer.fun[2] = (temp) => {serviceDeviceObject.currentChoosenPort.write('{"request":"GET_DATA"}')}
            serviceDeviceObject.timer.start()
        }
        catch({name, message})
        {
            if(name == 'SyntaxError')
            {   
                console.log(name)
                serviceDeviceObject.tempDataStr = ""
                serviceDeviceObject.currentChoosenPort.write('{"request":"GET_DATA"}')
            }
        }
    })
}

function errorConnecting()
{
    $("#errorConnectingModal").modal("toggle")
}

module.exports = 
{
    connectToDevice, 
    startLoopRefreshDeviceList, 
    stopLoopRefreshDeviceList,
    serviceDeviceObject
}