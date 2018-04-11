$(function() {
  // Main Controller Code
  var app = new PIXI.Application(window.innerWidth, window.innerHeight, {backgroundColor : 0x1099bb});
  document.body.appendChild(app.view);
  var socket = io();

  var $window = $(window);
  var $pages = $('.pages'); // Input for roomname
  var $passcodeInput = $('.passcodeInput'); // Input for roomname
  var $passcodePage = $('.passcode.page') // The roomchange page

  // create a texture from an image path
  var texture = PIXI.Texture.fromImage('ball-orange.png');
  var backgroundTexture= PIXI.Texture.fromImage('court.jpg');
  //from here http://www.zgjm-org.com/data/out/6/IMG_112426.jpg

  var shotInfo;

  texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  var basketball;// = new PIXI.Sprite(texture);
  var background;// = new PIXI.Sprite(backgroundTexture, app.screen.width, app.screen.height);
  var dragging = false;
  var thrown = true;
  var countdownStarted = true;
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

  console.log('creating basketball');
  createBasketball(100,150);

  function createBasketball(x, y) {
    app.stage.addChild(basketball);
    basketball.anchor.set(0.5);
    basketball.scale.set(0.3);
    console.log(app.screen.width);
    basketball.x = -100;
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

    if (event.which === 65) {
      // shotInfo = {
      //     exitX:0.5, //middle of screen
      //     exitY:-100,
      //     xSpeed:ratioX*totalSpeed/app.screen.width,
      //     ySpeed:ratioY*totalSpeed/app.screen.height,
      //     deviceWidth:app.screen.width,
      //     deviceHeight:app.screen.height
      // }

      shotInfo = {
        exitX: 350/app.screen.width,
        exitY: -100,
        xSpeed: 0/app.screen.width,
        ySpeed: 325/app.screen.height,
        deviceWidth: app.screen.width,
        deviceWidth: app.screen.height
      }

      socket.emit("throw ball", shotInfo);

      resetBall();
    }
    if (event.which === 66) {
      // shotInfo = {
      //     exitX:0.5, //middle of screen
      //     exitY:-100,
      //     xSpeed:ratioX*totalSpeed/app.screen.width,
      //     ySpeed:ratioY*totalSpeed/app.screen.height,
      //     deviceWidth:app.screen.width,
      //     deviceHeight:app.screen.height
      // }

      shotInfo = {
        exitX: 0/app.screen.width,
        exitY: -100,
        xSpeed: 410/app.screen.width,
        ySpeed: 326/app.screen.height,
        deviceWidth: app.screen.width,
        deviceWidth: app.screen.height
      }

      socket.emit("throw ball", shotInfo);

      resetBall();
    }
    if (event.which === 67) {
      // shotInfo = {
      //     exitX:0.5, //middle of screen
      //     exitY:-100,
      //     xSpeed:ratioX*totalSpeed/app.screen.width,
      //     ySpeed:ratioY*totalSpeed/app.screen.height,
      //     deviceWidth:app.screen.width,
      //     deviceHeight:app.screen.height
      // }

      shotInfo = {
        exitX: 468/app.screen.width,
        exitY: -100,
        xSpeed: -320/app.screen.width,
        ySpeed: 327/app.screen.height,
        deviceWidth: app.screen.width,
        deviceWidth: app.screen.height
      }

      socket.emit("throw ball", shotInfo);

      resetBall();
    }
    if (event.which === 68) {
      // shotInfo = {
      //     exitX:0.5, //middle of screen
      //     exitY:-100,
      //     xSpeed:ratioX*totalSpeed/app.screen.width,
      //     ySpeed:ratioY*totalSpeed/app.screen.height,
      //     deviceWidth:app.screen.width,
      //     deviceHeight:app.screen.height
      // }

      shotInfo = {
        exitX: 144/app.screen.width,
        exitY: -100,
        xSpeed: 300/app.screen.width,
        ySpeed: 327/app.screen.height,
        deviceWidth: app.screen.width,
        deviceWidth: app.screen.height
      }

      socket.emit("throw ball", shotInfo);

      resetBall();
    }

  });

  app.ticker.add(function(delta) {
    if (thrown == false) {
      if (dragging)
      TweenMax.to(basketball, 0.1, {y: historyY[0], x: historyX[0]});
    }
    else {
      basketball.rotation += 0.1 * delta;
    }
  });

  function joinRoom()
  {
    var roomtojoin;

    roomtojoin = cleanInput($passcodeInput.val().trim());

    // console.log('room to join - ',roomname);


    if (roomtojoin) {

      roomtojoin = roomtojoin.toUpperCase();

    } else {
      roomtojoin = 'GAME';
    }
    // fade out input page
    $pages.fadeOut();

    // make background interactive so you can drag and throw the ball (listeners)
    background
    .on('pointerdown', onDragStart)
    .on('pointerup', onDragEnd)
    .on('pointerupoutside', onDragEnd)
    .on('pointermove', onDragMove);

    // draw the text on screen (countdown and instructions)
    initText();

    name = 'boop';
    color = 'blue';

    userdata = {
      'username': name,
      'usercolor': color,
      'userroom': roomtojoin
    };

    console.log('Room name - ' + roomtojoin);

    // Tell the server your new room to connect to
    socket.emit('join room', roomtojoin);
    socket.emit('add user', userdata);
  }

  function initText()
  {
    countdownStarted = true;
    // create a text object with a nice stroke
    var textInstructions = new PIXI.Text('Score as many points as you can!', {
      fontWeight: 'bold',
      fontSize: 60,
      fontFamily: 'Arial',
      fill: '#FFFFFF',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    });

    var textSwipe = new PIXI.Text('Swipe up to shoot', {
      fontWeight: 'bold',
      fontSize: 60,
      fontFamily: 'Arial',
      fill: '#FFFFFF',
      align: 'center',
      stroke: '#000000',
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
    var countingText = new PIXI.Text('3', {
      fontWeight: 'bold',
      fontSize: 200,
      fontFamily: 'Arial',
      fill: '#FFFFFF',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 7
    });

    countingText.x = app.screen.width / 2;
    countingText.y = 100;
    countingText.anchor.x = 0.5;

    app.stage.addChild(textInstructions, textSwipe, countingText);
    var count = 4;

    app.ticker.add(function() {

      if(countdownStarted)
      {
        count -= app.ticker.elapsedMS / 1000;
        // update the text with a new string
        countingText.text = Math.floor(count);
        countingText.anchor.set(0.5);
        if(count <= 0)
        {
          TweenMax.to(countingText, 0.2, {width: 0, height: 0});
          countingText.text = "0";
          countdownStarted = false;
          resetBall();
          startShooting();
        }
      }
    });


  }

  function onDragStart(event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    console.log("drag started");
    if(thrown == false) {
      this.data = event.data;
      this.dragging = true;
      dragging = true;
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
      exitX:finalTweenPosX/app.screen.width,
      exitY:-100,
      xSpeed:ratioX*totalSpeed/app.screen.width,
      ySpeed:ratioY*totalSpeed/app.screen.height,
      deviceWidth:app.screen.width,
      deviceHeight:app.screen.height
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
    //thrown = false;
    basketball.x = -100;
    basketball.y = app.screen.height/2;
    TweenMax.to(basketball, 0.4, {x:app.screen.width/2, onComplete:canShoot});
    //basketball.y = app.screen.height/2;
  }

  function canShoot()
  {
    thrown = false;
  }

  function startShooting() {
    socket.emit('shooting started');
  }



  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).html();
  }

  socket.on('shooting finished', function(score) {
    console.log('Stop SHOOTING!!!! your score combined was - ' + score);
  });

  // socket.on('change color', function(data) {
  //   var texturenew = 'ball-orange.png';
  //   if (data == 'pink') {
  //     texturenew = 'ball-pink.png';
  //   } else if (data = 'mint') {
  //     texturenew = 'ball-mint.png';
  //   } else {
  //     console.log('no need to change color');
  //   }
  //   basketball.setTexture(texturenew);
  // });

  socket.on('user joined', function(data) {
    console.log('User Joined');
    console.dir(data);
  });

  socket.on('shot sent', function() {
    // console.log('We got a message back!');
  });

});
