var name = getQueryVariable('name') || "Anonymous";
var room = getQueryVariable('room')
var socket = io();

$('#roomName').text(room);

console.log(name + ' wants to join ' + room)

socket.on('connect', function(){
  console.log('Connected to socket.io')
  socket.emit('joinRoom', {
   name:name,
   room:room,
 })
})


socket.on('message', function(message){
  var momentTimeStamp = moment.utc(message.timestamp)
  console.log("New Message" + message);
  console.log(message.text);
  var $message = $('.messages');

  $message.append('<p><strong>' + message.name + ' ' + momentTimeStamp.local().format('H:mm a') + '</strong>:  ' + message.text  + '</p>')
});

// handles submit of new message
var $form = $('#form-message')

$form.on('submit', function(event){
  event.preventDefault();
  $message = $form.find('input[name=message]');
  socket.emit('message', {
    name: name,
    text: $message.val()
  });
  $message.val('')
});
