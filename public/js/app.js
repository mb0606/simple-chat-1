// these variable are parsed off the query params
var name = getQueryVariable('name') || "Anonymous";
var room = getQueryVariable('room')
// create socket variable
var socket = io();

$('#roomName').text(room);

console.log(name + ' wants to join ' + room)

// pass in the same two arguments; event and CB
// in this case the connection on the front end is called connect
socket.on('connect', function(){
  console.log('Connected to socket.io server')
  // create a new socket event we are calling it join room
  // This name is not special it's just a custom event
  // you can call it whatever you want as long as it is consistent for and backend
  socket.emit('joinRoom', {
    // pass in an object that will have a name and a room
   name:name,
   room:room,
 });
});

// call socket.on Agument 1 : custom event ‘message’
// Argument 2 : CB with the message passed in
// we have added a way for the front end to listen for this custom event and when it gets it
// it will print it to the console
socket.on('message', function(message){
  var momentTimeStamp = moment.utc(message.timestamp)
  console.log("New Message" + message);
  console.log(message.text);
  var $message = $('.messages');
  // We receive the message and add it to our messages div by appending it.
  $message.append('<p><strong>' + message.name + ' ' + momentTimeStamp.local().format('H:mm a') + '</strong>:  ' + message.text  + '</p>')
});

// handles submit of new message
var $form = $('#form-message')

$form.on('submit', function(event){
  event.preventDefault();
  $message = $form.find('input[name=message]');
    // send message to Server
    socket.emit('message', {
      name: name,
      text: $message.val()
    });
  $message.val('')
});
