const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
const bootstrap = require('bootstrap');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
window.$ = window.jQuery = require('jquery');
const chartjs = require('chart.js/auto')
const format = require('@stdlib/string-format');
const { parse } = require('path');

//OTHER
function addContent(filePath, destination)
{
    let data = fs.readFileSync(path.join(__dirname, ...filePath))
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
    languageContent: null
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
        case "changeLanguage":
        {
            let newLanguage = settingsObj.settings.getSync("language") == "polski"? 'english':'polski'
            settingsObj.settings.setSync("language", newLanguage)
        }
    }
    applySettings(event)
}

function applySettings()
{
    document.querySelector("html").setAttribute('data-bs-theme',  settingsObj.settings.getSync('theme'))
    $('#changeThemeButton').find('i').toggleClass("bi-moon-stars")
    $('#changeThemeButton').find('i').toggleClass("bi-brightness-high")

    let myPath;
    myPath = path.join(__dirname, 'resources', settingsObj.settings.getSync("language") + '.json');
    let rawData = fs.readFileSync(myPath,  { encoding: 'utf8', flag: 'r' })
    settingsObj.languageContent = JSON.parse(rawData)
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
    $("#fullscreenAppButton").click(() => 
    {
        if(!currentWindow.isMaximized()) currentWindow.maximize()
        else  currentWindow.unmaximize()
    })

    $("#closeAppButton").click(() => 
    {
        currentWindow.close()
    })

    $("#minimalizeButton").click(() => 
    {
        currentWindow.minimize()
    })
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
    localDeviceSettings: null,
    firstAttempt: true,
    processingStage: 0,
    channelsElements: [],
    requestMode: "GET",
    channelsNewSettings: [],
    gasesList: null
}

class Channel
{
    constructor(id)
    {
        this.id = id
        this.turnedOn = false
        this.referenceTemperature = 0
        this.gases = [[59, "N2", 0], [59, "N2", 0], [59, "N2", 0], [59, "N2", 0], [59, "N2", 0]]
        this.normalGCF = 1
        this.afterTempCalibrateGCF = 1
        this.amountGases = 1
        this.settedFlow = 0
        this.channelMaxN2Flow = 0
        this.channelMaxCurrentGasFlow = 0
        this.valveMode = 0
    }

    parse()
    {
        let temp = {}
        temp[format("channel_%d:", this.id)] = this
        return temp
    }
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
            let flag = false
            if(newPorts[i].manufacturer != null)
            {
                
                flag = newPorts[i].manufacturer.includes("PZE")
            }
            if(!connectionObj.portsKeys.includes(tempPortName) && flag) //manufacturer
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
            connectionObj.firstAttempt = true
            connectionObj.port.write('{"request":"GET_DATA"}')
            connectionObj.myConnectionInterval = setInterval(waitForConnecting, 1000)
        }
        catch(err)
        {
            // console.log(err)
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
    switch(connectionObj.processingStage)
    {
        case 0: //FIRST CONNECTION
        {
            $(".channel").remove()
            initChart(connectionObj.receivingData["channels"])
            myPath = path.join(__dirname, "resources", "channel" + '.html');
            let rawData = fs.readFileSync(myPath,  { encoding: 'utf8', flag: 'r' })
            document.querySelectorAll('.channel').forEach(e => e.remove());
            connectionObj.channelsElements = []
            
            for(let i=0; i<connectionObj.receivingData["channels"]; i++)
            {
                // if(i % 2 == 0) document.querySelector("#channelsLeftList").innerHTML += rawData.replaceAll("%d", i+1)
                // else document.querySelector("#channelsRightList").innerHTML += rawData.replaceAll("%d", i+1)
                document.querySelector("#channelsList").innerHTML += rawData.replaceAll("%d", i+1)
                connectionObj.channelsNewSettings.push(new Channel(i+1))
                connectionObj.channelsNewSettings[i].turnedOn = connectionObj.receivingData[format("channel_%s", i+1)]["turnedOn"]
                connectionObj.channelsNewSettings[i].referenceTemperature = connectionObj.receivingData[format("channel_%s", i+1)]["referenceTemperature"]
                connectionObj.channelsNewSettings[i].gases = connectionObj.receivingData[format("channel_%s", i+1)]["gases"]
                connectionObj.channelsNewSettings[i].normalGCF = connectionObj.receivingData[format("channel_%s", i+1)]["normalGCF"]
                connectionObj.channelsNewSettings[i].afterTempCalibrateGCF = connectionObj.receivingData[format("channel_%s", i+1)]["afterTempCalibrateGCF"]
                connectionObj.channelsNewSettings[i].amountGases = connectionObj.receivingData[format("channel_%s", i+1)]["amountGases"]
                connectionObj.channelsNewSettings[i].settedFlow = connectionObj.receivingData[format("channel_%s", i+1)]["settedFlow"]
                connectionObj.channelsNewSettings[i].channelMaxN2Flow = connectionObj.receivingData[format("channel_%s", i+1)]["channelMaxN2Flow"]
                connectionObj.channelsNewSettings[i].channelMaxCurrentGasFlow = connectionObj.receivingData[format("channel_%s", i+1)]["channelMaxCurrentGasFlow"]
                connectionObj.channelsNewSettings[i].valveMode = connectionObj.receivingData[format("channel_%s", i+1)]["valveMode"]
            }
            for(let i=0; i<connectionObj.receivingData["channels"]; i++)
            {
                $(".turnOnButton").on('click', updateSettings)
                $(".turnOffButton").on('click', updateSettings)
                $(".openValveButton").on('click', updateSettings)
                $(".closeValveButton").on('click', updateSettings)
                $(".controlValveButton").on('click', updateSettings)
                $('.maxN2FlowSelector').on('change', updateSettings)
                $(".setTempButton").on('click', updateSettings)
                $('.setAutoControlFlowButton').on('click', updateSettings)
                $('.editGasesButton').on('click', (e) =>
                {
                    let parentElement = document.getElementById('gasPickerChoosenList');
                    let gasElements = parentElement.getElementsByClassName('gasElement');
                    let gasElementsArray = Array.prototype.slice.call(gasElements);

                    gasElementsArray.forEach(function(element) {
                        parentElement.removeChild(element);
                    });

                    let myPath = path.join(__dirname, "resources", "gasElement" + '.html');
                    let rawData = fs.readFileSync(myPath,  { encoding: 'utf8', flag: 'r' })
                    let channel = e.target.getAttribute('channel')
                    let temp2 = connectionObj.receivingData[format("channel_%s", channel)]["amountGases"]
                    for(let j=0; j<temp2; j++)
                    {
                        let el = connectionObj.receivingData[format("channel_%s", channel)]["gases"][j]
                        let a = connectionObj.gasesList[el[0]]
                        document.querySelector("#gasPickerChoosenList").innerHTML += format(rawData,  a.gas, a.symbol, el[0], el[2])
                    }
                    $("#gasPickerChoosenList .gasElement").on('click', (event) => 
                        {
                            if(event.currentTarget.classList.contains('gasSubmarked'))
                            {
                                document.querySelectorAll('#gasPickerChoosenList .gasElement').forEach(element => 
                                {
                                    element.classList.remove('gasSubmarked')
                                    element.classList.remove('bg-primary-subtle')
                                });
                            }
                            else
                            {
                                document.querySelectorAll('#gasPickerChoosenList .gasElement').forEach(element => 
                                {
                                    element.classList.remove('bg-primary-subtle')
                                    element.classList.remove('gasSubmarked')
                                });
                                event.currentTarget.classList.toggle('gasSubmarked')
                                event.currentTarget.classList.toggle('bg-primary-subtle')
                            }
                        })
                    $("#gasesPickerModal").modal("show")
                })
            }
            connectionObj.processingStage = 1
            // setTimeout(() => {port.write('{"request":"GET_DATA"}', function(err) {console.log(err)})}, 50)
            break;
        }
        case 1: //UDATE ALL GUI ELEMENTS
        {   
            $("#lastUpdateField").text(format(settingsObj.languageContent["devicePanel"]["lastUpdateField"][0], connectionObj.receivedDataDate))
            $("#deviceIdField").text(format(settingsObj.languageContent["devicePanel"]["deviceIdField"][0], connectionObj.receivingData["deviceName"]))
            $("#deviceVersionField").text(format(settingsObj.languageContent["devicePanel"]["deviceVersionField"][0], connectionObj.receivingData["deviceVersion"]))
            myPath = path.join(__dirname, "resources", "gasElement" + '.html');
            let rawData = fs.readFileSync(myPath,  { encoding: 'utf8', flag: 'r' })
            for(let i=1; i<=connectionObj.receivingData["channels"]; i++)
            {
                document.querySelector(format("#channel%dTitle", i)).innerHTML = format(settingsObj.languageContent["channel"]["channel%dTitle"][0], i)
                if(connectionObj.receivingData[format("channel_%s", i)]["turnedOn"])
                {
                    document.querySelector(format("#channel%dTurnOnButton", i)).setAttribute("checked", "")
                    document.querySelector(format("#channel%dTurnOffButton", i)).removeAttribute("checked")
                }
                else
                {
                    document.querySelector(format("#channel%dTurnOffButton", i)).setAttribute("checked", "")
                    document.querySelector(format("#channel%dTurnOnButton", i)).removeAttribute("checked")
                }
                $(format("#channel%dMaxN2Flow option[selected]", i)).removeAttr("selected")
                $(format("#channel%dMaxN2Flow option[value='%d']", i, connectionObj.receivingData[format("channel_%s", i)]["channelMaxN2Flow"])).attr("selected", "")
                let temp2 = connectionObj.receivingData[format("channel_%s", i)]["amountGases"]
                for(let j=0; j<temp2; j++)
                {
                    let el = connectionObj.receivingData[format("channel_%s", i)]["gases"][j]
                    let a = connectionObj.gasesList[el[0]]
                    document.querySelector(format("#channel%dGasesList", i)).innerHTML += format(rawData,  a.gas, a.symbol, el[0], el[2])
                }
                updateChart()
            }
            
            connectionObj.processingStage = 3
            break;
        }
        case 3: //UPDATE ONLY READABLE ELEMENTS
        {
            $("#lastUpdateField").text(format(settingsObj.languageContent["devicePanel"]["lastUpdateField"][0], connectionObj.receivedDataDate))
            for(let i=1; i<=connectionObj.receivingData["channels"]; i++)
            {
                document.querySelector(format("#channel%dCurrentFlow", i)).innerHTML = format(settingsObj.languageContent["channel"]["channel%dCurrentFlow"][0], connectionObj.receivingData[format("channel_%s", i)]["currentFlow"])
                document.querySelector(format("#channel%dValveStatus", i)).innerHTML = settingsObj.languageContent["channel"]["channel%dValveStatus"][connectionObj.receivingData[format("channel_%s", i)]["valveMode"]]
                document.querySelector(format("#channel%dTemperature", i)).setAttribute("placeholder", connectionObj.receivingData[format("channel_%s", i)]["referenceTemperature"])
                document.querySelector(format("#channel%dCurrentState", i)).innerHTML = format(settingsObj.languageContent["channel"]["channel%dCurrentState"][(connectionObj.receivingData[format("channel_%s", i)]["turnedOn"])? 1:0])
                document.querySelector(format("#channel%dcurrentMaxN2ControllerFlow", i)).innerHTML = format(settingsObj.languageContent["channel"]["channel%dcurrentMaxN2ControllerFlow"][0], connectionObj.receivingData[format("channel_%s", i)]["channelMaxN2Flow"])
                document.querySelector(format("#channel%dautoControlFlow", i)).innerHTML = format(settingsObj.languageContent["channel"]["channel%dautoControlFlow"][0], connectionObj.receivingData[format("channel_%s", i)]["settedFlow"])

                document.querySelector(format("#channel%dreferenceTemperature", i)).innerHTML = format(settingsObj.languageContent["channel"]["channel%dreferenceTemperature"][0], connectionObj.receivingData[format("channel_%s", i)]["referenceTemperature"])
                
                // document.querySelector(format("#channel%dreferenceTemperature", i)).innerHTML = "ssss"
                // document.querySelector(format("#channel%dcurrentMaxN2ControllerFlow", i)).innerHTML = connectionObj.receivingData[format("channel_%s", i)]["channelMaxN2Flow"]
                updateChart(i)
                
            }
            break;
        }
    }
}

function updateSettings(event)
{
    let temp = event.currentTarget.classList
    temp = Array.from(temp)
    id = event.currentTarget.getAttribute('channel')
    // console.log(connectionObj.channelsNewSettings[id-1]["turnedOn"])
    if(temp.includes("turnOnButton"))
    {
        if(!connectionObj.channelsNewSettings[id-1]["turnedOn"])
        {
            connectionObj.channelsNewSettings[id-1]["turnedOn"] = true
            connectionObj.requestMode = "SET"
        }
    }
    else if(temp.includes("turnOffButton"))
    {
        // console.log('sss')
        if(connectionObj.channelsNewSettings[id-1]["turnedOn"])
        {
            connectionObj.channelsNewSettings[id-1]["turnedOn"] = false
            connectionObj.requestMode = "SET"
        }
    }
    else if(temp.includes("openValveButton"))
    {
        connectionObj.channelsNewSettings[id-1]["valveMode"] = 1
        connectionObj.requestMode = "SET"
    }
    else if(temp.includes("closeValveButton"))
    {
        connectionObj.channelsNewSettings[id-1]["valveMode"] = 0
        connectionObj.requestMode = "SET"
    }
    else if(temp.includes("controlValveButton"))
    {
        connectionObj.channelsNewSettings[id-1]["valveMode"] = 2
        connectionObj.requestMode = "SET"
    }
    else if(temp.includes("maxN2FlowSelector"))
    {
        connectionObj.channelsNewSettings[id-1]["channelMaxN2Flow"] = parseInt(event.currentTarget.value)
        connectionObj.requestMode = "SET"
        // console.log(connectionObj.channelsNewSettings[id-1])
    }
    else if(temp.includes("setTempButton"))
    {
        let temp = event.currentTarget.parentElement.querySelector('input')
        // if(temp.value != "")
        // {
        //     // temp.placeholder = temp.value
        //     // temp.value = ''
        // }
        temp.placeholder = temp.value
        
        connectionObj.channelsNewSettings[id-1]["referenceTemperature"] = parseInt(temp.value)
        temp.value = ''
        connectionObj.requestMode = "SET"
    }
    else if(temp.includes('setAutoControlFlowButton'))
    {
        let temp = event.currentTarget.parentElement.querySelector('input')
        temp.placeholder = temp.value
        connectionObj.channelsNewSettings[id-1]["settedFlow"] = parseInt(temp.value)
        temp.value = ''
        connectionObj.requestMode = "SET"
    }
    // connectionObj.processingStage = 2
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
        // console.log(connectionObj.receivedDataDate)
        // console.log(data);
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
        // connectionObj.requestMode = "GET"
        sendRequest()
    });
}

function sendRequest()
{
    setTimeout(() => 
    {
        if(connectionObj.requestMode == "GET")
        {
            port.write('{"request":"GET_DATA"}', function(err) {})
        }
        else
        {
            let x = {request:"SET_DATA"}
            for(el of connectionObj.channelsNewSettings)
            {
                x[format("channel_%d", el.id)] = el
            }
            connectionObj.requestMode = "GET"
            port.write(JSON.stringify(x), function(err) {console.log(err)})
        }
    }, 10)
}

function initGasesList()
{
    let myPath;
    myPath = path.join(__dirname, 'resources', 'gases.json');
    let rawData = fs.readFileSync(myPath,  { encoding: 'utf8', flag: 'r' })
    let temp = JSON.parse(rawData)
    connectionObj.gasesList = temp
    let myList = document.querySelector('#gasesPickerListContent')
    let element = '<tr class="gas">'
    element+= '<th scope="row">%d</th>'
    element+= '<td>%s</td>'
    element+= '<td>%s</td>'
    element+= '<td>%s</td>'
    element+= '<td>%s</td>'
    element+= '<td>%s</td>'
    element+= '</tr>'
    for (const [key, value] of Object.entries(temp)) 
    {
        myList.innerHTML += format(element, key, value["gas"], value["symbol"], value["specific_heat"], value["density"], value['gcf'])
    }
    document.querySelectorAll('.gas').forEach(element => 
    {
        element.addEventListener('click', gasMark)
    });

    $("#addGasButton").on('click', (e) => 
    {
        if(document.querySelector('.gasMarked') != null && document.querySelector("#gasPickerChoosenList").children.length < 5)
        {
            let myPath = path.join(__dirname, "resources", "gasElement" + '.html');
            let rawData = fs.readFileSync(myPath,  { encoding: 'utf8', flag: 'r' })
         
            let a = connectionObj.gasesList[Number(document.querySelector('.gasMarked').children[0].innerHTML)]
            
            document.querySelector("#gasPickerChoosenList").innerHTML += format(rawData,  a.gas, a.symbol, Number(document.querySelector('.gasMarked').children[0].innerHTML), 0)
        }
        $("#gasPickerChoosenList .gasElement").on('click', (event) => 
        {
            if(event.currentTarget.classList.contains('gasSubmarked'))
            {
                document.querySelectorAll('#gasPickerChoosenList .gasElement').forEach(element => 
                {
                    element.classList.remove('gasSubmarked')
                    element.classList.remove('bg-primary-subtle')
                });
            }
            else
            {
                document.querySelectorAll('#gasPickerChoosenList .gasElement').forEach(element => 
                {
                    element.classList.remove('bg-primary-subtle')
                    element.classList.remove('gasSubmarked')
                });
                event.currentTarget.classList.toggle('gasSubmarked')
                event.currentTarget.classList.toggle('bg-primary-subtle')
            }
        })
    })

    $('#removeGasButton').on('click', () => 
    {
        try
        {
            document.querySelector('.gasSubmarked').remove()
        }
        catch(err)
        {

        }
    })

    $('#setFlowMixedGasButton').on('click', (e) => 
    {
        document.querySelector('.gasSubmarked').children[1].innerHTML = document.querySelector('#setFlowMixedGasValueInput').value + " sccm"
    })

    $('#setNewGasesButton').on('click', (e) => 
    {       
        let x = document.querySelectorAll('#gasPickerChoosenList .gasElement')
        let tempList = []
        let tempID = []
        let tempFlow = []
        for(el of x)
        {
            let temp = el.children;
            let subchildren = el.children[0].children;
            // console.log(temp[1].innerHTML.replaceAll("sccm", ""))
            // console.log()
            tempList.push(connectionObj.gasesList[subchildren[2].innerHTML.replaceAll("ID: ", "")])
            tempID.push(Number(subchildren[2].innerHTML.replaceAll("ID: ", "")))
            tempFlow.push(Number(temp[1].innerHTML.replaceAll("sccm", "")))
        }
        for(let i=0; i<tempList.length; i++)
        {
            connectionObj.channelsNewSettings[0]["gases"][i][0] = tempID[i]
            connectionObj.channelsNewSettings[0]["gases"][i][1] = tempList[i]["symbol_unformatted"]
            connectionObj.channelsNewSettings[0]["gases"][i][2] = tempFlow[i]
        }
        // console.log(connectionObj.channelsNewSettings[0]["gases"])
        // console.log(tempID)
        connectionObj.channelsNewSettings[0]["amountGases"] = tempList.length;

        let tempGCF = 0;
        let part1 = 0;
        let part2 = 0;

        let temptemptemp = 0;

        for(let i=0; i<connectionObj.channelsNewSettings[0]["amountGases"]; i++)
        {
            temptemptemp += connectionObj.channelsNewSettings[0]["gases"][i][2]
        }

        for(let i=0; i<connectionObj.channelsNewSettings[0]["amountGases"]; i++)
        {
            let tempA = connectionObj.channelsNewSettings[0]["gases"][i][2]/temptemptemp
            let tempGCF = connectionObj.gasesList[connectionObj.channelsNewSettings[0]["gases"][i][0]]["gcf"]
            let tempDensity = connectionObj.gasesList[connectionObj.channelsNewSettings[0]["gases"][i][0]]["density"]
            let tempSpecific_heat = connectionObj.gasesList[connectionObj.channelsNewSettings[0]["gases"][i][0]]["specific_heat"]
            let tempS = (tempGCF*tempDensity*tempSpecific_heat)/(0.3106)
            part1 += tempS*tempA
            part2 += tempA*tempDensity*tempSpecific_heat
        }
        part1 *= 0.3106
        tempGCF = part1/part2
        // console.log(part1)
        // console.log(part2)
        // console.log(tempGCF)
        connectionObj.channelsNewSettings[0]["normalGCF"] = tempGCF;
        connectionObj.channelsNewSettings[0]["afterTempCalibrateGCF"] = tempGCF*((connectionObj.channelsNewSettings[0]["referenceTemperature"]+273.15)/273.15)
        connectionObj.processingStage = 1
        try
        {
            document.querySelectorAll("#channel1GasesList .gasElement").forEach(e => e.remove());
        }
        catch(err)
        {

        }
        // console.log(connectionObj.channelsNewSettings[0]["gases"])
        $("#gasesPickerModal").modal("hide")
        console.log(connectionObj.channelsNewSettings[0]["gases"])
        console.log(connectionObj.channelsNewSettings[0]["amountGases"])
        connectionObj.requestMode = "SET"

    })
}

function gasMark(event)
{
    if(event.currentTarget.classList.contains('gasMarked'))
    {
        document.querySelectorAll('.gas').forEach(element => 
        {
            element.classList.remove('gasMarked')
            element.classList.remove('bg-primary-subtle')
        });
    }
    else
    {
        document.querySelectorAll('.gas').forEach(element => 
        {
            element.classList.remove('bg-primary-subtle')
            element.classList.remove('gasMarked')
        });
        event.currentTarget.classList.toggle('gasMarked')
        event.currentTarget.classList.toggle('bg-primary-subtle')
    }
    
}

//CHART
chartObj = 
{
    deviceChart: null,
    chart: null,
    config: null,
    labels: null,
    data: null,
    counter: 0,
    shiftModeCounter: 5
}

function getRandomColor() 
{
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (let i = 0; i < 6; i++) 
    {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createDataSets(index)
{
    let temp = 
    {
        label: format("Channel %d", index),
        // yAxisID             : 'yAxes',
        data: Array.from({ length: 60 }, () => 0),
        fill: false,
        borderColor: getRandomColor(),
        tension: 0.1
    }
    return temp
}

function initChart(channelsAmount)
{
    chartObj.deviceChart = document.getElementById('deviceChart')
    chartObj.labels = ["Minute temu", "30 sekund temu", "Teraz"]
    let temp = []
    for(let i=0; i<channelsAmount; i++)
    {
        temp.push(createDataSets(i+1))
    }
    chartObj.data = {
        labels: chartObj.labels,
        datasets: temp
      };

      chartObj.config = {
        type: 'line',
        data: chartObj.data,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 5000
                }
            }
        }
      };



    chartObj.chart = new chartjs.Chart(chartObj.deviceChart, chartObj.config);
}

function updateChart(dataIndex)
{
    try
    {

        dataIndex--
        // console.log(dataIndex)
        chartObj.counter = 0;
        chartObj.data.datasets[dataIndex].data.shift()
        chartObj.data.datasets[dataIndex].data.push(connectionObj.receivingData[format("channel_%d", dataIndex+1)]["currentFlow"])
        
        // chartObj.data.datasets[dataIndex].shift()
        
        // console.log(chartObj.data.datasets[dataIndex].data)
        chartObj.chart.update('none')
    }
    catch(err){}
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
    initChart,
    initGasesList
}
