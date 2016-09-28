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

// express.static takes the path to the folder to serve client files
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(express.static('./'));
app.use("/api", messageRouter)


// Create a new var obj called client info
// The key will be the socketId
// ie. clientInfo = {
//           "socketID38832": {
//                name: 'Andrew',
//                room: 'Room Name"
//                          }
//                }

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
// we get access to the individual socket
// socket refers to an individual connection
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

  // create on for event of join room the req = the object we are passing
  // on emit
  socket.on('joinRoom', function(req){
    // req is the client info
    console.log("this is the clientInfo outside :" , req)
    clientInfo[socket.id] = req;
    // join :: is a built in method that tell the socket library
    // to add this socket to a specific room here we are using req.room
    socket.join(req.room);
    // next we are emit a message to everyone in the room that someone
    // has joined
    // broadcast :: sends the event to everyone but the one who
    // emitted it
    // to :: let us specify the specific room to send it to
    socket.broadcast.to(req.room).emit('message', {
      // here we are setting the message
      name: 'System',
      text: req.name + ' has joined!',
      timestamp: moment().valueOf()
     });
  });

  socket.on('message', function(message){
    // at this point we know the message get received but not sent out
    console.log('Message received by the Server : ' + message.text);

    if(message.text === '@currentUsers' ){
      sendCurrentUsers(socket);
    } else {
      message.timestamp = moment().valueOf()
      // We can get more specific
      // to : inside the argument will be the specific room name
      io.to(clientInfo[socket.id].room).emit('message', message);
    }
  })

// we get access to the individual socket
// socket refers to an individual connection

  socket.emit('message', {
    // Argument 1 : Anything you want can be an event I am using message
    // Argument 2 : Data you would like to send; I am choosing an object which can have many different
    // properties
    name: "System Message",
    text: 'Welcome',
    timestamp: moment().valueOf()
    // timestamp property - Javascript timeStamp (milliseconds)
  });

});




http.listen(PORT, function(){
  console.log('Server started')
})
