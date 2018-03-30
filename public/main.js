// Main Controller Code
var app = new PIXI.Application(window.innerWidth, window.innerHeight, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

// create a texture from an image path
var texture = PIXI.Texture.fromImage('basketball.png');
var backgroundTexture= PIXI.Texture.fromImage('basketball.png');

texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
var basketball = new PIXI.Sprite(texture);
var background = new PIXI.Sprite(backgroundTexture, app.screen.width, app.screen.height);
var dragging = false;
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

createBasketball(10,10);

background
    .on('pointerdown', onDragStart)
    .on('pointerup', onDragEnd)
    .on('pointerupoutside', onDragEnd)
    .on('pointermove', onDragMove);

function createBasketball(x, y) {
    app.stage.addChild(basketball);
    basketball.anchor.set(0.5);
    basketball.scale.set(0.2);
    console.log(app.screen.width);
    basketball.x = app.screen.width/2;
    basketball.y = app.screen.height/2;
}

app.ticker.add(function(delta) {

        for (var i = 0; i < ropeSize; i++) {
            var p = points[i];

            //Smooth the curve with cubic interpolation to prevent sharp edges.
            var ix = cubicInterpolation(historyX, i / ropeSize * historySize);
            var iy = cubicInterpolation(historyY, i / ropeSize * historySize);

            p.x = ix;
            p.y = iy;

            if (i == ropeSize - 1) {
                if(thrown== false) {
                    basketball.x = p.x;
                    basketball.y = p.y;
                }
            }
        }
if(historyX.length > 5) {
    historyX.pop();
    historyY.pop();
}
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

function onDragStart(event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch

    this.data = event.data;
    this.dragging = true;
    dragging = true;
    this.anchor.set(0.5);

    while(historyX.length > 0)
    {
        historyX.pop();
    }

    while(historyY.length > 0)
    {
        historyY.pop();
    }

    var newPosition = this.data.getLocalPosition(this.parent);

    for( var i = 0; i < historySize; i++)
    {
        historyX.push(newPosition.x);
        historyY.push(newPosition.y);
    }
}

function onDragEnd() {
    this.dragging = false;
    dragging = false;
    // set the interaction data to null

    //console.log(" 0 " + historyY[historyY.length - 1]);
    //console.log("current y" + " " + this.data.getLocalPosition(this.parent).y);

    //detect if it's a swipe up

    if(this.data.getLocalPosition(this.parent).y - historyY[historyY.length - 1] < -30)
    {
        throwBall(historyX[historyX.length - 1], historyY[historyY.length - 1], this.data.getLocalPosition(this.parent).x, this.data.getLocalPosition(this.parent).y);
    }

    this.data = null;
}

function onDragMove()
{
    if (this.dragging) {
        var newPosition = this.data.getLocalPosition(this.parent);


        historyX.pop();
        historyX.unshift(newPosition.x);
        historyY.pop();
        historyY.unshift(newPosition.y);
        //Update the points to correspond with history.

    }
}

function throwBall(x1, y1, x2, y2)
{
    thrown = true;
    //var TweenMax = gsap.TweenMax;
    //basketball.scale = 0;
    var finalTweenPosX;
    var vertDist;
    var vertDragDist;

    vertDragDist = y1- y2;

    vertDist = y1 + 100;
    finalTweenPosX = x2 + (x2 - x1) *vertDist/vertDragDist;

    console.log("vertDist " + vertDist);
    console.log("vertDragDist " + vertDragDist);
    console.log("finaltweenPosX " + finalTweenPosX);

    TweenMax.to(basketball, 0.5, {y:-100, x:finalTweenPosX, onComplete:shotAttempt});
    console.log("Swipe up");
}

function shotAttempt()
{
    /* data = {
          xval: basketball.x
        }
    */
    //socket.emit('shot attempt', data);

    resetBall();
}

function resetBall()
{
  thrown = false;
  basketball.x = app.screen.width/2;
  basketball.y = app.screen.height/2;
}
