var textFadeTime = .25;

//var canvas = document.getElementById("canvas");
/*
var footerLeft = document.getElementById("footerLeft");
var footerCenter = document.getElementById("footerCenter");
var playNow= document.getElementById("playNow");
var comboBadge= document.getElementById("comboBadge");
var attractTopLeft = document.getElementById("attractTopLeft");
var attractBottomLeft = document.getElementById("attractBottomLeft");
var attractRight = document.getElementById("attractRight");
var attractStep2TopLeft = document.getElementById("attractStep2TopLeft");
var attractStep2BottomLeft = document.getElementById("attractStep2BottomLeft");
var attractStep2Right = document.getElementById("attractStep2Right");
*/
function UIWaitingAnimateIn()
{
    //set values
    //Fade in
/*
    attractBottomLeft.innerText = "30";
    attractBottomLeft.style.color = "yellow";

    attractStep2BottomLeft.innerHTML = "WAITING FOR OTHER <br />PLAYERS TO JOIN...";
    attractStep2BottomLeft.style.color = "white";
    attractStep2BottomLeft.style.cssText = "font-size: = 10";
    attractStep2BottomLeft.style.fontSize = "x-large";
    var compStyle = window.getComputedStyle(attractStep2BottomLeft, null);
*/
    /*
    attractBottomLeft.style.left = canvas.width * .5;
    attractBottomLeft.style.top = canvas.height * .5;
    attractBottomLeft.style.textAlign = "center";
*/
/*
    TweenMax.to(comboBadge, textFadeTime, {alpha:0});
    TweenMax.to(attractTopLeft, textFadeTime, {alpha:0});
    TweenMax.to(attractBottomLeft, textFadeTime, {alpha:1});
    TweenMax.to(attractRight, textFadeTime, {alpha:0});
    TweenMax.to(attractStep2TopLeft, textFadeTime, {alpha:0});
    TweenMax.to(attractStep2BottomLeft, textFadeTime, {alpha:1});
    TweenMax.to(attractStep2Right, textFadeTime, {alpha:0});

    TweenMax.to(playNow, textFadeTime, {delay: textFadeTime*3,alpha:1});
*/
}

function UIWaitingAnimateOut()
{
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
    /*
    attractBottomLeft.innerText = Math.ceil(time.toFixed(2)).toString();

    if(time<0)
    {
        attractBottomLeft.innerText = "";
    }
    */
}