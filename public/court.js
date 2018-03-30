// Main Controller Code
var app = new PIXI.Application(window.innerWidth, window.innerHeight, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

// create a texture from an image path
var basketballTexture = PIXI.Texture.fromImage('basketball.png');
var backgroundTexture= PIXI.Texture.fromImage('basketball.png');
var hoopTexture = PIXI.Texture.fromImage('hoop.png');

basketballTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
var basketball = new PIXI.Sprite(basketballTexture);
var background = new PIXI.Sprite(backgroundTexture, app.screen.width, app.screen.height);
var hoop = new PIXI.Sprite(hoopTexture);

var thrown = false;

var historyX = [];
var historyY = [];
//historySize determines how long the trail will be.
var historySize = 10;
//ropeSize determines how smooth the trail will be.
var ropeSize = 100;
var points = [];

//Create history array.
for( var i = 0; i < historySize; i++)
{
    historyX.push(0);
    historyY.push(0);
}

for(var i = 0; i < ropeSize; i++)
{
    points.push(new PIXI.Point(0,0));
}

background.interactive = true;
background.buttonMode = true;
background.x = app.screen.width/2;
background.y = app.screen.height/2;
background.width = app.screen.width;
background.height = app.screen.height;
background.alpha = 0;

app.stage.addChild(background);
background.anchor.set(0.5);


var basketY = 200;
var basketX = app.screen.width/2;

drawHoop(basketX,basketY)

function drawHoop(x, y) {
    app.stage.addChild(hoop);
    hoop.anchor.set(0.5); //set center as x,y coordinate
    // hoop.scale.set(0.2);
    hoop.x = x;
    hoop.y = y;
}

function drawBasketball(x, y) {
    app.stage.addChild(basketball);
    basketball.anchor.set(0.5);
    basketball.scale.set(0.2);
    basketball.x = x;
    basketball.y = y;
    console.log('initial xy - ' + basketball.x + ',' + basketball.y);
}

app.ticker.add(function(delta) {

});

function clipInput(k, arr)
{
    if (k < 0)
        k = 0;
    if (k > arr.length - 1)
        k = arr.length - 1;
    return arr[k];
}

function getTangent(k, factor, array)
{
    return factor * (clipInput(k + 1, array) - clipInput(k - 1,array)) / 2;
}

function cubicInterpolation(array, t, tangentFactor)
{
    if (tangentFactor == null) tangentFactor = 1;

    var k = Math.floor(t);
    var m = [getTangent(k, tangentFactor, array), getTangent(k + 1, tangentFactor, array)];
    var p = [clipInput(k,array), clipInput(k+1,array)];
    t -= k;
    var t2 = t * t;
    var t3 = t * t2;
    return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + ( -2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
}





function throwBall(x1, y1, xSpeed, ySpeed)
{
    var y2 = basketY;


    var originX;
    var originY;

    var ydistTraveling = y1 - y2;
    var duration = (ydistTraveling/ySpeed);

    var xdistTraveling = duration * xSpeed;
    console.log(xdistTraveling);
    var x2 = (x1 + xdistTraveling);
    console.log('X2' + x2);

    var tweenDuration = duration;

    thrown = true;

    console.log('Initial Basketbal X - ' + basketball.x);
    console.log('Initial Basketball Y - ' + basketball.y);
    console.log('Final Basketball X - ' + x2);
    console.log('Final Basketball Y - ' + y2);
    TweenMax.to(basketball, tweenDuration, {y:y2, x:x2, onComplete:shotAttempt, ease: Back.easeOut.config(4)});

}

function shotAttempt()
{
    console.log('Shot Thrown');
    /* data = {
          xval: basketball.x
        }
    */
    //socket.emit('shot attempt', data);

    // resetBall();
}

// socket.on('')

var myX1 = 800;
var myY1 = 400;
var myXspeed = 000;
var myYspeed = 200;


drawBasketball(myX1,myY1);
throwBall(myX1, myY1, myXspeed, myYspeed);
