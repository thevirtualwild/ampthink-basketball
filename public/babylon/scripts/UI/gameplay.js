var textFadeTime = .5;

var canvas = document.getElementById("canvas");

var footer = document.querySelector("footer");
var footerLeft = document.getElementById("footerLeft");
var footerCenter = document.getElementById("footerCenter");
var playNow= document.getElementById("playNow");
var comboBadge= document.getElementById("comboBadge");

var gameplayLeft = document.getElementById("footerLeft").getElementsByClassName("gameplayLeft")[0];
var gameplayRight = document.getElementById("footerCenter").getElementsByClassName("gameplayRight")[0];
var scoreText = gameplayLeft.getElementsByClassName("textScore")[0];
var scoreLabel = gameplayLeft.getElementsByClassName("textScoreLabel")[0];
var firstName = gameplayRight.getElementsByClassName("textGameplayFirst")[0];
var lastName = gameplayRight.getElementsByClassName("textGameplayLast")[0];
var comboNumText = document.getElementById("comboNum");

function UIGameplayAnimateIn()
{
    waitingLeft.style.display = "none";
    waitingRight.style.display = "none";

    gameplayLeft.style.display = "inline";
    gameplayRight.style.display = "inline"

    gameplayLeft.opacity = 0;
    firstName.style.opacity = 0;
    lastName.style.opacity = 0;

    TweenMax.to(gameplayLeft, textFadeTime, {opacity:1, delay: textFadeTime});
    TweenMax.to(firstName, textFadeTime, {opacity:1, delay: textFadeTime});
    TweenMax.to(lastName, textFadeTime, {opacity:1, delay: textFadeTime});
    console.log("TWEEN IN GAMEPLAY");
}

function UIGameplayAnimateOut()
{
    footer.style.backgroundPositionY = "0";
    footerLeft.style.top = "0";
    footerCenter.style.top = "0";

    TweenMax.to(footer, textFadeTime, {backgroundPositionY:200});
    TweenMax.to(footerLeft, textFadeTime, {top:200});
    TweenMax.to(footerCenter, textFadeTime, {top:200, onComplete: turnOffDisplay});
}

function UIGameplayUpdateScore(scoreInput)
{
    scoreText.innerHTML = scoreInput.toString();
    TweenMax.to(scoreText, 0.1, {scaleX:1.2, scaleY:1.2, repeat: 1, yoyo:true});
}

function UIGameplayUpdateName(name)
{
    firstName.innerHTML = name.substr(0, name.indexOf(' '));
    lastName.innerHTML = name.substr(name.indexOf(' ') + 1);
}

function UIGameplayAnimateBadgeOn(comboNum)
{
    comboNumText.innerHTML = comboNum.toString();

    if(comboNum == 2)
    {
        TweenMax.to(comboBadge, 0.1, {opacity: 1});
    }

    TweenMax.to(comboBadge, 0.1, {scaleX:1.2, scaleY:1.2, repeat: 1, yoyo:true});
}

function UIGameplayAnimateBadgeOff()
{
    TweenMax.to(comboBadge, 0.1, {opacity: 0});

}

function turnOffDisplay()
{
    gameplayLeft.style.display = "none";
    gameplayRight.style.display = "none";

    UIResultsAnimateIn();
}
