$(function(){
    var socket = io();
    
    $('button#submit').click(function(){
        let msg = $('input#textbox').val()
        socket.emit('sendMessage',msg)
    })
})