// Main Controller Code
var app = new PIXI.Application(window.innerWidth, window.innerHeight, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);
var socket = io();

var $window = $(window);
var $pages = $('.pages'); // Input for roomname
var $passcodeInput = $('.passcodeInput'); // Input for roomname
var $passcodePage = $('.passcode.page') // The roomchange page

// create a texture from an image path
var texture = PIXI.Texture.fromImage('basketball.png');
var backgroundTexture= PIXI.Texture.fromImage('BasketballBackground.jpg');
//from here http://www.zgjm-org.com/data/out/6/IMG_112426.jpg

var shotInfo;

texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
var basketball;// = new PIXI.Sprite(texture);
var background;// = new PIXI.Sprite(backgroundTexture, app.screen.width, app.screen.height);
var dragging = false;
var thrown = false;

var historyX = [];
var historyY = [];
//historySize determines how long the trail will be.
var historySize = 10;
//Create history array.
for( var i = 0; i < historySize; i++)
{
    historyX.push(0);
    historyY.push(0);
}

window.WebFontConfig = {
    google: {
        families: ['Snippet', 'Arvo:700italic', 'Podkova:700']
    },

    active: function() {
        // do something
        initText();
    }
};

// include the web-font loader script
//jshint ignore:start
(function() {
    var wf = document.createElement('script');
    wf.src = ('https:' === document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();
// jshint ignore:end

$passcodeInput.focus();

basketball = new PIXI.Sprite(texture);
background = new PIXI.Sprite(backgroundTexture, app.screen.width, app.screen.height);

background.interactive = true;
background.buttonMode = true;
background.x = app.screen.width/2;
background.y = app.screen.height/2;
background.width = app.screen.width;
background.height = app.screen.height;
//background.alpha = 0;

app.stage.addChild(background);
background.anchor.set(0.5);

background
    .on('pointerdown', onDragStart)
    .on('pointerup', onDragEnd)
    .on('pointerupoutside', onDragEnd)
    .on('pointermove', onDragMove);

console.log('creating basketball');
createBasketball(100,150);

function createBasketball(x, y) {
    app.stage.addChild(basketball);
    basketball.anchor.set(0.5);
    basketball.scale.set(0.3);
    console.log(app.screen.width);
    basketball.x = app.screen.width/2;
    basketball.y = app.screen.height/2;
    console.log('initial xy - ' + basketball.x + ',' + basketball.y);
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

app.ticker.add(function(delta) {
    if (thrown == false) {
        if (dragging)
            TweenMax.to(basketball, 0.1, {y: historyY[0], x: historyX[0]});
    }
});

function joinRoom()
{
    $pages.fadeOut();

    initText();
    // Tell the server your new room to connect to
    //socket.emit('room', roomname);
    //socket.emit('add user', jsonstring);
}

function initText()
{
        // create a text object with a nice stroke
        var textInstructions = new PIXI.Text('Score as many points as you can!', {
            fontWeight: 'bold',
            fontSize: 60,
            fontFamily: 'Arial',
            fill: '#000000',
            align: 'center',
            stroke: '#FFFFFF',
            strokeThickness: 6
        });

        var textSwipe = new PIXI.Text('Swipe up to shoot', {
            fontWeight: 'bold',
            fontSize: 60,
            fontFamily: 'Arial',
            fill: '#000000',
            align: 'center',
            stroke: '#FFFFFF',
            strokeThickness: 6
        });

        // setting the anchor point to 0.5 will center align the text... great for spinning!
        textSwipe.anchor.set(0.5);
         textSwipe.x = app.screen.width / 2;
         textSwipe.y = app.screen.height - 60;

        // setting the anchor point to 0.5 will center align the text... great for spinning!
        textInstructions.anchor.set(0.5);
        textInstructions.x = app.screen.width / 2;
        textInstructions.y = app.screen.height - 130;

        // create a text object that will be updated...
        var countingText = new PIXI.Text('COUNT 4EVAR: 0', {
            fontWeight: 'bold',
            fontStyle: 'italic',
            fontSize: 60,
            fontFamily: 'Arvo',
            fill: '#3e1707',
            align: 'center',
            stroke: '#a4410e',
            strokeThickness: 7
        });

        countingText.x = app.screen.width / 2;
        countingText.y = 500;
        countingText.anchor.x = 0.5;

        app.stage.addChild(textInstructions, textSwipe);
/*
        var count = 0;

        app.ticker.add(function() {

            count += 0.05;
            // update the text with a new string
            countingText.text = 'COUNT 4EVAR: ' + Math.floor(count);

        });
        */

}

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
  thrown = false;
  basketball.x = app.screen.width/2;
  basketball.y = app.screen.height/2;
}


socket.on('shot sent', function() {
  // console.log('We got a message back!');
})
