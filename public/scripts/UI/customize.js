var customizeFadeTime = 0.5;

var canvas = document.getElementById("canvas");
var inputForm = document.getElementsByClassName("form")[0];
var customizeForm = document.getElementsByClassName("form")[1];
var gameplayForm = document.getElementsByClassName("form")[2];
var gameoverForm = document.getElementsByClassName("form")[3];
var refreshLogo = document.getElementById("refreshLogo");
var refreshImg = document.getElementById("refresh");
var inputPage = document.getElementsByClassName("passcode page")[0];
var customizePage = document.getElementsByClassName("player page")[0];
var gameoverPage = document.getElementsByClassName("gameover page")[0];

var firstName = customizeForm.getElementsByClassName("firstName")[0];
var lastName = customizeForm.getElementsByClassName("lastName")[0];
var dashImage = customizeForm.getElementsByClassName("playerDash")[0];
var teamName = customizeForm.getElementsByClassName("teamColor")[0];
var teamLabel = customizeForm.getElementsByClassName("teamLabel")[0];

//UIInputAnimateOut();
var name;
var animating;
refreshLogo.addEventListener('click', function (e) {
    changeName();
});

function UICustomizeAnimateIn()
{
    inputPage.style.display = "none";
    customizePage.style.display = "block";
    gameoverPage.style.display = "none";

    firstName.style.opacity = 0;
    lastName.style.opacity = 0;
    dashImage.style.opacity = 0;
    dashImage.style.width = 0;
    teamName.style.opacity = 0;
    teamLabel.style.opacity = 0;
    refreshLogo.style.opacity = 0;
    //customizeForm.style.opacity = 0;

    name = userdata.username;
    firstName.innerHTML = name.substr(0, name.indexOf(' '));
    lastName.innerHTML = name.substr(name.indexOf(' ') + 1);

    teamName.innerHTML = userdata.team.name;
    teamName.style.color = userdata.team.colorHex;

    TweenMax.to(firstName, customizeFadeTime, {delay:customizeFadeTime, opacity:1});
    TweenMax.to(lastName, customizeFadeTime, {delay:customizeFadeTime*2, opacity:1});
    TweenMax.to(dashImage, customizeFadeTime, {delay:customizeFadeTime*3, opacity:1, width:400, ease:Back.easeOut});
    TweenMax.to(teamName, customizeFadeTime, {delay:customizeFadeTime*4, opacity:1});
    TweenMax.to(teamLabel, customizeFadeTime, {delay:customizeFadeTime*4, opacity:1});

    TweenMax.to(refreshLogo, customizeFadeTime, {delay:customizeFadeTime*6, opacity:1});
}

function UICustomizeAnimateOut()
{
    TweenMax.to(customizeForm, customizeFadeTime*1.5, {opacity:0, onComplete:UIGameplayAnimateIn});
    TweenMax.to(refreshLogo, customizeFadeTime*1.5, {opacity:0});
    TweenMax.to(customizeForm, customizeFadeTime*1, {top:0, ease:Back.easeIn});
}

function changeName()
{
    if(animating) return;

    TweenMax.to(firstName, customizeFadeTime, {opacity: 0});
    TweenMax.to(lastName, customizeFadeTime, {opacity: 0, onComplete: getName});

    TweenMax.to(refreshImg, customizeFadeTime/5, {scaleX: 1.1, scaleY: 1.1, repeat:1, yoyo:true});

    animating = true;
}

function getName()
{
    name = generateName();

    firstName.innerHTML = name.substr(0, name.indexOf(' '));
    lastName.innerHTML = name.substr(name.indexOf(' ') + 1);

    TweenMax.to(firstName, customizeFadeTime, {opacity: 1});
    TweenMax.to(lastName, customizeFadeTime, {opacity: 1, onComplete: stopAnimating});

    console.log(userdata);
    console.log(userdata.username);
    console.log(name);
    userdata.username = name;

    socket.emit("change player name", userdata);

}

function stopAnimating()
{
    animating = false;
}

/*
function UIAttractUpdateCourtName(name)
{
    attractRightStep2.innerHTML = "<h2>THEN ENTER</h2><h2>CODE '<span id=\"courtCode\">" + name + "</span>'</h2>";
}
*/