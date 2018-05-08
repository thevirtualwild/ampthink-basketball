var customizeFadeTime = 0.5;

var canvas = document.getElementById("canvas");
var inputForm = document.getElementsByClassName("form")[0];
var customizeForm = document.getElementsByClassName("form")[1];
var gameplayForm = document.getElementsByClassName("form")[2];
var gameoverForm = document.getElementsByClassName("form")[3];
var refreshLogo = document.getElementById("refreshLogo");

var inputPage = document.getElementsByClassName("passcode page")[0];
var customizePage = document.getElementsByClassName("player page")[0];
var gameplayPage = document.getElementsByClassName("gameplay page")[0];
var gameoverPage = document.getElementsByClassName("gameover page")[0];

var firstName = customizeForm.getElementsByClassName("firstName")[0];
var lastName = customizeForm.getElementsByClassName("lastName")[0];
var dashImage = customizeForm.getElementsByClassName("playerDash")[0];
var teamName = customizeForm.getElementsByClassName("teamColor")[0];
var teamLabel = customizeForm.getElementsByClassName("teamLabel")[0];

//UIInputAnimateOut();

function UICustomizeAnimateIn()
{
    inputPage.style.display = "none";
    customizePage.style.display = "block";
    gameplayPage.style.display = "none";
    gameoverPage.style.display = "none";

    firstName.style.opacity = 0;
    lastName.style.opacity = 0;
    dashImage.style.opacity = 0;
    dashImage.style.width = 0;
    teamName.style.opacity = 0;
    teamLabel.style.opacity = 0;
    refreshLogo.style.opacity = 0;
    //customizeForm.style.opacity = 0;

    var name = userdata.username;
    firstName.innerHTML = name.substr(0, name.indexOf(' '));
    lastName.innerHTML = name.substr(name.indexOf(' ') + 1);

    teamName.innerHTML = userdata.team.name;
    teamName.style.color = userdata.team.colorHex;

    TweenMax.to(firstName, customizeFadeTime, {delay:customizeFadeTime, opacity:1});
    TweenMax.to(lastName, customizeFadeTime, {delay:customizeFadeTime*2, opacity:1});
    TweenMax.to(dashImage, customizeFadeTime, {delay:customizeFadeTime*3, opacity:1, width:400, ease:Back.easeOut});
    TweenMax.to(teamName, customizeFadeTime, {delay:customizeFadeTime*4, opacity:1});
    TweenMax.to(teamLabel, customizeFadeTime, {delay:customizeFadeTime*4, opacity:1});
    //TweenMax.to(customizeForm, inputFadeTime*3, {delay:inputFadeTime, top: canvas.height*.3, ease:Back.easeOut});

    TweenMax.to(refreshLogo, customizeFadeTime, {delay:customizeFadeTime*6, opacity:1});
}

function UICustomizeAnimateOut()
{
    TweenMax.to(inputForm, customizeFadeTime*3.5, {delay:customizeFadeTime*5, alpha:0});
    TweenMax.to(inputForm, customizeFadeTime*3, {delay:customizeFadeTime*5, top:0, ease:Back.easeIn, onComplete: UICustomizeAnimateIn});
}

/*
function UIAttractAnimateOut()
{
    TweenMax.to(attractLeftStep1, textFadeTime, {alpha:0});
    TweenMax.to(attractRightStep1, textFadeTime, {alpha:0});
    TweenMax.to(attractLeftStep2, textFadeTime, {alpha:0});
    TweenMax.to(attractRightStep2, textFadeTime, {alpha:0});

    TweenMax.to(playNow, textFadeTime, {alpha:0});
    TweenMax.to(comboBadge, textFadeTime, {alpha:0});

    TweenMax.to(footerLeft, textFadeTime, {delay: textFadeTime*2, width:.22*canvas.width});
    TweenMax.to(footerCenter, textFadeTime, {delay: textFadeTime*2, width:.22*canvas.width, onComplete: UIWaitingAnimateIn});
}

function UIAttractUpdateCourtName(name)
{
    attractRightStep2.innerHTML = "<h2>THEN ENTER</h2><h2>CODE '<span id=\"courtCode\">" + name + "</span>'</h2>";
}
*/