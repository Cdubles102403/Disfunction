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
    const button = document.getElementById("sidebarControl")

    if(sidebarOpen){
        document.getElementById("sidebar").style.width = "0%"
        document.getElementById("mainBody").style.width = "100%"
        button.style.transform = "scaleX(-1)"
        sidebarOpen = false
    }
    else{
        document.getElementById("sidebar").style.width = "25%"
        document.getElementById("mainBody").style.width = "75%"
        button.style.transform = "scaleX(1)"
        sidebarOpen = true
    }
}

//logout
function die(){
    const areYouSure = confirm("Are you sure you want to log out?")

    if(areYouSure){
        
    }
}


//make room on button click
function makeRoom(){
    let token = Cookies.get('token')
    let name = $('#roomNameInput').val()

    let payload = {
        body:JSON.stringify({
            name:name,
            token:token,
        }),
        method:'post',
        headers:{
            'content-type':'application/json'
        }
    }
    fetch('/makeRoom',payload)
        .then(res=> res.json())
        .then(res=> {console.log(res.message)})
}


//Modal stuffs

//get modal div
const modal = document.getElementById("createRoom")

function openModal(){
    modal.style.display = "block";
}

function closeModal(){
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }