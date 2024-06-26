const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
const bootstrap = require('bootstrap')

const settings = currentWindow.settings;

let isDevModeOn = false
let isDevToolsOpened = false
let keyCounter = 0;
let languageContent;

function resetSettings()
{
    settings.setSync("language", "english")
    settings.setSync("theme", "light")
    settings.setSync("channelsChart", false)
    settings.setSync("welcomeWindow", true)
}

function initSettings()
{
    settings.configure
    ({
        atomicSave: true,
        numSpaces: 2,
        prettify: true
    })

    if(settings.getSync("language") == null || settings.getSync("theme") == null 
    || settings.getSync("channelsChart") == null || settings.getSync("welcomeWindow") == null)
    {
        resetSettings()
    }
}

function changeTheme()
{
    let theme = $('html').attr('data-bs-theme') == 'dark'? 'light':'dark'
    document.querySelector("html").setAttribute('data-bs-theme', theme)
    settings.setSync("theme", theme)
    $('#changeThemeButton').find('i').toggleClass("bi-moon-stars")
    $('#changeThemeButton').find('i').toggleClass("bi-brightness-high")
}

function switchDevMode(event)
{   
    isDevModeOn = isDevModeOn? false:true
    if(isDevModeOn)
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
    isDevToolsOpened = isDevToolsOpened? false:true
    if(isDevToolsOpened) currentWindow.webContents.openDevTools()
    else currentWindow.webContents.closeDevTools()
}

currentWindow.webContents.on('before-input-event', (event, input) => 
{
    if(input.control && input.key.toLowerCase() === 'd') 
    {
        keyCounter += 1
        if(keyCounter == 2) keyCounter = 0
        else switchDevMode()
        event.preventDefault()
    }
})

function changeLanguageButtonAction()
{
    let newLanguage = settings.getSync("language") == "polski"? 'english':'polski'
    changeLanguage(newLanguage)
}

function changeLanguage(newLanguage)
{
    let content;
    let myPath;
    settings.setSync("language", newLanguage)
    myPath = path.join(__dirname, 'languages', newLanguage + '.json');
    let rawData = fs.readFileSync(myPath,  { encoding: 'utf8', flag: 'r' })
    languageContent = JSON.parse(rawData)
    for (const [key, value] of Object.entries(languageContent["normal"])) 
    {
        $("#" + key).text(value)
    }
    for(const [key, value] of Object.entries(languageContent["tooltip"])) 
    {
        let tooltip = bootstrap.Tooltip.getInstance("#" + key); 
        tooltip._config.title = value; 
        tooltip.update(); 
        tooltip.hide()
    }
}

function switchChannelsChart(newValue)
{
    settings.setSync("channelsChart", newValue)
    if(settings.getSync("channelsChart")) $("#channelsChartSwitcher").attr("checked", "")
    else $("#channelsChartSwitcher").removeAttr("checked")
}

function switchChannelsChartButtonAction()
{
    let newValue = settings.getSync("channelsChart")? false:true
    switchChannelsChart(newValue)
}

function applySettings()
{
    let theme = settings.getSync("theme") == "dark"? 'dark':'light'
    document.querySelector("html").setAttribute('data-bs-theme', theme)
    if(theme == 'dark')
    {
        $('#changeThemeButton').find('i').removeClass("bi-moon-stars")
        $('#changeThemeButton').find('i').addClass("bi-brightness-high")
    }
    else
    {
        $('#changeThemeButton').find('i').addClass("bi-moon-stars")
        $('#changeThemeButton').find('i').removeClass("bi-brightness-high")
    }
    changeLanguage(settings.getSync("language"))
    switchChannelsChart(settings.getSync("channelsChart"))
}

module.exports = 
{
    initSettings, 
    applySettings, 
    changeTheme, 
    switchDevMode, 
    showConsole, 
    changeLanguage, 
    changeLanguageButtonAction, 
    switchChannelsChart, 
    switchChannelsChartButtonAction
}