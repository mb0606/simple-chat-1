// Create regular express app
var PORT       = process.env.PORT || 3000;
var express    = require('express');
var app        = express();
// Tells node to start a new server and use this express app as a boilerplate
// Anything the express app listen to this server should to
var http       = require('http').Server(app);
// call it with http; Think of io like our app variable
var io         = require('socket.io')(http);
var moment     = require('moment')
var bodyParser = require('body-parser');
var messageRouter = require('./messageRouter')

// express.static takes the path to the folder
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(express.static('./'));
app.use("/api", messageRouter)

var clientInfo = {};
// Sends current users to provided socket
function sendCurrentUsers(socket) {
  var info  = clientInfo[socket.id];
  var users = [];

  if(typeof info === 'undefined'){
    return;
  }
  Object.keys(clientInfo).forEach(function(socketId){
    var userInfo = clientInfo[socketId];

    if(info.room === userInfo.room){
      users.push(userInfo.name);
    }
  });
  socket.emit('message', {
    name: 'System',
    text: 'Current users: ' + users.join(", "),
    timestamp: moment().valueOf()
  })
}

//  lets you listen for events; first param the name of the event ; second CB;
//  when you get connection event run function
io.on('connection', function(socket){
  console.log('User connected via socket.io!');

  socket.on('disconnect', function(){
    console.log("this is the clientInfo Obj :" ,clientInfo[socket.id])
    var userData = clientInfo[socket.id];
    if(typeof clientInfo[socket.id] !== 'undefined'){
      socket.leave(userData.room);
      io.to(userData.room).emit('message', {
        name: 'System',
        text: userData.name + ' has left ',
        timestamp: moment().valueOf()
      });
      delete clientInfo[socket.id];
    }
  });

  socket.on('joinRoom', function(req){
    // req is the client info
    console.log("this is the clientInfo outside :" ,req)
    clientInfo[socket.id] = req;
    socket.join(req.room);
    socket.broadcast.to(req.room).emit('message', {
      name: 'System',
      text: req.name + ' has joined!',
      timestamp: moment().valueOf()
     })
  });

  socket.on('message', function(message){

    console.log('Message recieved ' + message.text);
    if(message.text === '@currentUsers' ){
      sendCurrentUsers(socket);
    } else {
      message.timestamp = moment().valueOf()
      io.to(clientInfo[socket.id].room).emit('message', message);
    }
  })
// timestamp property - Javascript timeStamp (milliseconds)
  socket.emit('message', {
    name: "System Message",
    text: 'Welcome hey',
    timestamp: moment().valueOf()
  });
});




http.listen(PORT, function(){
  console.log('Server started')
})
