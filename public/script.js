$(function(){
    let token = Cookies.get('token')
    console.log(token)
    var socket = io();
    if(token ==undefined){
        window.location.assign('/signup.html')
    }
    else{
        getRooms()
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
let room='';
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
        .then(res=>{
            closeModal()
            if(res.message == 'room-made' ){
                closeModal()
                fadeMessage('room made',5000)
            }
            else{
                closeModal()
                fadeMessage('room name taken',5000)
            }
            
        })
}
//Modal stuffs

//get modal div
const modal = document.getElementById("createRoom")
const chatModal = document.getElementById("createChat")

function fadeMessage(message,time){
    $('p#message').text(message)
    setTimeout(function(){
        $('p#message').text('')
      },time);
    
}

function openModal(){
    modal.style.display = "block";
}
function openChatModal(){
    chatModal.style.display ="block";
}
function closeChatModal(){
    chatModal.style.display ="none";
}
function closeModal(){
    modal.style.display = "none";
}

function openChat(){
    openChatModal()
}


window.onclick = function(event) {
    if (event.target == modal || event.target == chatModal) {
      modal.style.display = "none"
      chatModal.style.display = "none"
    }
  }

  function getRooms(){
    let token = Cookies.get('token')

    payload={
        body:JSON.stringify({
            token:token,
        }),
        method:'post',
        headers:{
            'content-type':'application/json'
        }
    }

    fetch('/getRooms',payload)
        .then(res=>res.json())
        .then(res =>{
            console.log(res)
            let array = res.data
            console.log(array)
            for (let i = 0; i < array.length; i++) {
                $('select#rooms').append(`<option class='roomButton' value='${array[i].roomName}'>${array[i].roomName} </option> `)
                
            }
        })
  }

  function loadRoom(){
       room = $('select#rooms').val()
    let token = Cookies.get('token')
      console.log(room)
      payload = {
          body:JSON.stringify({
            token:token,
            roomName:room
          }),
          method:'post',
        headers:{
            'content-type':'application/json'
        }
      }
      fetch('/getRoomData',payload)
        .then(res => res.json())
        .then(res =>{
            $('div#chat').empty()
            for(let i=0; i<res.data.length;i++){
                $('div#chat').append(`<p>${res.data[i].message}-${res.data[i].name}</p>`)
            }
        })
  }

function CreateChat(){
    if(room ==''){
        return
    }
    console.log('check')
    let token = Cookies.get('token')
    let chatName = $("input#chatNameInput").val()
    console.log(chatName)
    let payload ={
        body:JSON.stringify({
            token:token,
            room:room,
            chat:chatName
        }),
        method:'post',
        headers:{
            'content-type':'application/json'
        }
    }
    fetch('/makeChat',payload)
        .then(res=> res.json())
}