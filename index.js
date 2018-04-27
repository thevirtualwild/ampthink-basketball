const express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 4000;

var query;
// Routing

app.get('/rebabylon', function(req, res) {
  var randquery = randomCode(7);
  console.log('redirecting');
  res.redirect('/babylon/?roomId=' + randquery);
  query = randquery;
  console.log('query - ' + query);
});

app.get('/babylon', function(req, res) {
    console.log('babylon loaded');
    res.sendFile(path.join(__dirname + '/public/babylon/index.html'));
    query = req.query.roomId;
    console.log('feed routing - ' + query);
});

app.use(express.static(path.join(__dirname, 'public')), function(req, res) {
  query = req.query.roomId;
  console.log('feed routing - ' + query);
});
// app.use(express.static(path.join(__dirname, 'babylon')));
//
app.get('/game', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/game.html'));
    query = req.query.room;
    console.log('webapp routing - ' + query);
});




function randomCode(howLong) {
  var randomname = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < howLong; i++)
    randomname += possible.charAt(Math.floor(Math.random() * possible.length));

  return randomname;
}

app.set('view engine', 'ejs');

app.get('/about', function(req, res) {
  res.render('pages/about');
});

// app.get('/regame', function(req, res) {
//   var randlist = ['pink','mint','orange'];
//   var randquery = randlist[ Math.floor(Math.random()*randlist.length) ];
//   res.redirect('/game?room=' + randquery);
//   query = req.query.room;
//   console.log('query - ' + query);
// });
/*
app.get('/babylon', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/babylon/game.html'));
});
*/


var numUsers = 0;
var currentHighScore = 0;


var courts = {};

// Web Socket (Socket.io)
function onConnection(socket) {

  var addedUser = false;
  console.log('a user connected');

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function(data) {
    // dont add the user twice, just return if this is called again.
    if (addedUser) return;

    console.log('add user called - ' + data);
    var userdata = '';

    // if not valid json object, parse
    try {
        userdata = JSON.parse(data);
        console.log('userdata' - userdata);
    } catch (e) {
        userdata = data;
    }

    // we store the username in the socket session for this client
    socket.username = userdata.username;
    ++numUsers;
    addedUser = true;

    if (numUsers == 1 ) {
      socket.team = 'red';
      socket.emit('change team', socket.team);
    } else if (numUsers == 2) {
      socket.team = 'blue';
      socket.emit('change team', socket.team);
    } else {
      socket.team = userdata.team;
    }

    // fake for now
    // socket.roomname = 'GAME';

    console.log("|New User: " + socket.username + "\n - Chosen team: " + socket.team);

    // socket.emit('login', {
    //   numUsers: numUsers,
    //   roomname: socket.roomname
    // });

    console.log(' - Joined Room: ' + socket.roomname);

    // echo globally (all clients) that a person has connected
    socket.broadcast.to(socket.roomname).emit('user joined', {
      username: socket.username,
      team: socket.team,
      numUsers: numUsers
    });
  });

  socket.on('add court', function(courtdata) {
    console.log('adding court');
    // var newCourt = {
    //   name: data.courtname,
    //   room: socket.roomname
    // };
    courts[courtdata.name] = socket.roomname;
    console.log('Courts: ');
    console.dir(courts);
  });

  socket.on('update court', function(courtdata) {
    console.log('updating court');
    // var newCourt = {
    //   name: data.courtname,
    //   room: socket.roomname
    // };
    var newroom = courtdata.room;
    courts[courtdata.name] = newroom;
    socket.join(newroom);
    console.log('Courts: ');
    console.dir(courts);
  });

  socket.on('join room', function(userdata) {
    room = userdata.room;
    socket.join(room);

    socket.roomname = room;
    console.log('index.js: joining room - ' + socket.roomname);
    socket.broadcast.to(socket.roomname).emit('joined room', userdata);
  });

  socket.on('join court', function(userdata) {
    socket.username = userdata.username;
    socket.team = userdata.team;
    socket.court = userdata.court;

    socket.roomname = courts[userdata.court];
    console.log('joining room? - ' + socket.roomname);
    socket.join(socket.roomname);
    socket.broadcast.to(socket.roomname).emit('player joined court', userdata);
  });


  socket.on('game over', function(playerdata) {

    // Submit Player Data To Database
    // Check Database for High Score (of room)

    var highscorer = {
      name: 'wouldnt you like to know',
      team: 'something',
      score: 99
    }

    socket.broadcast.to(socket.roomname).emit('show results', highscorer);

  });

  socket.on('game almost ready', function(courtName) {

      console.log('game almost ready - ' + courtName);
      console.log('court room - ' + courts[courtName]);
      socket.roomname = courts[courtName];
      console.log('socket.room - ' + socket.roomname);
      socket.broadcast.to(socket.roomname).emit('game almost ready', courtName);
  });

  socket.on('query request', function() {
    console.log('query request received');
    if (query) {
      console.log('there is a query - ' + query);

      socket.emit('query', query);
    } else {
      console.log('no query found');

      socket.emit('use random room');
    }
  });

  socket.on('room reset', function() {
    socket.broadcast.to(socket.roomname).emit('reset game');
  });

  socket.on('throw ball', function(data) {
    // console.log('Full Data - ' + data);

    var exitX = data.exitX;
    var exitY = data.exitY;
    var xSpeed = data.xSpeed;
    var ySpeed = data.ySpeed;
    var deviceWidth = data.deviceWidth;
    var deviceHeight = data.deviceHeight;
    // console.log('Data Saved');

    var shotInfo = {
      username: socket.username,
      ballcolor: socket.usercolor,
      fromX: exitX,
      fromY: exitY,
      xSpeed: xSpeed,
      ySpeed: ySpeed,
        deviceWidth: deviceWidth,
        deviceHeight: deviceHeight
    }

    console.log('take shot');

    socket.broadcast.to(socket.roomname).emit('take shot', shotInfo);

  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
  })



  socket.on('query request', function() {
    console.log('query request received');
    console.log(query);
    if (query) {
      console.log('there is a query - ' + query);

      socket.emit('query', query);
    } else {
      console.log('no query found');

      socket.emit('use random room');
    }
  });
}






io.on('connection', onConnection);

server.listen(port, function(){
  console.log('listening on %d', port);
});
