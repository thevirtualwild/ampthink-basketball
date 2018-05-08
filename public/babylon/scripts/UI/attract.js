var textFadeTime = 0.25;

var canvas = document.getElementById("canvas");


var footerLeft = document.getElementById("footerLeft");
var footerCenter = document.getElementById("footerCenter");
var playNow= document.getElementById("playNow");
var comboBadge= document.getElementById("comboBadge");
var results = document.getElementById("results");
var inner = document.getElementById("inner");
var attractLeftStep1 = document.getElementById("footerLeft").getElementsByClassName("attractLeft");
var attractRightStep1 = document.getElementById("footerLeft").getElementsByClassName("attractRight");

var attractLeftStep2 = document.getElementById("footerCenter").getElementsByClassName("attractLeft");
var attractRightStep2 = document.getElementById("footerCenter").getElementsByClassName("attractRight");
//var attractLeft = document.getElementByID("attractTopLeft");
/*
var attractBottomLeft = document.getElementById("attractBottomLeft");
var attractRight = document.getElementById("attractRight");
var attractStep2TopLeft = document.getElementById("attractStep2TopLeft");
var attractStep2BottomLeft = document.getElementById("attractStep2BottomLeft");
var attractStep2Right = document.getElementById("attractStep2Right");
*/
var attractLeftStepNum = document.getElementById("footerLeft").getElementsByClassName("stepNum");


function UIAttractAnimateIn()
{
    attractLeftStep1.style.display = "inline";
    attractLeftStep2.style.display = "inline";
    attractRightStep1.style.display = "inline";
    attractRightStep2.style.display = "inline";

    inner.style.backgroundColor = "transparent";
    results.style.display = "none";
    footer.style.backgroundPositionY = "200";
    footerLeft.style.top = "200";
    footerCenter.style.top = "200";

    TweenMax.to(footer, textFadeTime, {backgroundPositionY:0});
    TweenMax.to(footerLeft, textFadeTime, {top:0});
    TweenMax.to(footerCenter, textFadeTime, {top:0});

    playNow.style.opacity = 1;
    TweenMax.to(playNow, textFadeTime * 3, {alpha: 0, repeat: -1,  ease:Power2.easeIn, yoyo:true});
    comboBadge.style.opacity = 0;

    attractLeftStep1.style.opacity = 0;
    attractRightStep1.style.opacity = 0;
    attractLeftStep2.style.opacity = 0;
    attractRightStep2.style.opacity = 0;

    TweenMax.to(attractLeftStep1, textFadeTime, {delay: 3*textFadeTime, alpha:1});
    TweenMax.to(attractRightStep1, textFadeTime, {delay: 3*textFadeTime, alpha:1});
    TweenMax.to(attractLeftStep2, textFadeTime, {delay: 3*textFadeTime, alpha:1});
    TweenMax.to(attractRightStep2, textFadeTime, {delay: 3*textFadeTime, alpha:1});

    console.log("ANIMATED BACK IN");
}

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