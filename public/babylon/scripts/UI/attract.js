var textFadeTime = .25;

var canvas = document.getElementById("canvas");


var footerLeft = document.getElementById("footerLeft");
var footerCenter = document.getElementById("footerCenter");
var playNow= document.getElementById("playNow");
var comboBadge= document.getElementById("comboBadge");

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
    //BBALL Text instructions 1+2 appear in bottom
    //Show background Graphic 1 and background Graphic 2
    /*
    TweenMax.to(footerLeft, textFadeTime, {width:.43*canvas.width});
    TweenMax.to(footerCenter, textFadeTime, {width:.43*canvas.width});

    TweenMax.to(comboBadge, textFadeTime, {delay: textFadeTime*3,alpha:0});
    TweenMax.to(attractTopLeft, textFadeTime, {delay: textFadeTime*3,alpha:0});
    TweenMax.to(attractBottomLeft, textFadeTime, {delay: textFadeTime*3,alpha:0});
    TweenMax.to(attractRight, textFadeTime, {delay: textFadeTime*3,alpha:0});
    TweenMax.to(attractStep2TopLeft, textFadeTime, {delay: textFadeTime*3,alpha:0});
    TweenMax.to(attractStep2BottomLeft, textFadeTime, {delay: textFadeTime*3,alpha:0});
    TweenMax.to(attractStep2Right, textFadeTime, {delay: textFadeTime*3,alpha:0});

    TweenMax.to(playNow, textFadeTime, {delay: textFadeTime*3,alpha:1});
    */
}

function UIAttractAnimateOut()
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
    TweenMax.to(footerCenter, textFadeTime, {delay: textFadeTime*3, width:.699*canvas.width/*, onComplete: UIWaitingAnimateIn*///});

}