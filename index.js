const express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 4000;

// Routing
app.use(express.static(path.join(__dirname, 'public')));

app.get('/game', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/game.html'));
});

/*
app.get('/babylon', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/babylon/game.html'));
});
*/

// Web Socket (Socket.io)
function onConnection(socket) {
  console.log('a user connected');


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

  socket.on('disconnect', function() {
    console.log('user disconnected');
  })
}




io.on('connection', onConnection);



server.listen(port, function(){
  console.log('listening on %d', port);
});
