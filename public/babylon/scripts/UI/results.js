var textFadeTimeResults = .5;

var canvas = document.getElementById("canvas");

var footer = document.querySelector("footer");
var footerLeft = document.getElementById("footerLeft");
var footerCenter = document.getElementById("footerCenter");
var playNow= document.getElementById("playNow");
var comboBadge= document.getElementById("comboBadge");
var inner = document.getElementById("inner");
var results = document.getElementById("results");
var topScore = document.getElementById("topScore");
var yourScore = document.getElementById("yourScore");

var topFirstName = topScore.getElementsByClassName("scoreContainer")[0].getElementsByClassName("playerName")[0].getElementsByClassName("firstName")[0];
var topLastName = topScore.getElementsByClassName("scoreContainer")[0].getElementsByClassName("playerName")[0].getElementsByClassName("lastName")[0];

var yourFirstName = yourScore.getElementsByClassName("scoreContainer")[0].getElementsByClassName("playerName")[0].getElementsByClassName("firstName")[0];
var yourLastName = yourScore.getElementsByClassName("scoreContainer")[0].getElementsByClassName("playerName")[0].getElementsByClassName("lastName")[0];

var gameplayRight = document.getElementById("footerCenter").getElementsByClassName("gameplayRight")[0];

var yourScoreText = yourScore.getElementsByClassName("scoreContainer")[0].getElementsByClassName("scoreNum")[0];
var topScoreText = topScore.getElementsByClassName("scoreContainer")[0].getElementsByClassName("scoreNum")[0];

var team1Name = document.getElementById("team1").getElementsByClassName("teamName")[0];
var team2Name = document.getElementById("team2").getElementsByClassName("teamName")[0];
var team3Name = document.getElementById("team3").getElementsByClassName("teamName")[0];

var team1Score = document.getElementById("team1").getElementsByClassName("scoreNum")[0];
var team2Score = document.getElementById("team2").getElementsByClassName("scoreNum")[0];
var team3Score = document.getElementById("team3").getElementsByClassName("scoreNum")[0];

var teamScores = document.getElementById("teamScores");

var team1 = document.getElementById("team1");
var team2 = document.getElementById("team2");
var team3 = document.getElementById("team3");

//UIResultsAnimateIn();
//UIResultsAnimateOut();

var winner = false;

var widthTweenDistance;
var heightTweenDistance;



yourFirstName.innerHTML = "JIMMY";
yourLastName.innerHTML = "DELANEY";



topFirstName.innerHTML = "BOB";
topLastName.innerHTML = "WINKLEBURG";

topScoreText.innerHTML = "45";
yourScoreText.innerHTML = "42";

var animating = false;

function UIResultsAnimateIn()
{
    animating = false;
    yourScore.style.opacity = 0;
    topScore.style.opacity = 0;
    playNow.style.opacity = 0;
    comboBadge.style.opacity = 0;

    //Get Score List
    team1Name.style.color = primaryTeam.colorHex;
    team2Name.style.color = secondaryTeam.colorHex;
    team3Name.style.color = tertiaryTeam.colorHex;

    teamScores.style.opacity = 0;
    team1.style.opacity = 0;
    team2.style.opacity = 0;
    team3.style.opacity = 0;

    widthTweenDistance = -3 *canvas.width;
    topScore.style.marginLeft = (widthTweenDistance + "px").toString();
    yourScore.style.marginRight = (widthTweenDistance + "px").toString();

    heightTweenDistance = 6 * canvas.height;

    team1.style.marginTop = (heightTweenDistance + "px").toString();
    team2.style.marginTop = (heightTweenDistance + "px").toString();
    team3.style.marginTop = (heightTweenDistance + "px").toString();

    footer.style.backgroundPositionY = "200px";
    footerLeft.style.top = "200px";
    footerCenter.style.top = "200px";

    results.style.display = "inline";

    inner.style.backgroundColor = "transparent";

    TweenMax.to(inner, textFadeTime, {backgroundColor: "rgba(0,0,0,0.8)"});

    if(winner)
    {

    }
    else
    {
        TweenMax.to(topScore, textFadeTimeResults, {delay: textFadeTimeResults, marginLeft: 0, ease:Back.easeOut});
        TweenMax.to(topScore, textFadeTimeResults*2, {delay: textFadeTimeResults, opacity: 1});
        TweenMax.to(yourScore, textFadeTimeResults, {delay: textFadeTimeResults*2, marginRight: 0, ease:Back.easeOut});
        TweenMax.to(yourScore, textFadeTimeResults*2, {delay: textFadeTimeResults*2, opacity: 1});

        TweenMax.to(teamScores, textFadeTimeResults, {delay: textFadeTimeResults*3, opacity: 1});

        TweenMax.to(team1, textFadeTimeResults, {delay: textFadeTimeResults*3.5, marginTop: 0, ease:Back.easeOut});
        TweenMax.to(team1, textFadeTimeResults*2, {delay: textFadeTimeResults*3.5, opacity: 1});

        TweenMax.to(team2, textFadeTimeResults, {delay: textFadeTime*3.7, marginTop: 0, ease:Back.easeOut});
        TweenMax.to(team2, textFadeTimeResults*2, {delay: textFadeTime*3.7, opacity: 1});

        TweenMax.to(team3, textFadeTimeResults, {delay: textFadeTimeResults*3.9, marginTop: 0, ease:Back.easeOut});
        TweenMax.to(team3, textFadeTimeResults*2, {delay: textFadeTimeResults*3.9, opacity: 1});
    }
}

function UIResultsAnimateOut()
{
    if(animating) return;

    TweenMax.to(topScore, textFadeTimeResults, {delay: textFadeTimeResults, marginLeft: widthTweenDistance, ease:Back.easeOut});
    TweenMax.to(topScore, textFadeTimeResults, {delay: textFadeTimeResults, opacity: 0});
    TweenMax.to(yourScore, textFadeTimeResults, {delay: textFadeTimeResults, marginRight: widthTweenDistance, ease:Back.easeOut});
    TweenMax.to(yourScore, textFadeTimeResults, {delay: textFadeTimeResults, opacity: 0});

    TweenMax.to(teamScores, textFadeTimeResults, {delay: textFadeTimeResults, opacity: 0});

    TweenMax.to(team1, textFadeTimeResults, {delay: textFadeTimeResults, marginTop: heightTweenDistance, ease:Back.easeOut});
    TweenMax.to(team1, textFadeTimeResults, {delay: textFadeTimeResults, opacity: 0});

    TweenMax.to(team2, textFadeTimeResults, {delay: textFadeTimeResults, marginTop: heightTweenDistance, ease:Back.easeOut});
    TweenMax.to(team2, textFadeTimeResults, {delay: textFadeTimeResults, opacity: 0});

    TweenMax.to(team3, textFadeTimeResults, {delay: textFadeTimeResults, marginTop: heightTweenDistance, ease:Back.easeOut});
    TweenMax.to(team3, textFadeTimeResults, {delay: textFadeTimeResults, opacity: 0});

    TweenMax.to(inner, textFadeTimeResults, {backgroundColor: "rgba(0,0,0,0.0)"});

    animating = true;
}

function UIResultsUpdateName(name)
{
    yourFirstName.innerHTML = name.substr(0, name.indexOf(' '));
    yourLastName.innerHTML = name.substr(name.indexOf(' ') + 1);
}

function UIResultsUpdateScore(playerScore)
{
    yourScoreText.innerHTML = playerScore.toString();
}

function UIResultsSetData(data) {
    topScore.innerHTML = data.highscorer.player.score;
    var name = data.highscorer.player.username;
    topFirstName.innerHTML = name.substr(0, name.indexOf(' '));
    topLastName.innerHTML = name.substr(name.indexOf(' ') + 1);


    console.log(data);
    console.log(data.teamscores);
    console.log(data.teamscores.length);
    console.log(data.teamscores[0]);//UNDEFINED WHY
    console.log(data.teamscores.recLog2eI9U5litsT);
    console.log(data.teamscores.recLog2eI9U5litsT.Name);//WHITE
    /*
        team1Score.innerHTML = data.teamscores.recmeh5AGMnROs1sE.CumulativeScore;
        team1Name.innerHTML = data.teamscores.recmeh5AGMnROs1sE.Name;

        team2Score.innerHTML = data.teamscores.recLog2eI9U5litsT.CumulativeScore;
        team2Name.innerHTML = data.teamscores.recLog2eI9U5litsT.Name;

        team3Score.innerHTML = data.teamscores.recwT4kbErHEqznQs.CumulativeScore;
        team3Name.innerHTML = data.teamscores.recwT4kbErHEqznQs.Name;
        */

    if (data.teamscores.index.[])
        if (data.teamscores[i].name.toUpperCase() == team1Name.innerHTML) {
            team1Score.innerHTML = data.teamscores[i].cumulateScore;
        }
    }
}