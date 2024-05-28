const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
const bootstrap = require('bootstrap');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
window.$ = window.jQuery = require('jquery');
const chartjs = require('chart.js/auto')

//OTHER
function addContent(filePath, destination)
{
    let data = fs.readFileSync(filePath)
    document.querySelector(destination).innerHTML = document.querySelector(destination).innerHTML + data
}

//DEV MODE
devModeObj = 
{
    isDevModeOn: false,
    keyCounter: 0
}

function initDevMode()
{
    currentWindow.webContents.on('before-input-event', (event, input) => 
    {
        if(input.control && input.key.toLowerCase() === 'd') 
        {
            devModeObj.keyCounter += 1
            if(devModeObj.keyCounter == 2) devModeObj.keyCounter = 0
            else openDevMode()
            event.preventDefault()
        }
    })
}

function openDevMode()
{
    devModeObj.isDevModeOn = devModeObj.isDevModeOn? false:true
    if(devModeObj.isDevModeOn)
    {
        currentWindow.webContents.openDevTools()
        $("#toggleConsoleButton").fadeIn(1000)
    }   
    else 
    {   
        $("#toggleConsoleButton").fadeOut(1000)
        currentWindow.webContents.closeDevTools()
    }
}

function showConsole()
{
    devModeObj.isDevToolsOpened = devModeObj.isDevToolsOpened? false:true
    if(devModeObj.isDevToolsOpened) currentWindow.webContents.openDevTools()
    else currentWindow.webContents.closeDevTools()
}

//SETTINGS
settingsObj = 
{
    settings: currentWindow.settings,
}

function resetSettings()
{
    settingsObj.settings.setSync("language", "english")
    settingsObj.settings.setSync("theme", "light")
    settingsObj.settings.setSync("channelsChart", false)
    settingsObj.settings.setSync("welcomeWindow", true)
}

function initSettings()
{
    settingsObj.settings.configure
    ({
        atomicSave: true,
        numSpaces: 2,
        prettify: true
    })
    let temp = settingsObj.settings.getSync("language") == null
    temp ||= settingsObj.settings.getSync("theme") == null
    temp ||= settingsObj.settings.getSync("channelsChart") == null
    temp ||= settingsObj.settings.getSync("welcomeWindow") == null
    if(temp) resetSettings()
}

function updateSettingsAction(event)
{
    switch(event.currentTarget.getAttribute('settings'))
    {
        case "changeTheme":
        {
            let theme = $('html').attr('data-bs-theme') == 'dark'? 'light':'dark'
            settingsObj.settings.setSync("theme", theme)
            break;
        }
        case "":
        {

        }
    }
    applySettings(event)
}

function applySettings()
{
    document.querySelector("html").setAttribute('data-bs-theme',  settingsObj.settings.getSync('theme'))
    $('#changeThemeButton').find('i').toggleClass("bi-moon-stars")
    $('#changeThemeButton').find('i').toggleClass("bi-brightness-high")
}

//MENU
menuObj = 
{
    menuIsActive: true,
    isMenuAnimationActive: false
}

function showMenuButtonAction()
{
    if(menuObj.isMenuAnimationActive == false)
    {
        if(!menuObj.menuIsActive)
        {
            menuObj.isMenuAnimationActive = true
            $("#sideBar").animate({"left":"0px"}, 500, () => {menuObj.isMenuAnimationActive = 0})
        }
        else
        {
            menuObj.isMenuAnimationActive = true
            $("#sideBar").animate({"left": "-" + $("#sideBar").outerWidth().toString() + "px"}, 500, () => {menuObj.isMenuAnimationActive = 0});
        }
        menuObj.menuIsActive = menuObj.menuIsActive? false:true
    }
}


//WINDOW
function resizeWindowUpdater()
{
    let size = currentWindow.getSize();
    let channels = document.querySelectorAll(".channel")
    if(size[0] < 1452)
    {
        
        $(".channelsRows").addClass("flex-column")
        $(".channelsRows").removeClass("flex-row")
        for(let i=0; i<channels.length; i=i+2) channels[i].classList.remove("me-3")
    }
    else
    {
        $(".channelsRows").addClass("flex-row")
        $(".channelsRows").removeClass("flex-column")
        for(let i=0; i<channels.length; i=i+2) channels[i].classList.add("me-3")
    }
    if(size[0] < 1000)
    {
        $("#showMenuButton").fadeIn(250)
        $("#menuPlaceHolder").css("width", "0");
        $("#mainContent").css("width", "100%");
        $("#sideBar").css("width", "40%");
        if(menuObj.menuIsActive)
        {
            $("#sideBar").css("left", "0px")
            menuObj.menuIsActive = 1;
        }
        else $("#sideBar").css("left", "-" + $("#sideBar").outerWidth().toString() + "px");
    }
    else
    {
        $("#showMenuButton").fadeOut(250)
        $("#menuPlaceHolder").css("width", "27%");
        $("#mainContent").css("width", "73%");
        $("#sideBar").css("width", "27%");
        $("#sideBar").css("left", "0px");
    }   
    $("#mainContent").height(currentWindow.getSize()[1])
    try
    {
        chartObj.chart.resize();
    }
    catch(error){}
}

function initWindow()
{
    currentWindow.on("resize", myLibrary.resizeWindowUpdater)
    currentWindow.on("maximize", myLibrary.resizeWindowUpdater)
    window.addEventListener('afterprint', myLibrary.resizeWindowUpdater);
}

//CONNECTION
connectionObj = 
{
    portsKeys: [],
    ports: [],
    refreshing: true,
    port: null,
    parser: null,
    receivingData: null,
    receivedDataDate: null,
    connected: false,
    connectingCounter: 0,
    myConnectionInterval: null,
    localDeviceSettings: null
}

function waitForConnecting()
{
    connectionObj.connectingCounter++;
    if(connectionObj.connectingCounter >= 10)
    {
        if($("#connectingModal").is(":visible")) $("#connectingModal").modal('hide')
        else
        {
            connectionObj.connectingCounter = 0;
            connectionObj.port = null
            startRefreshing()
            connectionObj.connected = false
            switchDevicePanel(false)
            $("#errorConnectingModal").modal('show')
            clearInterval(connectionObj.myConnectionInterval)
        }

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

function toggleDevicesList(switcher)
{
    $("#devicesListContent").removeClass('d-none')
    if(switcher) $("#devicesListStatePlaceholderTitle").parent().fadeOut(500, () => {$("#devicesListContent").fadeIn(1000)})
    else $("#devicesListContent").fadeOut(500, () => {$("#devicesListStatePlaceholderTitle").parent().fadeIn(1000)})
}

function refreshDeviceList()
{
    if($("#connectingModal").is(":visible")) $("#connectingModal").modal('hide')
    if($("#devicePanel").is(":visible")) $("#devicePanel").parent().fadeOut()
    SerialPort.list().then((newPorts) =>
    {
        let newPortsKeys = []
        let tempPortName = null
        for(let i=0; i<newPorts.length; i++)
        {
            let tempPortName = newPorts[i].path
            newPortsKeys.push(tempPortName)
            if(!connectionObj.portsKeys.includes(tempPortName))
            {
                connectionObj.portsKeys.unshift(tempPortName)
                connectionObj.ports.unshift(newPorts[i])
                let tempObj = document.createElement("li")
                tempObj.classList.add("list-group-item")
                tempObj.classList.add("deviceListElement")
                tempObj.classList.add("p-3")
                tempObj.innerHTML = tempPortName
                tempObj.addEventListener("click", markDevice)
                let temp = document.querySelectorAll(".deviceListElement")
                if(temp.length == 0)
                {
                    $(tempObj).hide().appendTo("#devicesListContent").fadeIn();
                }
                else
                {
                    $(tempObj).hide().insertBefore(temp[0]).fadeIn(500);
                }
            }
        }
        
        for(let i=0; i<connectionObj.ports.length; i++)
        {
            if(!newPortsKeys.includes(connectionObj.portsKeys[i]))
            {
                connectionObj.ports.splice(i, 1);
                connectionObj.portsKeys.splice(i, 1);
                $(document.querySelectorAll(".deviceListElement")[i]).fadeOut(500, () => $(document.querySelectorAll(".deviceListElement")[i]).remove())
            }
        }
        if(connectionObj.ports.length == 0 && $("#devicesListContent").is(":visible")) toggleDevicesList(true)
        else if(connectionObj.ports.length != 0 && $("#devicesListContent").is(":hidden")) toggleDevicesList(true)
        if(connectionObj.refreshing) refreshDeviceList()
    })
}

function startRefreshing()
{
    connectionObj.refreshing = true
    refreshDeviceList()
}

function stopRefreshing()
{
    connectionObj.refreshing = false
}
    
function openSerialPort(path)
{
    return new Promise((resolve, reject) => 
    {
        port = new SerialPort({path: path, baudRate: 9600 }, (err) => 
        {
            if (err) 
            {
                return reject(err);
            }
            resolve(port);
        });
    });
}

async function connectActionButton()
{
    
    if(connectionObj.connected)
    {
        $("#alreadyConnectedModal").modal("show"); return;
    }
    if(document.querySelector(".marked") == null) $("#notChoosenAnyDeviceModal").modal('show')
    else
    {
        try
        {
            connectionObj.port = await openSerialPort(document.querySelector(".marked").innerHTML)
            stopRefreshing()
            toggleDevicesList(false)
            $("#connectingModal").modal('show')
            connectionObj.parser = port.pipe(new ReadlineParser({ delimiter: '}}', includeDelimiter: true}));
            setListeners()
            connectionObj.port.write('{"request":"GET_DATA"}')
            connectionObj.myConnectionInterval = setInterval(waitForConnecting, 1000)
        }
        catch(err)
        {
            console.log(err)
            connectionObj.connected = false
            connectionObj.port = null
            $("#errorConnectingModal").modal('show')
        }
    }
}

function disconnectActionButton()
{
    if(!connectionObj.connected) $("#notConnectedAnyDeviceModal").modal('show')
    if(connectionObj.port.isOpen) connectionObj.port.close()
    connectionObj.port.removeAllListeners()
    startRefreshing()
    connectionObj.connected = false
    switchDevicePanel(false)
    $("#disconnectingModal").modal("show")
}

function switchDevicePanel(switcher)
{
    if(switcher)
    {
        $("#notConnectedToAnyDevicePlaceholder").parent().parent().fadeOut(500, () => {
            $("#devicePanel").parent().fadeIn(500)
        })
        
    }
    else
    {
        $("#devicePanel").parent().fadeOut(500, () => {
            $("#notConnectedToAnyDevicePlaceholder").parent().parent().fadeIn(500)
        })
    }        
}

function processReceivedData()
{
    
    $("#deviceIdField").text(connectionObj.receivingData.deviceName)
    $("#deviceVersionField").text(connectionObj.receivingData.deviceVersion)
    $("#lastUpdateField").text(connectionObj.receivedDataDate)
}

function setListeners()
{
    
    connectionObj.port.on('close', (err) => 
    {
        try
        {
            if(err.disconnected)
            {
                connectionObj.port = null
                $("#connectingModal").modal('hide')
                startRefreshing()
                connectionObj.connected = false
                switchDevicePanel(false)
                $("#errorConnectingModal").modal('show')
            }
        }
        catch(error)
        {

        }
    });
    
    connectionObj.parser.on('data', (data) => 
    {
        connectionObj.receivingData = JSON.parse(data)
        connectionObj.receivedDataDate = getCurrentTime()
        console.log(connectionObj.receivedDataDate)
        console.log(connectionObj.receivingData);
        if(connectionObj.receivingData.deviceName == 'Mass Flow Controller Device Prototype')
        {
            clearInterval(connectionObj.myConnectionInterval)
            processReceivedData()
            if($("#connectingModal").is(":visible")) $("#connectingModal").modal('hide')
                $("#connectingModal").on('hide.bs.modal', function(){
                    switchDevicePanel(true)
                    connectionObj.connected = true
                    });
            
        }
        
        setTimeout(() => {port.write('{"request":"GET_DATA"}', function(err) {console.log(err)})}, 1000)
    });
}

//CHART
chartObj = 
{
    deviceChart: null,
    chart: null,
    config: null,
    labels: null,
    data: null
}

function updateChart()
{
    chartObj.deviceChart = document.getElementById('deviceChart')
    const labels = [-5, -4, -3,-2,-1, "Teraz"]
    const data = {
        labels: labels,
        datasets: [{
          label: 'Channel 1',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }, {
            label: 'Channel 2',
            data: [810, 560, 550, 400, 650, 59, 80],
            fill: false,
            borderColor: '#eb3434',
            tension: 0.1
          }]
      };

    const config = {
        type: 'line',
        data: data,
      };



    chartObj.chart = new chartjs.Chart(chartObj.deviceChart, config);
}

module.exports = 
{
    
    addContent,
    showMenuButtonAction,
    resizeWindowUpdater,
    refreshDeviceList,
    toggleDevicesList,
    connectActionButton,
    stopRefreshing,
    disconnectActionButton,
    startRefreshing,
    switchDevicePanel,
    initSettings,
    initWindow,
    updateSettingsAction,
    applySettings,
    openDevMode,
    initDevMode,
    showConsole,
    updateChart
}
