function setLeftPanelHeight()
{
    let temp = document.querySelector(".deviceTitleParent").offsetHeight
    temp = document.querySelector("body").offsetHeight - temp
    document.querySelector(".leftPanel").style.height = temp + "px"
}

setLeftPanelHeight()

function connectToDevice()
{

}

function changeTheme()
{
    document.querySelector("html").setAttribute("data-bs-theme", "dark")
}

function switchDevMode()
{

}

function changeLanguage()
{

}

document.querySelector("#connectButton").addEventListener("onclick", connectToDevice);
document.querySelector("#themeButton")