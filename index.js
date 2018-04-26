const express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 4000;

var query;
// Routing
app.use(express.static(path.join(__dirname, 'public')));

app.get('/game', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/game.html'));
    query = req.query.room;
    console.log('webapp routing - ' + query);
});

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
      socket.usercolor = 'pink';
      socket.emit('change color', socket.usercolor);
    } else if (numUsers == 2) {
      socket.usercolor = 'mint';
      socket.emit('change color', socket.usercolor);
    } else {
      socket.usercolor = userdata.usercolor;
    }

    // fake for now
    // socket.roomname = 'GAME';

    console.log("|New User: " + socket.username + "\n - Chosen color: " + socket.usercolor);

    // socket.emit('login', {
    //   numUsers: numUsers,
    //   roomname: socket.roomname
    // });

    console.log(' - Joined Room: ' + socket.roomname);

    // echo globally (all clients) that a person has connected
    socket.broadcast.to(socket.roomname).emit('user joined', {
      username: socket.username,
      usercolor: socket.usercolor,
      numUsers: numUsers
    });
  });

  socket.on('join room', function(room) {
        socket.join(room);

        console.log('joining room - ' + room);
        socket.roomname = room;
        io.emit('join room');
    });

    socket.on('game over', function(room) {

        console.log('game over - ' + room);
        socket.roomname = room;
        io.emit('game over');
    });

    socket.on('game almost ready', function(room) {

        console.log('game almost ready - ' + room);
        io.emit('game almost ready');
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

    socket.emit('shot sent');

    io.emit('take shot', shotInfo);
  });

    socket.on('switch camera', function(data) {

        socket.emit('switch camera');

        io.emit('switch camera');
    });

    socket.on('load texture', function(data) {

        socket.emit('load texture');

        io.emit('load texture');
    });

  socket.on('disconnect', function() {
    console.log('user disconnected');
  })
}






io.on('connection', onConnection);

server.listen(port, function(){
  console.log('listening on %d', port);
});
