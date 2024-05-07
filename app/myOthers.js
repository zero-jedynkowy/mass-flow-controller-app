function setLeftPanelHeight()
{
    let temp = document.querySelector("#portsListTitleParent").offsetHeight
    temp = document.querySelector("body").offsetHeight - temp
    document.querySelector(".leftPanel").style.height = temp + "px"
}

module.exports = {setLeftPanelHeight}