const remote = window.require("@electron/remote");
const currentWindow = remote.getCurrentWindow();
let menuIsActive = true
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
    let channels = document.querySelectorAll(".channel")
    if(size[0] < 1452)
    {
        
        $(".channelsRows").addClass("flex-column")
        $(".channelsRows").removeClass("flex-row")
        for(let i=0; i<channels.length; i=i+2)
        {
            channels[i].classList.remove("me-3")
        }
    }
    else
    {
        $(".channelsRows").addClass("flex-row")
        $(".channelsRows").removeClass("flex-column")
        for(let i=0; i<channels.length; i=i+2)
        {
            channels[i].classList.add("me-3")
        }
    }
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
        $("#menuPlaceHolder").css("width", "27%");
        $("#mainContent").css("width", "73%");
        $("#sideBar").css("width", "27%");
        $("#sideBar").css("left", "0px");
    }   
    
    $("#mainContent").height(currentWindow.getSize()[1])
}

module.exports = {resizeWindowUpdater, showMenuButtonAction}