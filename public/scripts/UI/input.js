var inputFadeTime = 0.25;

var canvas = document.getElementById("canvas");
var inputForm = document.getElementsByClassName("form")[0];

//UIInputAnimateOut();

function UIInputAnimateIn()
{

}

function UIInputAnimateOut()
{
    TweenMax.to(inputForm, inputFadeTime*3.5, {delay:inputFadeTime*5, opacity:0});
    TweenMax.to(inputForm, inputFadeTime*3, {delay:inputFadeTime*5, top:0, ease:Back.easeIn, onComplete: UICustomizeAnimateIn});
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