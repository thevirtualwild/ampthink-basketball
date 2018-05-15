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
var score_base = Airtable.base('apprHXHRMQgbi5WBV');

var alldevices = {};
var allrooms = {};
var allzones = {};
var allcourts = {};
var allconfigs = {};
var courtnames = {};
var roomnames = {};

var connectedcourts = {};

function getDataFromAirtable() {
  console.log('gettingDataFromAirtable');

  function getDevices() {
    config_base('Devices').select({}).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record) {
        ipaddress = record.get('IP Address');
        // // // // console.log('Retrieved', record.get('IP Address'));

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

      // // // console.dir(alldevices);
    });
  }
  function getRooms() {
    config_base('Rooms').select({}).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record) {
        name = record.get('Name');
        // // // // console.log('Retrieved', roomname);

        zones = record.get('Zones');
        courts = record.get('Courts');

        recorddata = {
          id: record.id,
          name: name,
          zones: zones,
          courts: courts
        };
        allrooms[record.id] = recorddata;
        roomnames[name] = recorddata;
      });
      fetchNextPage();
    }, function done(err) {
      if (err) { console.error(err); return; }

      // // // console.dir(allrooms);
    });
  }
  function getZones() {
    config_base('Zones').select({}).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record) {
        name = record.get('Name');
        // // // // console.log('Retrieved', name);

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

      // // // console.dir(allzones);
    });
  }
  function getCourts() {
    config_base('Courts').select({}).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record) {
        courtname = record.get('Name');
        // // // // console.log('Retrieved', courtname);

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

        courtnames[courtname] = {
          id: record.id,
          name: courtname,
          zone: zone,
          stadium: stadium,
          order: order,
          room: room,
          devices: devices
        }
      });
      fetchNextPage();
    }, function done(err) {
      if (err) { console.error(err); return; }

      // // // console.dir(allcourts);
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

      // // // console.dir(allconfigs);
    });
  }

  getDevices();
  getRooms();
  getZones();
  getCourts();
  getConfigs();

}

getDataFromAirtable();

var allteams = {};
var teamindex = {};
var teamscores = {};

function getScoresFromAirtable() {
  score_base('Teams').select({}).eachPage(function page(records, fetchNextPage) {
    records.forEach(function(record) {
      allteams[record.id] = record.fields;
      teamindex[record.get('Name')] = record.id;
      teamscores[record.get('Name')] = {
        id: record.id,
        name: record.get('Name'),
        score: record.get('Cumulative Score')
      };
    });
    fetchNextPage();
  }, function done(err) {
    if (err) { console.error(err); return; }

    // // // console.dir(allteams);
    // // // // console.log('teamindex:');
    // // // console.dir(teamindex);
  });
}

getScoresFromAirtable();

// Routing
app.use(express.static(path.join(__dirname, 'public')), function(req, res) {
  // if (req.query.roomId) {
  //   // query = req.query.roomId;
  //   // // // // console.log('feed routing use - ' + query);
  // }
});

function randomCode(howLong) {
  var randomname = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < howLong; i++)
    randomname += possible.charAt(Math.floor(Math.random() * possible.length));

  return randomname;
}


var numUsers = 0;
var currentHighScore = 0;

var courts = {};

var masters = {};

var courtsandmaster = {};


var gamesplayed = {};

// Web Socket (Socket.io)
function onConnection(socket) {

  console.log('new connection - ' + socket.id);
  var gamenum = 1;

  // // console.log('socket connected: ' + socket.id);
  var currentHighScore = {
    player: 'none',
    score: 0,
    combo: 0
  };

  var addedUser = false;
  var gamesrunning;
  // // // console.log('a user connected');

  function setSocketMaster(data) {
    // // console.log('socket court');
    // // console.dir(socket.court);
    var courtid = socket.court.id;
    // // // console.log('socket.court: ' + courtid);
    var thiscourt = courtsandmaster[courtid];
    // // console.log('this court - ');
    // // console.dir(thiscourt);

    if (thiscourt) {
      // // console.log('court is listed - ');
      // // console.dir(thiscourt);
      // // console.log('court master: ' + thiscourt.master);

      if (thiscourt.master === undefined) {
        // console.log('master undefined');
        thiscourt.master = socket.id;
        socket.master = socket.id;
        // console.log('thiscourt master: ');
        // console.dir(thiscourt);
        thiscourt.slaves = [];
        courtsandmaster[courtid] = thiscourt;
        socket.emit('set master');
        console.log("set master");

      } else if (thiscourt.master) {
        // console.log('court has master: ' + thiscourt.master);
        thiscourt.slaves.push(socket.id);
        courtsandmaster[courtid] = thiscourt;
        socket.master = thiscourt.master;
          console.log("setting socket.master");
      } else {
        thiscourt.master = socket.id;
        socket.master = socket.id;
        // console.log('thiscourt master: ');
        // console.dir(thiscourt);
        thiscourt.slaves = [];
        courtsandmaster[courtid] = thiscourt;
        socket.emit('set master');
          console.log("set master 2");
      }
    } else {
      // // console.log('add court to list and set master to this socket');
      thiscourt = {
        id: courtid,
        master: socket.id
      };
      console.log("add court to list and set master to this socket");

      courtsandmaster[courtid] = thiscourt;
      // // console.dir(thiscourt);
      // // console.log('candm list: ');
      // // console.dir(courtsandmaster);
      socket.master = socket.id;
      socket.emit('set master');
    }

    // if (masters[socket.court.id]) {
    //   socket.master = masters[socket.court.id];
    // } else {
    //   socket.master = socket.id;
    //   masters[socket.court] = socket.id;
    //   socket.emit('set master');
    // }
  }

  function findARoom(somecourt, somedevice) {
    zoneid = somedevice.zone;
    thiszone = allzones[zoneid];

    if (thiszone.rooms) {
      roomid = thiszone.rooms[0];
      // // // // console.log('findaroom assign');
      // // // console.dir(somecourt);

      somecourt['room'] = [roomid];
      allcourts[somecourt.id] = somecourt;
      courtnames[somecourt.name] = somecourt;

      assignCourtToRoom(somecourt, roomid);
    } else {
      somecourt.room = createRoom(somecourt);
      // // // // console.log(somecourt);
    }
  }
  function findACourt(mydevice, myzone) {
    //if device is not a part of a court
    // // // // console.log('Please add device: ' + mydevice.ipaddress + ' to a court');
    // // // console.dir(mydevice);

    //check zone of device for list of currently configured courts, and add to court based on location
    // // // // console.log('device in zone: ' + myzone.name);
    // // // console.dir(myzone);

    zoneconfig = allconfigs[myzone.configuration];
    //
    // // // // console.log('config data');
    // // // console.dir(zoneconfig);

    courtnum = zoneconfig[mydevice.location];

    if (courtnum) {
      // // // console.log('I should be in court #' + courtnum);
      var index = courtnum - 1;
      mycourt = allcourts[myzone.courts[index]];
      if (mycourt) {
        // // // console.log('try court - ' + mycourt);
        findARoom(mycourt,mydevice);
      } else {
        // // // console.log('no court yet');
        createCourt(mydevice,myzone);
      }
    } else {
      // // // console.log('no zone config for that location');
      // // // console.dir(myzone);
      mycourt = allcourts[myzone.courts[0]];
      findARoom(mycourt,mydevice);
    }
  }
  function unknownDevice(deviceIP) {
    //if device is not a part of alldevices
    // // // console.log('Unknown device: ' + deviceIP + ' trying to set up a court');

    var newdevice = {
      ipaddress: deviceIP,
      location: 'UNKNOWN LOCATION',
      zone: 'recrPqr6a1f7Nxal8'
    };

    // add device to list of devices
    alldevices[deviceIP] = newdevice;
    var devicezone = allzones[newdevice.zone];

    console.log('allzones');
    console.dir(allzones);

    allzones[newdevice.zone] = devicezone;
    if (devicezone.devices) {
      devicezone.devices.push(newdevice);
    } else {
      devicezone.devices = [newdevice];
    }
    //update record in allzones

    // PUSH TO AIRTABLE HERE
    config_base('Devices').create({
      "IP Address": newdevice.ipaddress,
      "Zone": [newdevice.zone],
      "Location in Zone": newdevice.location
    }, function(err, record) {
        if (err) { console.error(err); return; }

        //Callback from API push
        newdeviceid = record.getId();
        // // // console.log('NewDevice - ' + newdeviceid);

        newdevice['id'] = newdeviceid;

        // do something to update local storage
        alldevices[newdevice.ipaddress] = newdevice;


        //use a random court
        findACourt(newdevice, devicezone);
    });
  }

  function joinCourt(somecourtname) {
    // // // console.log('player needs to join court: ' + somecourtname);
    // // console.log('courtnames - ');
    // // console.dir(courtnames);

    var courttojoin = courtnames[somecourtname];
    // // console.log('full court info: ');
    // // console.dir(courttojoin);

    if (courttojoin) {

      console.log('DEBUG: courttojoin:');
      console.dir(courttojoin)
      var roomcourtisapartof = allrooms[courttojoin.room];

      console.log('DEBUG: roomcourt:');
      console.dir(roomcourtisapartof);

      gamestarted = roomcourtisapartof.gamerunning;

      if (gamestarted) {
        socket.emit('game already running');
      } else {
        //CHECK COURT TO SEE IF GAME HAS STARTED, also if it has a player IF IT HAS, DON'T LET USER JOIN
        hasplayer = courttojoin.hasplayer;
        if (hasplayer) {
          socket.emit('someone already playing');
          // same as court not found
        } else {
          courttojoin.hasplayer = true;

          // save the hasplayer variable back to our list of courts
          courtnames[somecourtname] = courttojoin;

          socket.roomname = roomcourtisapartof.name;

          // player has joined court, and room
          socket.join(socket.roomname);

          var data = {
            username: socket.username,
            team: socket.team,
            court: socket.court
          }

          console.log("IS GAME IN PROGRESS? " + socket.gamesrunning);

          socket.broadcast.to(socket.roomname).emit('player joined court', data);

          socket.emit('you joined court');
        }
      }
    } else {
      // // // console.log('court not found');
      socket.emit('court not found');
    }
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
        // // // console.log('NewCourt - ' + newcourtid);


        // do something to update local storage
        newcourt = {
            id: newcourtid,
            name: newcourtname,
            order: courtorder,
            zone: somezone.id,
            devices: [somedevice.id]
        }
        allcourts[newcourtid] = newcourt;
        courtnames[newcourtname] = newcourt;

        // // // console.log('find a room court: ' + newcourt.name + ' device: ' + somedevice.ipaddress);
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
        // // // console.log('NewRoom - ' + newroomid);

        newroom = {
          id: newroomid,
          name: newroomname
        }
        allrooms[newroomid] = newroom;
        roomnames[newroom.name] = newroom;

        somecourt['room'] = [roomid];
        allcourts[somecourt.id] = somecourt;
        courtnames[somecourt.name] = somecourt;
        // // // console.log('create a room assign');
        assignCourtToRoom(somecourt, newroomid);
    });

  }

  function assignCourtToRoom(somecourt, someroomid) {
    fullroomdata = allrooms[someroomid];
    // // // console.log('telling device in court: ' + somecourt.name + ' to join room: ' + fullroomdata.name);
    // // // console.dir(fullroomdata);

    data = {
      court: somecourt,
      room: fullroomdata
    }

    socket.court = somecourt;
    // // console.log('socket.court.id: ' + socket.court.id);
    // // console.log('socket court');
    // // console.dir(courtsandmaster[socket.court.id]);
    // console.log('assigning court - ' + socket.court);
    courtsandmaster[socket.court.id] = socket.court;
    // // console.log('after');
    // // console.dir(courtsandmaster[socket.court.id]);
    // // // console.log('socket room: '+ socket.room);
    // // // // console.log('room: ');
    // // // console.dir(allrooms[someroom]);
    if (!socket.hasmaster) {
      socket.hasmaster = true;
      court = courtsandmaster[socket.court.id];
      court.slaves = [];
      courtsandmaster[socket.court.id] = court;
      setSocketMaster();
    }
    if (socket.syncdata){
      // // console.log('calling syncslaves from assign court to room');
      syncSlaves(socket.syncdata);
    }

    if (somecourt.room) {
      // // // // console.log('assigning court to room - ');
      // // // console.dir(somecourt.room);
    } else {
      // // // console.log('trying to update court info as - ');
      // // // console.dir(fullroomdata);
      // config_base('Courts').update(somecourt.id, {
      //   "Room": [fullroomdata.id]
      // }, function(err, record) {
      //     if (err) { console.error(err); return; }
      // });
    }

    //need to update court list
    socket.emit('join this room', data);
  }


  function addScoreToDatabase(data) {
    // // console.log('Adding Score:');
    // // console.dir(data);

    getHighScore(socket.game, data);


    playername = data.player.username;
    playerteam = teamindex[data.player.team.name];
    // // // console.log(playerteam);
    playerscore = data.player.score;

    if (playerscore > 0) {

      score_base('Players').create({
        "Name": playername,
        "Team": [playerteam],
        "Score": playerscore,
        "Submission Date": new Date()
      }, function(err, record) {
          if (err) { console.error(err); return; }

          //Callback from API push
          newplayerid = record.getId();
          // // // console.log('NewPlayer - ' + newplayerid);
      });
    }
  }

  function getHighScore(somegame, courtgamedata) {

    var thisgamesroom = roomnames[socket.roomname];

    console.log('get data');
    console.dir(courtgamedata);

    console.log('DEBUG: allrooms');
    console.dir(allrooms);

    console.log('roomname - ' + socket.roomname);

    console.log('DEBUG: thisgamesroom');
    console.dir(thisgamesroom);

    if (gamesplayed[somegame]) {
      var updategame = gamesplayed[somegame].push(courtgamedata);
      gamesplayed[somegame] = updategame;
    } else {
      gamesplayed[somegame] = [courtgamedata];
    }

    for (ascore in gamesplayed[socket.game]) {
      thisgamesroom.currentHighScore = ascore;
    }

    if (courtgamedata.score > thisgamesroom.currentHighScore) {
      thisgamesroom.currentHighScore = courtgamedata;
    } else {
      // // // console.log('Sorry not the best');
    }

    allrooms[socket.roomname] = thisgamesroom;

    var resultsdata = {
      highscorer: currentHighScore,
      yourscore: courtgamedata,
      teamscores: teamscores
    };

    var emitData = {
      court: socket.court.name,
      game: socket.game,
      resultsdata: resultsdata
    };

    socket.broadcast.to(socket.roomname).emit('show results', emitData);

  }

  function syncSlaves(data) {
    //console.log("SYNC SLAVES");
    var courtmaster;
    if (socket.court.master) {
      courtmaster = socket.court.master;
      if (courtmaster == socket.id) {
        // // console.log('this screen is master - ' + socket.id);
          var testData = {
            courtname:socket.court.name,
              syncdata:data
          };

           console.log("Court name in index: " + socket.court.name);

        socket.broadcast.to(socket.roomname).emit('sync with master', testData);
      } else {
         console.log('someone else is master - ' + courtmaster);
      }
    } else {
      setSocketMaster();
    }
  }


  function findNewMaster(oldsocketid) {
    var slaveindex = court.slaves.indexOf(socket.id);
    var newmaster = court.slaves.pop(slaveindex);
    courtsandmaster[socket.court.id].master = newmaster;
    io.to(courtsandmaster[socket.court.id].master).emit('set master');
  }

  //court stuff I think
  function getCourtToShow(deviceIP) {
    // we know this is a court, so tell the Socket
    socket.devicetype = 'court';

    // find out if the device knows what court it should be a part of

    // first check to see if device is in list of devices
    if (deviceIP in alldevices) {
      //if we know the device already, check its court and zone,
      mydevice = alldevices[deviceIP];
      mycourt = allcourts[mydevice.court];
      myzone = allzones[mydevice.zone];

      if (!myzone) {
        myzone = 'UNKNOWN ZONE';
      }

      // // // // console.log('court: ');
      // // // console.dir(mycourt);
      if (mycourt) {
        //if we know the court the device should be in, check if we know the room
        myroom = mycourt.room;
        myroomid = myroom;
        if (myroom) {
          //if mycourt already knows what room it is supposed to be a part of
          // // // console.log('myroom assign');
          assignCourtToRoom(mycourt,myroomid);
        } else { //find a room
          // // // console.log('court: ' + mycourt.name + ' and device: ' + mydevice.ipaddress + ' need a room');
          findARoom(mycourt,mydevice);
        }
      } else { //find a court
        // // // console.log('No court found for device: ' + mydevice.ipaddress + ' in zone: ' + myzone.name);
        findACourt(mydevice, myzone);
      }
    } else { //unknown device
      // // // console.log('device: ' + deviceIP + ' not in alldevices list');
      unknownDevice(deviceIP);
    }
  };

  socket.on('update court', function(courtdata) { //court joins new room
    // // // console.log('updating court');
    // var newCourt = {
    //   name: data.courtname,
    //   room: socket.roomname
    // };
    var newroomid = courtdata.room;
    courtnames[courtdata.name].room = newroomid;
    var newroom = allrooms[newroomid];
    socket.join(newroom);
    // // // // console.log('Courts: ');
    // // // console.dir(courts);
  });

  socket.on('join room', function(data) { //court does this
    roomname = data.roomname;
    courtname = data.courtname;

    socket.join(roomname);
    socket.roomname = roomname;
    socket.court = courtnames[data.courtname];

    // // // console.log('index.js: court: ' + socket.courtname + ' joining room - ' + socket.roomname);
    // socket.broadcast.to(socket.roomname).emit('court joined room', data);
    socket.emit('court joined room', data);
  });


  //player stuff I think
  socket.on('player wants to join court', function(playerdata) { //player does this
    // we know this a player, so tell the Socket
    socket.devicetype = 'player';

    socket.username = playerdata.username;
    socket.team = playerdata.team;
    socket.court = playerdata.court;

    joinCourt(socket.court);
  });
  socket.on('change player name', function(playerdata) {
    oldplayer = {
      username: socket.username,
      team: socket.team,
      court: socket.court
    };
    newplayer = {
      username: playerdata.username,
      team: playerdata.team,
      court: playerdata.court
    };

    // // // console.log('player: ' + oldplayer.username + ' changed name to: ' + newplayer.username);
    // // // console.log('new team: ' + newplayer.team);
    socket.username = newplayer.username;
    socket.team = newplayer.team;
    socket.court = newplayer.court;

    data = {
      oldplayer: oldplayer,
      newplayer: newplayer
    }
    socket.broadcast.to(socket.roomname).emit('player changed name', data);
  })


  //game stuff
  // socket.on('start countdown', function(courtName) {
  //   if (!gamesrunning) {
  //    gamesrunning = true;
  //    // // // console.log('countdown started by - ' + courtName);
  //    socket.broadcast.to(socket.roomname).emit('start countdown', courtName);
  //   } else {
  //    // // // console.log('countdown already running')
  //   }
  // });

  socket.on('game almost ready', function(courtName) {

    console.log('GAME ALMOST READY LISTENER');
      console.log(allrooms);
      console.log("room name " + socket.roomname);

    var thisgamesroom = roomnames[socket.roomname];
    console.log('all rooms');
    console.dir(allrooms);

    console.log("this games room " + thisgamesroom);
    if (thisgamesroom.gamerunning) {
      socket.game = thisgamesroom.gamename;
      thisgamesroom.courtcount += 1;
    } else {
      thisgamesroom.gamerunning = true;
      thisgamesroom.gamename = thisgamesroom.id + '_' + gamenum;
      thisgamesroom.courtcount = 1;
      gamenum += 1;
      socket.game = thisgamesroom.gamename;
    }

    roomnames[socket.roomname] = thisgamesroom;
    allrooms[thisgamesroom.id] = thisgamesroom;

    var gamedata = {
      courtname: courtName,
      gamename: thisgamesroom.gamename
    }

    // // // console.log('game almost ready by - ' + courtName);
    socket.broadcast.to(socket.roomname).emit('game almost ready', gamedata);

      //TODO: WILL NEED TO LISTEN FOR AN EVENT TO TURN GAME PROGRESS OFF AFTER RESULTS ARE SHOWN

  });
  socket.on('throw ball', function(data) {
    // // // // console.log('Full Data - ' + data);

    var exitX = data.exitX;
    var exitY = data.exitY;
    var xSpeed = data.xSpeed;
    var ySpeed = data.ySpeed;
    var deviceWidth = data.deviceWidth;
    var deviceHeight = data.deviceHeight;
    // // // // console.log('Data Saved');

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

    // // // console.log('take shot');

    var emitData = {
      court: socket.court,
      shotInfo: shotInfo
    }

    socket.broadcast.to(socket.roomname).emit('take shot', emitData);

  });
  socket.on('game over', function(courtgamedata) {

    // Submit Player Data To Database
    // // console.log('game over');
    // // console.dir(gamedata);
    addScoreToDatabase(courtgamedata);

    var thisgamesroom = roomnames[socket.roomname];

    if (thisgamesroom.gamerunning) {
      socket.broadcast.to(socket.roomname).emit('end all games', socket.court);
      thisgamesroom.gamerunning = false;

      roomnames[socket.roomname] = thisgamesroom;
      allrooms[thisgamesroom.id] = thisgamesroom;
    }
  });
  socket.on('room reset', function() {
    var thisgamesroom = roomnames[socket.roomname];

    console.log('room reset called');
    thisgamesroom.gamerunning = false;

    roomnames[socket.roomname] = thisgamesroom;
    allrooms[thisgamesroom.id] = thisgamesroom;

    socket.broadcast.to(socket.roomname).emit('reset game');
    socket.emit('reset game');
  });
  socket.on('court reset', function(somecourtname) {
    console.log('court resetting');
    var thiscourt = courtnames[somecourtname];
    thiscourt.hasplayer = false;
    courtnames[somecourtname] = thiscourt;
  });

  socket.on('sync screens', function(data) {
     //console.log('Sync Data test');
     //console.dir(data);
    socket.syncdata = data;

    if (socket.court) {
      var thiscourt = courtsandmaster[socket.court.id];
       //console.log('thiscourt - '+ thiscourt);

       //console.log('thiscourt from sync screens: ');
       //console.dir(thiscourt);

      syncSlaves(data);
    } else {
      console.log('deviceIP ' + data.deviceIP);
      mydevice = alldevices[data.deviceIP];
      //console.log('mydevice - ');
      //console.dir(mydevice);
      // mycourt = allcourts[mydevice.court];
      myzone = allzones[mydevice.zone];
      console.log('cant find court');
      findACourt(mydevice,myzone);
    }
  });

  function courtDisconnected(somesocket) {
    if (socket.court) {
      var somecourtid = somesocket.court.id;
      var courtid = somecourtid;
      var court = courtsandmaster[courtid];
      if (court.master == socket.id) {
        // console.log('need to find new master - ');
        // console.dir(socket.court);
        // console.log('current courtsandmaster');
        // console.dir(courtsandmaster);
        findNewMaster();
      } else {
        var slaveindex = court.slaves.indexOf(socket.id);
        court.slaves.pop(slaveindex);
        courtsandmaster[courtid] = court;

          // console.log('court after pop');
          // console.dir(court);
          // console.log('current courtsandmaster');
          // console.dir(courtsandmaster);
      }
    }
  }
  function playerDisconnected(somesocket) {
  }

  //server stuff
  socket.on('disconnect', function() {
    console.log('user from: ' + socket.id + ' disconnected');

    // if socket is a court socket
    if (socket.devicetype == 'court') {
      console.log('court disconnected');
      courtDisconnected(socket);
    } else if (socket.devicetype == 'player') {
      console.log('player disconnected');
      playerDisconnected(socket);
    } else {
      //seems like device disconnected before it was set up
      console.log('unknown device type disconnected');
    }
  })
  socket.on('reconnect', function() {
    console.log('socket reconnected - ' + socket.id);
    console.dir(socket);
  });

  socket.on('touch event', function(data) {
    // // console.log('Some Touch Event');
    // // console.dir(data);
  });

  socket.on('court connected', function(data) {
    var deviceIP = data.deviceIP;
    socket.deviceIP = data.deviceIP;

    console.log(alldevices[socket.deviceIP]);

    // console.log('court connected: ip-' + deviceIP);
    //when court has connected, save it to the courts dictionary

    if (connectedcourts[deviceIP]) {
      var courtinfo = connectedcourts[deviceIP];
      //court has already connected
      console.log('CONNECTION: court reconnecting');
      socket.emit('court reconnected', courtinfo);
    } else {
      console.log('CONNECTION: court connected for the first time');
      connectedcourts[deviceIP] = data;
    }

    console.log('connected courts at ip');
    console.dir(connectedcourts[deviceIP]);

    getCourtToShow(deviceIP);
  });


}




// To Delete, seems redundant or not needAlphaBlending
    // // when the client emits 'add user', this listens and executes
    // socket.on('add user', function(data) {
    //   // dont add the user twice, just return if this is called again.
    //   if (addedUser) return;
    //
    //   // // // console.log('add user called - ' + data);
    //   var userdata = '';
    //
    //   // if not valid json object, parse
    //   try {
    //       userdata = JSON.parse(data);
    //       // // // console.log('userdata' - userdata);
    //   } catch (e) {
    //       userdata = data;
    //   }
    //
    //   // we store the username in the socket session for this client
    //   socket.username = userdata.username;
    //   ++numUsers;
    //   addedUser = true;
    //
    //   if (numUsers == 1 ) {
    //     socket.team = 'red';
    //     socket.emit('change team', socket.team);
    //   } else if (numUsers == 2) {
    //     socket.team = 'blue';
    //     socket.emit('change team', socket.team);
    //   } else {
    //     socket.team = userdata.team;
    //   }
    //
    //   // fake for now
    //   // socket.roomname = 'GAME';
    //
    //   // // // console.log("|New User: " + socket.username + "\n - Chosen team: " + socket.team);
    //
    //   // socket.emit('login', {
    //   //   numUsers: numUsers,
    //   //   roomname: socket.roomname
    //   // });
    //
    //   // // // console.log(' - Joined Room: ' + socket.roomname);
    //
    //   // echo globally (all clients) that a person has connected
    //   socket.broadcast.to(socket.roomname).emit('user joined', {
    //     username: socket.username,
    //     team: socket.team,
    //     numUsers: numUsers
    //   });
    // });

    // socket.on('add court', function(courtdata) {
    //   // // // console.log('adding court');
    //   // var newCourt = {
    //   //   name: data.courtname,
    //   //   room: socket.roomname
    //   // };
    //   courts[courtdata.name] = socket.roomname;
    //   // // // console.log('court name - ' + courtdata.name);
    //   // // // console.log('socket room - ' + socket.roomname);
    //   // // // // console.log('Courts: ');
    //   // // // console.dir(courts);
    // });
    // var query;
    //might not need
    // socket.on('query request', function() {
    //   // // // console.log('query request received');
    //   if (query) {
    //     // // // console.log('there is a query - ' + query);
    //     socket.emit('query', query);
    //   } else {
    //     // // // console.log('no query found');
    //     socket.emit('use random query');
    //   }
    // });
    // // app.use(express.static(path.join(__dirname, 'babylon')));
    // //
    // app.get('/game', function(req, res) {
    //     res.sendFile(path.join(__dirname + '/public/game.html'));
    //     query = req.query.room;
    //     // // // console.log('webapp routing - ' + query);
    // });
    //
    // // app.get('/rebabylon', function(req, res) {
    // //   var randquery = randomCode(7);
    // //   // // // console.log('redirecting');
    // //   res.redirect('/babylon/?roomId=' + randquery);
    // //   // query = randquery;
    // //   // // // // console.log('query - ' + query);
    // // });
    //
    // // app.get('/babylon', function(req, res) {
    // //     // // // console.log('babylon loaded');
    // //     res.sendFile(path.join(__dirname + '/public/babylon/index.html'));
    // //     // query = req.query.roomId;
    // //     // // // // console.log('feed routing bab - ' + query);
    // // });
    //
    //
    // app.set('view engine', 'ejs');
    //
    // app.get('/about', function(req, res) {
    //   res.render('pages/about');
    // });

// Ready to delete finished




io.on('connection', onConnection);

server.listen(port, function(){
  // // // console.log('listening on %d', port);
});
