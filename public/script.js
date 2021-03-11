$(function(){
    var socket = io();
    

    $('button#submit').click(function(){
        let msg = $('input#textbox').val()
        socket.emit('sendMessage',msg)
    })
    socket.on('msg',(msg)=>{
        console.log(msg)
        $('div#chat').append(`<p>${msg}</p>`)
    })
})