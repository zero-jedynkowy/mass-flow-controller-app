const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
const settings = currentWindow.settings;
let languageContent;

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

function getLanguageContent(id)
{
    return languageContent[id]
}

module.exports = {settings, setSettings, changeTheme, switchDevMode, changeLanguage, getLanguageContent}