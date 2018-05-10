var gameplayFadeTime = 0.5;

var pages = document.getElementsByClassName("pages")[0];
var canvas = document.getElementById("canvas");
var inputForm = document.getElementsByClassName("form")[0];
var customizeForm = document.getElementsByClassName("form")[1];
var gameplayForm = document.getElementsByClassName("form")[2];
var gameoverForm = document.getElementsByClassName("form")[3];
var refreshLogo = document.getElementById("refreshLogo");
var refreshImg = document.getElementById("refresh");
var inputPage = document.getElementsByClassName("passcode page")[0];
var customizePage = document.getElementsByClassName("player page")[0];
var gameplayPage = document.getElementsByClassName("gameplay page")[0];
var gameoverPage = document.getElementsByClassName("gameover page")[0];

var headerInstructions = document.getElementById("headerInstructions");
var background = document.getElementById("background");
function UIGameplayAnimateIn()
{
    //inputPage.style.display = "none";
    //customizePage.style.display = "none";
    //gameoverPage.style.display = "none";
    //pages.style.display = "none";

    //pages.style.pointerEvents = "none";
    background.style.pointerEvents = "none";
    inputPage.style.pointerEvents = "none";
    customizePage.style.pointerEvents = "none";
    gameoverPage.style.pointerEvents = "none";

    /*
    gameplayForm.style.opacity = 0;
    gameplayForm.style.top = "-100px";

    inputPage.style.zIndex = -100;
    customizePage.style.zIndex = -100;
    gameplayPage.style.zIndex = -100;
    gameoverPage.style.zIndex = -100;
*/
    TweenMax.to(headerInstructions, customizeFadeTime, {delay:customizeFadeTime, top:0});
    TweenMax.to(headerInstructions, customizeFadeTime, {delay:customizeFadeTime*2, opacity:1});
}

function UIGameplayAnimateOut()
{
    TweenMax.to(headerInstructions, customizeFadeTime, {delay:customizeFadeTime, top:0});
    TweenMax.to(headerInstructions, customizeFadeTime, {delay:customizeFadeTime*2, opacity:0, onComplete: UIGameoverAnimateIn});
}


/*
function UIAttractUpdateCourtName(name)
{
    attractRightStep2.innerHTML = "<h2>THEN ENTER</h2><h2>CODE '<span id=\"courtCode\">" + name + "</span>'</h2>";
}
*/