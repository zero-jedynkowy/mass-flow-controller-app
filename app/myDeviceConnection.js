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
        this.final = {}
    }

    calc()
    {
        let a = this
        async function temp()
        {
            
            a.count++;
            try
            {
                a.final[a.count](a)
            }
            catch(error)
            {

            }
            if(a.count >= a.max_count)
            {
                a.stop()
                a.count = 0;
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
}

connectDeviceObject = 
{
    ports: [],
    portsKeys: [],
    tempPortName: null,
    isStartup: true,
    temp: null
}

servceDeviceObject =
{
    currentChoosenPort: null,
    tempDataStr: null,
    tempDataObj: null,
    isConnected: false
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
        if(servceDeviceObject.isConnected)
        {
            $("#connectingButtonClickAlreadyConnectedModal").modal("toggle")
            return
        }
        servceDeviceObject.tempDataStr = ""
        try
        {
            servceDeviceObject.currentChoosenPort = new SerialPort({path: $(".marked").text(), baudRate: 9600})
        }
        catch(error)
        {
            $("#errorConnectingModal").modal("toggle")
            return
        }
        connectDeviceObject.temp = new Timer(10, 1000)
        connectDeviceObject.temp.final[10] = (temp) => {$("#connectingModal").modal("toggle"); $("#errorConnectingModal").modal("toggle");}
        connectDeviceObject.temp.final[10] = (temp) => {$("#connectingModal").modal("toggle"); $("#errorConnectingModal").modal("toggle");}
        connectDeviceObject.temp.start()
        $("#connectingModal .modal-body p").hide()
        $("#connectingModal").modal("toggle")
        $($("#connectingModal .modal-body").children()[0]).fadeIn(1000)
        servceDeviceObject.currentChoosenPort.on("data", (data) => 
        {
            $($("#connectingModal .modal-body").children()[1]).fadeIn(1000)
            servceDeviceObject.tempDataStr += String.fromCharCode(...data)
            try
            {
                servceDeviceObject.tempDataObj = JSON.parse(servceDeviceObject.tempDataStr)
                console.log(servceDeviceObject.tempDataStr)
                if("Mass Flow Controller Device Prototype" == servceDeviceObject.tempDataObj.deviceName)
                {
                    connectDeviceObject.temp.stop()
                    connectDeviceObject.temp = new Timer(4, 1000)
                    connectDeviceObject.temp.final[2] = (temp) => {$($("#connectingModal .modal-body").children()[2]).fadeIn(1000)}
                    connectDeviceObject.temp.final[4] = () => {$("#connectingModal .btn-close").click()}
                    connectDeviceObject.temp.start()
                    stopLoopRefreshDeviceList()
                    $("#devicesListStatePlaceholderTitle").parent().fadeIn(1000)
                    servceDeviceObject.isConnected = true
                    servceDeviceObject.tempDataStr = ""
                    servceDeviceObject.currentChoosenPort.removeAllListeners("data")
                    servceDeviceObject.currentChoosenPort.on("data", exchangeData)
                    servceDeviceObject.currentChoosenPort.on('error', function(err) {
                        console.log('Error: ', err.message)
                      })
                      servceDeviceObject.currentChoosenPort.on('close', function() {
                        servceDeviceObject.currentChoosenPort.open()
                      })
                    servceDeviceObject.currentChoosenPort.write('{"request":"GET_DATA"}')
                }
            }
            catch(error)
            {
                console.log(error)
            }
        })
        servceDeviceObject.currentChoosenPort.write('{"request":"GET_DATA"}')
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

let x = new Timer(2, 1000)



function exchangeData(data)
{
    servceDeviceObject.tempDataStr += String.fromCharCode(...data)
    try
    {
        // servceDeviceObject.tempDataObj = JSON.parse(servceDeviceObject.tempDataStr)
        // console.log(servceDeviceObject.tempDataObj)
        console.log(getCurrentTime());
        servceDeviceObject.tempDataStr = ""
        x = new Timer(5, 1000)
        x.final[2] = (temp) => {servceDeviceObject.currentChoosenPort.write('{"request":"GET_DATA"}', function(err) {
            if (err) {
              return console.log('Error on write: ', err.message)
            }
            console.log('message written')
          })}
        x.start()
        
    }
    catch({ name, message })
    {
        if(name == "SyntaxError")
        {
            console.log(name)
        }
        console.log(name)
    }
}

module.exports = 
{
    connectToDevice, 
    startLoopRefreshDeviceList, 
    stopLoopRefreshDeviceList,
    servceDeviceObject
}