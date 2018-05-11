var textFadeTime = .5;

var canvas = document.getElementById("canvas");
var transitioned = false;

var footerLeft = document.getElementById("footerLeft");
var footerCenter = document.getElementById("footerCenter");
var playNow= document.getElementById("playNow");
var comboBadge= document.getElementById("comboBadge");

var attractLeftStep1 = document.getElementById("footerLeft").getElementsByClassName("attractLeft")[0];
var attractRightStep1 = document.getElementById("footerLeft").getElementsByClassName("attractRight")[0];

var attractLeftStep2 = document.getElementById("footerCenter").getElementsByClassName("attractLeft")[0];
var attractRightStep2 = document.getElementById("footerCenter").getElementsByClassName("attractRight")[0];

var waitingLeft = document.getElementById("footerLeft").getElementsByClassName("waitingLeft")[0];
var waitingRight = document.getElementById("footerCenter").getElementsByClassName("waitingRight")[0];
var countdown = waitingLeft.getElementsByClassName("textCountdown")[0];
var textWaiting = waitingRight.getElementsByClassName("textWaiting")[0];

var footerWidth;

function UIWaitingAnimateIn()
{
    footerWidth = parseInt(footerCenter.style.width.substr(0, footerCenter.style.width.length-2));
    footerWidth = canvas.width * .09;

    transitioned = false;
    attractLeftStep1.style.display = "none";
    attractLeftStep2.style.display = "none";
    attractRightStep1.style.display = "none";
    attractRightStep2.style.display = "none";

    waitingLeft.style.display = "inline";
    waitingRight.style.display = "inline"
    countdown.style.opacity = 0;
    textWaiting.style.opacity = 0;
    textWaiting.style.left = footerWidth + "px";
    TweenMax.to(countdown, textFadeTime, {opacity:1});
    TweenMax.to(textWaiting, textFadeTime, {opacity:1});
}

function UIWaitingAnimateOut()
{
    TweenMax.to(countdown, textFadeTime, {opacity:0, delay: textFadeTime, onComplete: UIGameplayAnimateIn});
    TweenMax.to(textWaiting, textFadeTime/2, {opacity:0, delay: textFadeTime});
    TweenMax.to(textWaiting, textFadeTime, {left: footerWidth + 300 , delay: textFadeTime})
}

function UIWaitingUpdateClock(time)
{
    countdown.innerHTML = (Math.ceil(time.toFixed(2)) + 1).toString();

    if(time+1  <= 0 && transitioned == false)
    {
        transitioned=  true;
        countdown.innerHTML = "0";
        UIWaitingAnimateOut();
    }
    else if(time+1<0)
    {
        countdown.innerHTML = "0";
    }
}