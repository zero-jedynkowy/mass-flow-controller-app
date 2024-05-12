const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
let menuIsActive = false
let isMenuAnimationActive = false;

function showMenuButtonAction()
{
    if(isMenuAnimationActive == false)
    {
        if(!menuIsActive)
        {
            isMenuAnimationActive = true
            $("#sideBar").animate({"left":"0px"}, 500, () => {isMenuAnimationActive = 0})
        }
        else
        {
            isMenuAnimationActive = true
            $("#sideBar").animate({"left": "-" + $("#sideBar").outerWidth().toString() + "px"}, 500, () => {isMenuAnimationActive = 0});
            
        }
        menuIsActive = menuIsActive? false:true
    }
}

function resizeWindowUpdater()
{
    let size = currentWindow.getSize();
    console.log("sdasdada")
    if(size[0] < 1000)
    {
        $("#showMenuButton").fadeIn(250)
        $("#menuPlaceHolder").css("width", "0");
        $("#mainContent").css("width", "100%");
        $("#sideBar").css("width", "40%");
        if(menuIsActive)
        {
            $("#sideBar").css("left", "0px")
            menuIsActive = 1;
        }
        else
        {
            $("#sideBar").css("left", "-" + $("#sideBar").outerWidth().toString() + "px");
        }
    }
    else
    {
        $("#showMenuButton").fadeOut(250)
        $("#menuPlaceHolder").css("width", "25%");
        $("#mainContent").css("width", "75%");
        $("#sideBar").css("width", "25%");
        $("#sideBar").css("left", "0px");
    }
}




module.exports = {resizeWindowUpdater, showMenuButtonAction}