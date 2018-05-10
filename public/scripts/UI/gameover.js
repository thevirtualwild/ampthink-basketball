var gameoverFadeTime = 0.5;

var pages = document.getElementsByClassName("pages")[0];
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

var thank = document.getElementsByClassName("thank")[0];
var you = document.getElementsByClassName("you")[0];
var dashImg = document.getElementsByClassName("dash")[0];
var playAgain = document.getElementsByClassName("button")[0];

var headerInstructions = document.getElementById("headerInstructions");

function UIGameoverAnimateIn()
{
    inputPage.style.display = "none";
    customizePage.style.display = "none";
    gameoverPage.style.display = "block";
    pages.style.display = "block";

    thank.style.opacity = 0;
    you.style.opacity = 0;
    dashImg.style.opacity = 0;
    dashImg.style.width = 0;
    playAgain.style.opacity = 0;

    TweenMax.to(thank, gameoverFadeTime, {delay:gameoverFadeTime, opacity:1});
    TweenMax.to(you, gameoverFadeTime, {delay:gameoverFadeTime*2, opacity:1});
    TweenMax.to(dashImg, gameoverFadeTime, {delay:gameoverFadeTime*3, opacity:1, width:400, ease:Back.easeOut});
    TweenMax.to(dashImg, gameoverFadeTime, {delay:gameoverFadeTime*4, opacity:1});
    TweenMax.to(playAgain, gameoverFadeTime, {delay:gameoverFadeTime*4, opacity:1});
}

function UIGameplayAnimateOut()
{
    TweenMax.to(gameoverForm, gameoverFadeTime, {delay:gameoverFadeTime, top:0});
    TweenMax.to(gameoverForm, gameoverFadeTime, {delay:gameoverFadeTime*2, opacity:0, onComplete: UIInputAnimateIn});
}