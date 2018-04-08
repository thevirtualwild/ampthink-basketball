// Main Controller Code
var socket = io();

var $window = $(window);
var $pages = $('.pages'); // Input for roomname
var $passcodeInput = $('.passcodeInput'); // Input for roomname

// create a texture from an image path
//var texture = PIXI.Texture.fromImage('basketball.png');
//var backgroundTexture= PIXI.Texture.fromImage('BasketballBackground.jpg');
//from here http://www.zgjm-org.com/data/out/6/IMG_112426.jpg

var shotInfo;

//texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
//var basketball;// = new PIXI.Sprite(texture);
//var background;// = new PIXI.Sprite(backgroundTexture, app.screen.width, app.screen.height);
var dragging = false;
var thrown = true;
var countdownStarted = true;

$passcodeInput.focus();

/*
background.interactive = true;
background.buttonMode = true;
background.x = app.screen.width/2;
background.y = app.screen.height/2;
background.width = app.screen.width;
background.height = app.screen.height;
//background.alpha = 0;

app.stage.addChild(background);
background.anchor.set(0.5);

console.log('creating basketball');
*/
createBasketball(0,0);

function createBasketball(x, y) {

}

$window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        // $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13)
    {
            joinRoom();
    }
});

function joinRoom()
{
    $pages.fadeOut();
    // Tell the server your new room to connect to
    //socket.emit('room', roomname);
    //socket.emit('add user', jsonstring);
}
/*
function onDragStart(event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    console.log("drag started");

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
    }
}

function throwBall(x1, y1, x2, y2)
{
    thrown = true;
    var finalTweenPosX;
    var totalSpeed = 500;
    var duration;//duration
    var ratioX;
    var ratioY;

    //We travel at a rate of 5 pixels per unit ALWAYS
    var absDistance = (x1-x2) * (x1 - x2) + (y1-y2) * (y1 - y2);

    var distance = Math.sqrt(absDistance);
    //First we need to find the proportion of that which is vertical
    ratioY = (y1 - y2)/ distance;
    ratioX = Math.abs(x1-x2)/distance;
    totalYDistance = y2 + 100;

    //Then we find the time it takes to complete that vertical tween
    duration = totalYDistance / (ratioY * totalSpeed) ;

    //Then we add the final x drag position to the distance traveled which is found by multiplying the x rate proportion times the duration times the speed to find out the final X position
    //Then we pass that all in.
    if(x2>x1)
    {
        finalTweenPosX = x2 + duration * ratioX * totalSpeed;
    }
    else
    {
        finalTweenPosX = x2 - duration * ratioX * totalSpeed;
        ratioX = -ratioX;
    }

    shotInfo = {
        exitX:finalTweenPosX,
        exitY:-100,
        xSpeed:ratioX*totalSpeed,
        ySpeed:ratioY*totalSpeed
    }

    TweenMax.to(basketball, duration, {y:-100, x:finalTweenPosX, onComplete:shotAttempt});

    console.log("throw ball");
}
*/

function shotAttempt()
{
    /* data = {
          xval: basketball.x
        }
    */
    //socket.emit('shot attempt', data);
    socket.emit("throw ball", shotInfo);

    resetBall();
}

function resetBall()
{
  //thrown = false;
  //basketball.x = -100;
  //basketball.y = app.screen.height/2;
  //TweenMax.to(basketball, 0.4, {x:app.screen.width/2, onComplete:canShoot});
  //basketball.y = app.screen.height/2;
}

function canShoot()
{
    thrown = false;
}

socket.on('shot sent', function() {
  // console.log('We got a message back!');
})
