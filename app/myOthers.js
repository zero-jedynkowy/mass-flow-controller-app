const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
let menuIsActive = false

function showMenuButtonAction()
{
    menuIsActive = menuIsActive? false:true
    if(menuIsActive)
    {
        $("#sideBar").animate({"left":"0px"}, 500)
    }
    else
    {
        $("#sideBar").animate({"left": "-" + $("#sideBar").width().toString() + "px"}, 500, resizeWindowUpdater);
        
    }
}


function resizeWindowUpdater()
{
    let size = currentWindow.getSize();
    
    if(size[0] < 1000)
    {
        $("#showMenuButton").fadeIn(250)
        $("#menuPlaceHolder").css("width", "0");
        $("#mainContent").css("width", "100%");
        $("#sideBar").css("width", "40%");
        if(menuIsActive)
        {
            $("#sideBar").css("left", "0px")
        }
        else
        {
            $("#sideBar").css("left", "-" + $("#sideBar").width().toString() + "px");
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