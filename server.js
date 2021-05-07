const fs = require('fs')
const express = require('express');
const app = express();
const https = require('https');
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
var server = https.createServer(options, app);
var io = require('socket.io')(server);
const sql = require('sqlite3').verbose();
const chalk = require('chalk')
const crypto = require('crypto')
const functions = require('./serverReusables/function.js')
const rooms = require('./API/roomFunctions.js')
const chats = require('./API/chatFunctions.js');
const socketRoom = require('./serverReusables/socketRoomFunctions.js')
const PORT = 443; //port to start on

const socketRooms = []

const db = new sql.Database('./db/database.db'); //creates connection to DB

app.use(express.json())
app.use(express.static('views'))
app.use(express.static('public'))

io.on('connection', (socket) => {
    console.log(chalk.black.bgGreen(`user connected: ${socket.id}`));
    try{
    let token = socket.handshake.headers.cookie.slice(6)
    token = functions.verifyJWT(token)
    console.log(token)
    let username = token.data.username
    let socket_id = socket.id
    let SQL_addToLogin = `INSERT INTO loggedIn(user,socketID) values(?,?)`
    db.run(SQL_addToLogin,[username,socket_id],(err)=>{if(err){console.error(err)}})
    }
    catch{
      console.log('no token or bad token')
    }
    
    socket.on('disconnect', () => {
      console.log(chalk.black.bgRed(`user disconnected: ${socket.id}`))
      //delete from logged in DB
      let SQL_deleteLogin = `DELETE FROM loggedIn WHERE socketID=?`
      db.run(SQL_deleteLogin,[socket.id],(err)=>{console.error(err)})
      //takeout of room
    });
    socket.on('sendMessage',(payload)=>{
      //console.log(payload)
      try {
        let decodedToken = functions.verifyJWT(payload.token)
        //console.log(decodedToken) 
        let msgSan = functions.sanitize(payload.message)
        let sender = decodedToken.data.username
        let room = payload.room
        let chat = payload.chat
        saveMessage(msgSan,sender,room,chat)
        let message = `<p class="message">${msgSan}-<b class="messageTag">${sender}</b></p>`
        socket.broadcast.emit("msg",message)
        socket.emit("msg",message)
      } catch (error) {
        //console.log(error)
        socket.emit('login')
        return
      }
    })
  });


//login route
app.post('/login',(req,res)=>{
   let body = req.body
   //console.log(body)
   let username = body.username
   let password = body.password
   const checkSQL = 'SELECT * FROM members WHERE username = ?'

  db.all(checkSQL,[username],(err,results)=>{
    if(err) console.error(err)
    if(results.length>=1){
     // console.log(results)
      if(functions.hasher(password)==results[0].password){
        console.log(`succesful login for ${chalk.blueBright(username)}`)
        let token = functions.makeJWT(results[0].password,results[0].email,results[0].username)
        //console.log(functions.verifyJWT(token))
        res.send({message:"successful-login",token:token,target:'/'})
        return
      }
      else{
        res.send({message:'check-username-and-password'})
        return
      }
    }
    else{
      //user not found
      res.send({message:"user-not-found"})
      return
    }
  })
})

app.post('/makeRoom',(req,res)=>{
  let body = req.body
  let token = body.token
  let SQL_checkForRoom = `SELECT * FROM roomDirectory WHERE name = ?`
  //decrpyt token
  decryptToken = functions.verifyJWT(token)
  //get room name
  let name = body.name;
  //sanatize user input
  sanName = functions.sanitize(name)
  db.all(SQL_checkForRoom,[name],(err,results)=>{
    if(err){console.error(err)}
    if(results.length<1){
      //make room
      //run make room function with proper inputs
      let roomResponse = rooms.makeRoom(sanName)
      res.send({message:"room-made"})
    }
    else{
      //room exists
      console.log("room already exists")
      res.send({message:"room-taken"})
    }
  })
})

app.post("/getRooms",(req,res)=>{
  let token = req.body.token
  let decrypt = functions.verifyJWT(token)
 
  let name = decrypt.data.username
  console.log(name)
  SQL_getRooms = `SELECT roomName FROM memberToRoom WHERE memberName = ?`
  db.all(SQL_getRooms,[name],(err,results)=>{
    if(err){console.error(err)}
    if(results.length>=1){
      res.send({"message":'good-data',"data":results})
    }
    else{
      res.send({"message":"no-rooms-found"})
    }
  })
})

app.post('/addMember',(req,res)=>{
  let member = req.body.member
  let role = '1'
  let room = req.body.room
  let token = functions.verifyJWT(req.body.token)
  let memberList=`${room}MemberList`
  let SQL_checkMember =  `SELECT * FROM ${memberList} WHERE name =?`
  console.log(token.data.username)
  db.all(SQL_checkMember,[token.data.username],(err,results)=>{
    if(err){console.error(err)}
    console.log(results)
    if(results.length==1){
      //member is in room
      rooms.addMember(member,role,room)
      console.log('adding member to room')
    }
    else{
      console.log('bad creds')
    }
  })

  res.end()
})  


//signup route
app.post('/signup',(req,res)=>{
  let body = req.body;
  //console.log(body)
  let email = functions.sanitize(body.email)
  let username = functions.sanitize(body.username)
  let password = body.password
  var passwordR = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/g
  //check password
  if(!password.match(passwordR)){
    res.send({message:"fix-password"})
    return;
  }
  //check if in database
  const checkSQL = 'SELECT * FROM members WHERE username = ?'
  db.all(checkSQL,[username],(err,results)=>{
    console.log(results)
    if(results.length == 0){
      //insert into database
      const insertSQL='INSERT INTO members(username,email,password) VALUES(?,?,?)'
      let hash = functions.hasher(password)
      db.run(insertSQL,[username,email,hash])
        //redirect
      let token = functions.makeJWT(password,email,username)
      res.send({token:token,message:'redirect', target:"/"})
    }
    else{ //already exists
      res.send({message:"already-exists"})
    }
  })
})

app.post('/getRoomData',(req,res)=>{
  let room = req.body.roomName
  console.log(room)
  let token = functions.verifyJWT(req.body.token)

  let roomChatList = `${room}ChatList`
  let SQL_GetOherChats = `SELECT name from "${roomChatList}"`
  
  let SQL_getMainRoom = `SELECT mainChat FROM roomDirectory WHERE name = ?`
  db.all(SQL_getMainRoom,[room],(err,results)=>{
    if(err){console.error(err)}
     let mainChat = results[0].mainChat
     let getChat = `${room}_${mainChat}`
     let SQL_getChats = `SELECT name,message,date FROM ${getChat}`
    
     db.all(SQL_getChats,[],(err2,results2)=>{
      if(err2){console.error(err2)}
      db.all(SQL_GetOherChats,[],(err3,results3)=>{
        if(err){console.error(err3)}
      console.log(results3)
      res.send({"message":"room-data","data":results2,"chats":results3})
      })
    })
  })
})

app.post('/makechat',(req,res)=>{
  console.log(req.body)
  let token = functions.verifyJWT(req.body.token)
  chats.makeChat(req.body.room,req.body.chat,token.username)
  res.send({"message":"good"})
})

app.post('/getChats',(req,res)=>{
  let roomName = req.body.name
  let token = functions.verifyJWT(req.body.token)

  let SQL_getChats =`SELECT * FROM `
})

function startUp(){
  //make a room object for each room
  //get amount of rooms and names
  let SQL_rowCount = 'SELECT COUNT(*) FROM roomDirectory'
  let SQL_getRoomName = 'SELECT name FROM roomDirectory WHERE id=?'
  db.all(SQL_rowCount,[],(err,results)=>{
    if(err){console.error(err)}
    //console.log(results)
    let rows = results[0]["COUNT(*)"]
    for(let i=1;i<=rows;i++){
      db.get(SQL_getRoomName,[i],(err2,results2)=>{
        let name = results2.name
        let room = socketRoom.makeRoom(name)
        socketRooms.push(room)
        console.log(socketRooms)
      })
        
    }
    server.listen(PORT,()=>{
      console.log(`started on port ${PORT}`)
      })
  })

  
}

startUp()