var socket = io();
// console.log('Socket - ' + socket);

// Main Controller Code
var app = new PIXI.Application(window.innerWidth, window.innerHeight, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

// create a texture from an image path
var basketballTexture = PIXI.Texture.fromImage('basketball.png');
var backgroundTexture= PIXI.Texture.fromImage('black-backdrop.jpg');
var hoopTexture = PIXI.Texture.fromImage('hoop.png');

basketballTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
var basketball = new PIXI.Sprite(basketballTexture);
var background = new PIXI.Sprite(backgroundTexture, app.screen.width, app.screen.height);
var hoop = new PIXI.Sprite(hoopTexture, 135, 96);
var rimleft = new PIXI.Sprite(basketballTexture);
var rimright = new PIXI.Sprite(basketballTexture);

var b = new Bump(PIXI);

var thrown = false;



var myX1;
var myY1;
var myXspeed;
var myYspeed;

var nottouching = true;

var ballthrown = false;
var ballpasthoop = false;
var scorechecked = false;

var hoopBounds;
var ballBounds;

var throwAnimation;


var floor = app.screen.height;
console.log('floor - ' + floor);


background.interactive = true;
background.buttonMode = true;
background.x = app.screen.width/2;
background.y = app.screen.height/2;
background.width = app.screen.width;
background.height = app.screen.height;

app.stage.addChild(background);
background.anchor.set(0.5);


var basketY = 200;
var basketX = app.screen.width/2;

drawHoop(basketX,basketY)

function drawHoop(x, y) {
    app.stage.addChild(hoop);
    hoop.anchor.set(0.5, 0); //set center as x,y coordinate
    // hoop.scale.set(0.2);
    hoop.x = x;
    hoop.y = y;

    hoop.width = 120;

    hoopBounds = hoop.getBounds();

    app.stage.addChild(rimleft,rimright);

    rimleft.circular = true;
    rimright.circular = true;
    basketball.circular = true;

    var rimwidth = 20;

    rimleft.width = rimwidth;
    rimleft.height = rimwidth;
    rimright.width = rimwidth;
    rimright.height = rimwidth;

    rimleft.x = hoopBounds.left;
    rimleft.y = hoop.y;
    rimright.anchor.set(.5);
    rimleft.anchor.set(.5);
    rimright.x = hoopBounds.right;
    rimright.y = hoop.y;

    console.log('hbounds');
    console.dir(hoopBounds);

    socket.emit('query request');
}

function drawBasketball(x, y) {
    app.stage.addChild(basketball);
    basketball.anchor.set(0.5);
    basketball.scale.set(0.2);
    basketball.x = x;
    basketball.y = y;
    // console.log('initial xy - ' + basketball.x + ',' + basketball.y);

    ballBounds = basketball.getBounds();
    console.log('basketball - ' + basketball.y);
    console.dir(ballBounds);
}

function move(object,dx,dy) {
  object.x += dx;
  object.y += dy;
  // console.log('moved - ' + dx + ',' + dy);
}

var xv = 0;
var yv = 0;
var fac = .8;
var friction = .6;
var gravity = 0.39;

var score = 0;


app.ticker.add(function(delta) {

  // if (ballthrown) {
    yv += gravity;
  // }

  // console.log('basketballx,y - ' + basketball.x + ',' + basketball.y);

  move(basketball, xv, yv);

  if ( (basketball.y <= (basketY - 40)) && (ballthrown == true) ) {
    ballpasthoop = true;
    // collision detection on
  }

  if ( (ballpasthoop == true) ) { //}&& (scorechecked = false) && (basketball.y > basketY) ) {
    //is collision on?

    checkCollision(basketball, rimleft);
    checkCollision(basketball, rimright);


    if (b.circleCollision(basketball, rimleft, true, true)) {
      if (basketball.x > (rimleft.x + rimleft.width/2)) {
        xv += -(xv*8);
      } else {
        xv += (xv*8);
      }
      yv = -(yv)*fac;
    }
    if (b.circleCollision(basketball, rimright, true, true)) {
      if (basketball.x < (rimright.x - rimright.width/2)) {
        xv += -(xv*8);
      } else {
        xv += (xv*8);
      }
      yv = -(yv)*fac;
    }

    if (basketball.y >= basketY && scorechecked == false) {
      checkScore();
    }

    // if (b.hitTestCircle(rimleft, basketball) || b.hitTestCircle(rimright, basketball)) {
    //   console.log('hit left');
    //
    //   xv = basketball.x - rimleft.x;
    //
    //
    // }
    // if (b.hitTestCircle(rimright, basketball)) {
    //   console.log('hit right');
    // // }
    // scorechecked = true;
    // // console.log('ball below');
    // checkScore();
  }

  if ( (basketball.getBounds().bottom >= floor) && (yv > 0)) {
    console.log('basketball outofbounds');
    yv = -(yv)*fac;
    basketball.y = floor - basketball.radius;
    xv = (xv*friction);
  }
  if ( (basketball.getBounds().left <= 0)) {
    basketball.x = 0 + basketball.radius;
    xv = -(xv);
  } else if (basketball.getBounds().right >= app.screen.width) {
    basketball.x = app.screen.width - basketball.radius;
    xv = -(xv);
  }
});


function checkCollision(firstBall, secondBall) {
  if (b.hitTestCircle(firstBall, secondBall)) {
    console.log('hittest');
    touching(firstBall,secondBall);
    // nottouching = false;
  } else {
    notouching = true;
  }
}
function touching(firstBall,secondBall) {
  console.log('touching');
  if (b.circleCollision(firstBall, secondBall, false ) && (nottouching)) {
    console.log('first touch');
    collisionPointX =
     ((firstBall.x * secondBall.radius) + (secondBall.x * firstBall.radius))
     / (firstBall.radius + secondBall.radius);

    collisionPointY =
     ((firstBall.y * secondBall.radius) + (secondBall.y * firstBall.radius))
     / (firstBall.radius + secondBall.radius);

     // var xvang =

     console.log('Collision: ' + collisionPointX + ',' + collisionPointY);

     var newColX = collisionPointX - secondBall.x;
     var newColY = collisionPointY - secondBall.y;

     console.log('NewCol: ' + newColX + ',' + newColY);

     var dx = xv;
     var dy = yv;

     var ang = Math.atan(newColY / newColX );
     var vector1 = Math.sqrt( (dx*dx) + (dy*dy) );

     var newxv = Math.abs(vector1) * Math.cos(ang + 90);
     var newyv = Math.abs(vector1) * Math.sin(90 + ang);

     console.log('newxv, newyv= ' + newxv + ',' + newyv);

     var newyv = (-1)*(Math.abs(newyv));

    // var pastxv = xv;
    // var pastyv = yv;
    //
    // var disty = firstBall.y - secondBall.y;
    // var distx = firstBall.x - secondBall.x;

    xv = newxv;
    yv = newyv;

     if (collisionPointX > secondBall.x) {
       //always positive
       xv = Math.abs(xv);
     } else {
       //always negative
       xv = Math.abs(xv) * (-1);
     }


     // xv = xv*(disty/distx);
     // yv = -(yv*(distx/disty));
     // yv = -(yv);

  } else {
    nottouching = true;
  }
}

function checkScore() {
  ballthrown = false;
  scorechecked = true;

  if ((basketball.x > hoopBounds.left) && (basketball.x < hoopBounds.right)) {
    console.log('YOU SCOReD! - ' + score);

    updateScore();
    socket.emit('scored');
  } else {
    console.log('Nope!');
  }
}

function updateScore() {
  score += 1;
}


function throwBall(x1, y1, xSpeed, ySpeed)
{

  ballthrown = true;
  ballpasthoop = false;
  scorechecked = false;
  nottouching = true;

  console.log('x, y, xspd, yspd = ' + x1 +','+ y1 +',' + xSpeed + ',' + ySpeed);


  basketball.x = x1;
  basketball.y = 600;


  xv = xSpeed/100;
  yv = -(20);





    // var y2 = basketY - 62.5;
    //
    //
    //
    //
    // console.log('ball y1 -' + basketball.y);
    // console.log(hoop.y);
    // console.log('ball');
    // console.dir(basketball);
    //
    // var originX;
    // var originY;
    //
    // var ydistTraveling = y1 - y2;
    // var duration = (ydistTraveling/ySpeed);
    //
    // var xdistTraveling = duration * xSpeed;
    // // console.log(xdistTraveling);
    // var x2 = (x1 + xdistTraveling);
    // // console.log('X2' + x2);
    //
    // var tweenDuration = duration;
    //
    // thrown = true;
    //
    // console.log('Initial Basketbal X - ' + basketball.x);
    // console.log('Initial Basketball Y - ' + basketball.y);
    // console.log('Final Basketball X - ' + x2);
    // console.log('Final Basketball Y - ' + y2);




    // throwAnimation = TweenMax.to(basketball, tweenDuration, {y:y2, x:x2, onComplete:shotAttempt, ease: Back.easeOut.config(4)});

}

function shotAttempt()
{
    // console.log('Shot Thrown');
    /* data = {
          xval: basketball.x
        }
    */
    //socket.emit('shot attempt', data);

    // resetBall();
}

socket.on('take shot', function(shotInfo) {
  myX1 = shotInfo.fromX;
  myY1 = 600;
  myXspeed = shotInfo.xSpeed;
  myYspeed = shotInfo.ySpeed;
  shotDeviceWidth = shotInfo.deviceWidth;
  shotDeviceHeight = shotInfo.deviceHeight;
  // console.log('shot X1- ' + myX1);
  // console.log('shot Y1- ' + myY1);
  // console.log('shot xSpeed- ' + myXspeed);
  // console.log('shot ySpeed- ' + myYspeed);

  var centerx = app.screen.width/2;
  var shooterleftbounds = centerx - shotDeviceWidth/2;
  var shooterrightbounds = centerx + shotDeviceWidth/2;

  console.log('exitX: ' + myX1);
  console.log('deviceWidth: ' + shotDeviceWidth);
  console.log('leftbounds: ' + shooterleftbounds);
  myX1 = (myX1 * shotDeviceWidth) + shooterleftbounds;
  console.log('newx1: ' + myX1);
  myXspeed = myXspeed * shotDeviceWidth;
  myYspeed = myYspeed * app.screen.height;

  drawBasketball(myX1,myY1);
  throwBall(myX1, myY1, myXspeed, myYspeed);
});

socket.on('query', function(query) {
  socket.emit('join room', query);
});
