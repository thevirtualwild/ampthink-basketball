const express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 4000;
var Promise = require('promise');

var Airtable = require('airtable');
const airtable_apiKey = 'keyrxFD1nnDCHTmQP';
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: airtable_apiKey
});
var config_base = Airtable.base('appjnwB9vqNtd1ore');

var alldevices = {};
var allrooms = {};
var allzones = {};
var allcourts = {};
var allconfigs = {};

function getDataFromAirtable() {

  function getDevices() {
    config_base('Devices').select({}).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record) {
        ipaddress = record.get('IP Address');
        // console.log('Retrieved', record.get('IP Address'));

        location = record.get('Location in Zone');
        zone = record.get('Zone');
        court = record.get('Court');

        alldevices[ipaddress] = {
          id: record.id,
          ipaddress: ipaddress,
          location: location,
          zone: zone,
          court: court
        };
      });
      fetchNextPage();
    }, function done(err) {
      if (err) { console.error(err); return; }

      // console.dir(alldevices);
    });
  }
  function getRooms() {
    config_base('Rooms').select({}).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record) {
        roomname = record.get('Name');
        // console.log('Retrieved', roomname);

        zones = record.get('Zones');
        courts = record.get('Courts');

        allrooms[record.id] = {
          id: record.id,
          roomname: roomname,
          zones: zones,
          courts: courts
        };
      });
      fetchNextPage();
    }, function done(err) {
      if (err) { console.error(err); return; }

      // console.dir(allrooms);
    });
  }
  function getZones() {
    config_base('Zones').select({}).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record) {
        name = record.get('Name');
        // console.log('Retrieved', name);

        rooms = record.get('Rooms');
        courts = record.get('Courts');
        devices = record.get('Devices');
        stadium = record.get('Stadium');
        configuration = record.get('Configuration');

        allzones[record.id] = {
          id: record.id,
          name: name,
          rooms: rooms,
          courts: courts,
          devices: devices,
          stadium: stadium,
          configuration: configuration
        };
      });
      fetchNextPage();
    }, function done(err) {
      if (err) { console.error(err); return; }

      // console.dir(allzones);
    });
  }
  function getCourts() {
    config_base('Courts').select({}).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record) {
        courtname = record.get('Name');
        // console.log('Retrieved', courtname);

        zone = record.get('Zone');
        stadium = record.get('Stadium');
        order = record.get('Court Order');
        room = record.get('Room');
        devices = record.get('Devices');

        allcourts[record.id] = {
          id: record.id,
          name: courtname,
          zone: zone,
          stadium: stadium,
          order: order,
          room: room,
          devices: devices
        };
      });
      fetchNextPage();
    }, function done(err) {
      if (err) { console.error(err); return; }

      // console.dir(allcourts);
    });
  }
  function getConfigs() {
    config_base('Configurations').select({}).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record) {
        allconfigs[record.id] = record.fields;
      });
      fetchNextPage();
    }, function done(err) {
      if (err) { console.error(err); return; }

      // console.dir(allconfigs);
    });
  }

  getDevices();
  getRooms();
  getZones();
  getCourts();
  getConfigs();

}

getDataFromAirtable();

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
    console.log('feed routing bab - ' + query);
});

app.use(express.static(path.join(__dirname, 'public')), function(req, res) {
  if (req.query.roomId) {
    query = req.query.roomId;
    console.log('feed routing use - ' + query);
  }
});
// app.use(express.static(path.join(__dirname, 'babylon')));
//
app.get('/game', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/game.html'));
    query = req.query.room;
    console.log('webapp routing - ' + query);
});


app.set('view engine', 'ejs');

app.get('/about', function(req, res) {
  res.render('pages/about');
});


var numUsers = 0;
var currentHighScore = 0;


var courts = {};



// Web Socket (Socket.io)
function onConnection(socket) {

  var addedUser = false;
  console.log('a user connected');


  function findARoom(somecourt, somedevice) {
    zoneid = somedevice.zone;
    thiszone = allzones[zoneid];

    if (thiszone.rooms) {
      roomid = thiszone.rooms[0];
      assignCourtToRoom(somecourt, roomid);
    } else {
      somecourt.room = createRoom(somecourt);
      // console.log(somecourt);
    }
  }

  function findACourt(mydevice, myzone) {
    //if device is not a part of a court
    console.log('Please add device: ' + mydevice.name + ' to a court');
    console.dir(mydevice);

    //check zone of device for list of currently configured courts, and add to court based on location
    console.log('device in zone: ' + myzone.name);
    console.dir(myzone);

    zoneconfig = allconfigs[myzone.configuration];

    console.log('config data');
    console.dir(zoneconfig);

    courtnum = zoneconfig[mydevice.location];

    if (courtnum) {
      console.log('I should be in court #' + courtnum);
      var index = courtnum - 1;
      mycourt = myzone[index];
      if (mycourt) {
        console.log('try court - ' + mycourt);
      } else {
        console.log('no court yet');
        createCourt(mydevice,myzone);
      }
    } else {
      console.log('no zone config for that location');
    }
  }
  function unknownDevice(deviceIP) {
    //if device is not a part of alldevices
    console.log('Unknown device: ' + deviceIP + ' trying to set up a court');

    var newdevice = {
      location: 'UNKNOWN LOCATION',
      zone: 'recrPqr6a1f7Nxal8'
    };

    // add device to list of devices
    alldevices[deviceIP] = newdevice;
    var devicezone = allzones[newdevice.zone];
    myzone.devices.push(newdevice);
    //update record in allzones
    allzones[newdevice.zone] = myzone;

    // PUSH TO AIRTABLE HERE

    //use a random court
    findACourt(newdevice, devicezone);
  }

  function createCourt(somedevice,somezone) {
    var newcourtname = randomCode(5);
    var courtorder;
    if (somezone.courts) {
      courtorder = somezone.courts.length;
    } else {
      courtorder = 1;
    }

    //push new room with name ^
    config_base('Courts').create({
      "Name": newcourtname,
      "Court Order": courtorder,
      "Devices": [somedevice.id],
      "Zone": [somezone.id]
    }, function(err, record) {
        if (err) { console.error(err); return; }

        //Callback from API push
        newcourtid = record.getId();
        console.log('NewCourt - ' + newcourtid);


        // do something to update local storage
        newcourt = {
            id: newcourtid,
            name: newcourtname,
            order: courtorder,
            zone: somezone.id,
            devices: [somedevice.id]
        }
        allcourts[newcourtid] = newcourt;

        console.log('find a room court: ' + newcourt.name + ' device: ' + somedevice.ipaddress);
        findARoom(newcourt,somedevice);
    });
  }
  function createRoom(somecourt) {
    var newroomname = randomCode(7);

    //push new room with name ^
    config_base('Rooms').create({
      "Name": newroomname
    }, function(err, record) {
        if (err) { console.error(err); return; }

        //Callback from API push
        newroomid = record.getId();
        console.log('NewRoom - ' + newroomid);

        newroom = {
            name: newroomname
        }
        allrooms[newroomid] = newroom;

        assignCourtToRoom(somecourt, newroomid);
    });

  }

  function assignCourtToRoom(somecourt, someroom) {
    console.log('telling device in court: ' + somecourt.name + ' to join room: ' + someroom);
    data = {
      court: somecourt,
      room: someroom
    }

    console.log('room: ');
    console.dir(allrooms[someroom]);

    if (somecourt.room) {
      console.log('assigning court to room - ');
      console.dir(somecourt.room);
    } else {
      console.log('trying to update court info as - ' + someroom);
      config_base('Courts').update(somecourt.id, {
        "Room": [someroom]
      }, function(err, record) {
          if (err) { console.error(err); return; }
      });
    }

    //need to update court list
    socket.emit('join this room', data);
  }

  function randomCode(howLong) {
    var randomname = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (var i = 0; i < howLong; i++)
      randomname += possible.charAt(Math.floor(Math.random() * possible.length));

    return randomname;
  }


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
    console.log('court name - ' + courtdata.name);
    console.log('socket room - ' + socket.roomname);
    // console.log('Courts: ');
    // console.dir(courts);
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
    // console.log('Courts: ');
    // console.dir(courts);
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


  socket.on('get court', function(deviceIP) {
    // find out if the device knows what court it should be a part of

    // first check to see if device is in list of devices
    if (deviceIP in alldevices) {
      //if we know the device already, check its court and zone,
      mydevice = alldevices[deviceIP];
      mycourt = allcourts[mydevice.court];
      myzone = allzones[mydevice.zone];
      console.log('court: ');
      console.dir(mycourt);
      if (mycourt) {
        //if we know the court the device should be in, check if we know the room
        myroom = mycourt.room;
        if (myroom) {
          //if mycourt already knows what room it is supposed to be a part of
          assignCourtToRoom(mycourt,myroom);
        } else { //find a room
          console.log('court: ' + mycourt.name + ' and device: ' + mydevice.ipaddress + ' need a room');
          findARoom(mycourt,mydevice);
        }
      } else { //find a court
        console.log('No court found for device: ' + mydevice.ipaddress + ' in zone: ' + myzone.name);
        findACourt(mydevice, myzone);
      }
    } else { //unknown device
      console.log('device: ' + deviceIP + ' not in alldevices list');
      unknownDevice(deviceIP);
    }
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
    if (query) {
      console.log('there is a query - ' + query);
      socket.emit('query', query);
    } else {
      console.log('no query found');
      socket.emit('use random query');
    }
  });

}






io.on('connection', onConnection);

server.listen(port, function(){
  console.log('listening on %d', port);
});
