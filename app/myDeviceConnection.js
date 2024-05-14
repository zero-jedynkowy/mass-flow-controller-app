const mySettings = require('./mySettings')

function connectToDevice()
{
    
}

function markDevice(event)
{
    
}

function refreshDeviceList()
{
    
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