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
const PORT = 443; //port to start on


server.listen(PORT,()=>{
console.log(`started on port ${PORT}`)
})

const db = new sql.Database('./db/database.db'); //creates connection to DB


app.use(express.json())
app.use(express.static('views'))
app.use(express.static('public'))

io.on('connection', (socket) => {
    console.log(chalk.black.bgGreen('a user connected'));
    socket.on('disconnect', () => {
      console.log(chalk.black.bgRed('user disconnected'));
    });
    socket.on('sendMessage',(payload)=>{
      //console.log(payload)
      try {
        let decodedToken = functions.verifyJWT(payload.token)
        //console.log(decodedToken) 
        let msgSan = functions.sanitize(payload.message)
        let message = `<p class="message">${msgSan}-<b class="messageTag">${decodedToken.data.username}</b></p>`
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
      let roomResponse = makeRoom(sanName)
      res.send({message:"room-made"})
    }
    else{
      //room exists
      console.log("room already exists")
      res.send({message:"room-taken"})
    }
  })
})

app.get("/getRooms",(req,res)=>{
  let body = req.body
  let name = body.name
  SQL_getRooms = `SELECT `
  // check if room exists
  //Run make room function
  //send 
  
})

app.post('/addMember',(req,res)=>{
  //get member
  //get room name
  //check if in room
  //add member to room command
  //send results
})

function makeRoom(name,maker){
let SQL_makeRoom ='INSERT INTO roomDirectory (name,chatList,memberList) values(?,?,?)'
//create chatList
let chatList = `${name}ChatList`
let SQL_MakeChatList=`CREATE TABLE ${chatList} (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, messageList TEXT,dateCreated INTEGER)`
db.run(SQL_MakeChatList,[],function(err,results){
  if(err){console.error(err)}
  console.log(this.lastID)
})
//create memberList
let memberList=`${name}MemberList`
let SQL_makeMemberList =`CREATE TABLE ${memberList} (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,role INTEGER,dateAdded INTEGER )`
db.run(SQL_makeMemberList,[],function(err,results){
  if(err){console.error(err)}
})
//create room, acts as hub
db.run(SQL_makeRoom,[name,chatList,memberList],function (err,results){
  if(err){console.error(err)}
  return "room_made"
})
}

function addMember(member,role,room){
  let memberList=`${room}MemberList`
  let SQL_findMember = 'SELECT * FROM members WHERE username = ?'
  let SQL_insertMember = `INSERT INTO ${memberList} (name,role,dateAdded) values(?,?,?)`
  let SQL_getMember = `SELECT * FROM ${memberList} WHERE name = ?`
  let SQL_addToMemberToRoom =`INSERT INTO memberToRoom (memberName,chatName) values(?,?)`
  //check if member is already in room
  db.all(SQL_getMember,[member],(err,results)=>{
    if(err){console.error(err)}
    console.log(results)
    if(!results.length>=1){
      //already in room
      db.all(SQL_findMember,[member],(err3,results3)=>{
        if(err3){console.error(err3)}
          //add member
          if(results3.length==1){
            console.log(results3)
            let date = Date.now()
            db.run(SQL_insertMember,[member,role,date],(err2,results2)=>{
              if(err2){console.error(err2)}
              db.run(SQL_addToMemberToRoom,[member,room],(err4,results4)=>{
                if(err4){console.error(err4)}
              })
            })
          }
      })
    }
  })  
}
//makeRoom('testChat','maker')
function saveMessage(sender,room,chat,message){
  //check if is member of room
  let memberList=`${room}MemberList`
  let SQL_checkMember = `SELECT * FROM ? WHERE name = ?`
  db.run(SQL_checkMember,[memberList,sender],(err,results)=>{
    if(err){console.error(err)}
    console.log(results)
  })
  //save chat to proper chat room message list
  //return save status 
}

function makeChat(roomName,chatName,maker){
  let chatList = `${roomName}ChatList`
  let messageTable = `${roomName}_${chatName}`
  let date = Date.now()
  let SQL_findChatList =`SELECT * FROM ${chatList} WHERE name = ?`
  let SQL_makeChat = `INSERT INTO ${chatList}(name,dateCreated) values(?,?)`
  let SQL_makeMessageTable=`CREATE TABLE ${messageList} (id PRIMARY KEY AUTOINCREMENT, name TEXT, message TEXT,date INTEGER)`

  console.log(SQL_findChatList)
  db.run(SQL_findChatList,[chatName],function(err,results){
    if(err){console.error(err)} //log error
    if(results=undefined){
      //create new chat entry
      db.run(SQL_makeChat,[chatName],function(err2,results2){
        if(err2){console.error(err2)}
        //create new message table
        db.run(SQL_makeMessageTable,[],function(err3,results3){
          if(err3){console.error(err3)}
        })
      })
    }
  })
}
//makeChat('testChat','chatName','maker')
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
    //console.log(chalk.bold.redBright("fix-password"))
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
      //console.log(chalk.green(hash))
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

