var inputFadeTime = 0.25;

var canvas = document.getElementById("canvas");
var inputForm = document.getElementsByClassName("form")[0];
var errorMessage = inputForm.getElementsByClassName("errorMessage")[0];
errorMessage.style.opacity = 0;

/*
var fixed = document.getElementById('background');

fixed.addEventListener('touchmove', function(e) {

    e.preventDefault();

}, false);
*/
function UIInputAnimateIn()
{
    errorMessage.style.opacity = 0;
}

function UIInputAnimateOut()
{
    errorMessage.style.opacity = 0;
    TweenMax.to(inputForm, inputFadeTime*3.5, {delay:inputFadeTime, opacity:0});
    TweenMax.to(inputForm, inputFadeTime*3, {delay:inputFadeTime, top:0, ease:Back.easeIn, onComplete: UICustomizeAnimateIn});
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

function UIInputErrorMessage(message)
{
    errorMessage.style.opacity = 1;
    errorMessage.style.color = "red";
    errorMessage.innerHTML = message;
}