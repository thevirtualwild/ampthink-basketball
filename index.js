const express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;


// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Web Socket (Socket.io)
function onConnection(socket) {
  console.log('a user connected');








  socket.on('disconnect', function() {
    console.log('user disconnected');
  })
}




io.on('connection', onConnection);



server.listen(port, function(){
  console.log('listening on %d', port);
});
