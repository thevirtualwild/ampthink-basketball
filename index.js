const express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;


// Routing
app.use(express.static(path.join(__dirname, 'public')));

app.get('/game', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/game.html'));
});


// Web Socket (Socket.io)
function onConnection(socket) {
  console.log('a user connected');






  socket.on('throw ball', function(data) {
    console.log('Full Data - ' + data);

    var exitX = data.exitY;
    var exitY = data.exitY;
    var xSpeed = data.xSpeed;
    var ySpeed = data.ySpeed;

    console.log('Data Saved');
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
  })
}




io.on('connection', onConnection);



server.listen(port, function(){
  console.log('listening on %d', port);
});
