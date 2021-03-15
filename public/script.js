$(function(){
    let token = Cookies.get('token')
    console.log(token)
    var socket = io();
    if(token ==undefined){
        window.location.assign('/signup.html')
    }
    function send(){
        let msg = $('input#textbox').val()
        let payload = {message:msg,token:token}
        socket.emit('sendMessage',payload)
        $('input#textbox').val('')
    }
    $(document).on('keypress',(e)=>{
        if(e.keyCode==13){
            send()
        }
    })
    $('button#submit').click(function(){
        send()
    })
    socket.on('msg',(msg)=>{
        console.log(msg)
        $('div#chat').append(`<p>${msg}</p>`)
    })
    socket.on('login',()=>{
        window.location.assign('/login.html')
    })
})

let sidebarOpen = true

function sidebarTest(){
    if(sidebarOpen){
        document.getElementById("sidebar").style.width = "0%"
        document.getElementById("mainBody").style.marginRight = "0%"
        sidebarOpen = false
    }
    else{
        document.getElementById("sidebar").style.width = "25%"
        document.getElementById("mainBody").style.marginRight = "25%%"
        sidebarOpen = true
    }
}