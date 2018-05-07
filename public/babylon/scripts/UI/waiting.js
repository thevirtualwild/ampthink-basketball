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

function UIWaitingAnimateIn()
{
    //set values
    //Fade in
    //footerLeft.style.maxWidth = 200;
    transitioned = false;
    attractLeftStep1.style.display = "none";
    attractLeftStep2.style.display = "none";
    attractRightStep1.style.display = "none";
    attractRightStep2.style.display = "none";

    waitingLeft.style.display = "inline";
    waitingRight.style.display = "inline"
    countdown.style.opacity = 0;
    textWaiting.style.opacity = 0;
    TweenMax.to(countdown, textFadeTime, {opacity:1});
    TweenMax.to(textWaiting, textFadeTime, {opacity:1});

}

function UIWaitingAnimateOut()
{

    TweenMax.to(countdown, textFadeTime, {opacity:0, delay: textFadeTime, onComplete: UIGameplayAnimateIn});
    TweenMax.to(textWaiting, textFadeTime, {opacity:0, delay: textFadeTime,});

    //Fade out both bball texts
    //Fade out Play Now!
    //Call Waitings animateIn
    /*
    TweenMax.to(playNow, textFadeTime, {alpha:0});
    TweenMax.to(comboBadge, textFadeTime, {alpha:0});
    TweenMax.to(attractTopLeft, textFadeTime, {alpha:0});
    TweenMax.to(attractBottomLeft, textFadeTime, {alpha:0});
    TweenMax.to(attractRight, textFadeTime, {alpha:0});
    TweenMax.to(attractStep2TopLeft, textFadeTime, {alpha:0});
    TweenMax.to(attractStep2BottomLeft, textFadeTime, {alpha:0});
    TweenMax.to(attractStep2Right, textFadeTime, {alpha:0});

    TweenMax.to(footerLeft, textFadeTime, {delay: textFadeTime*3, width:.16*canvas.width});
    TweenMax.to(footerCenter, textFadeTime, {delay: textFadeTime*3, width:.699*canvas.width});
    */
}

function UIWaitingUpdateClock(time)
{
    countdown.innerHTML = (Math.ceil(time.toFixed(2)) + 1).toString();

    if(time+1  <= 0 && transitioned == false)
    {
        transitioned=  true;
        countdown.innerHTML = "0";
        UIWaitingAnimateOut();
        console.log("TRIGGERED");
    }
    else if(time+1<0)
    {
        countdown.innerHTML = "0";
    }
}