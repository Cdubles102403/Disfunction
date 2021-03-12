const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const sql = require('sqlite3').verbose();
const crypto = require('crypto')
const functions = require('./serverReusables/function.js')
const cookieParser = require("cookie-parser");


const db = new sql.Database('./db/database.db'); //creates connection to DB

const PORT = 8080; //port to start on

app.use(cookieParser())
app.use(express.json())
app.use(express.static('views'))
app.use(express.static('public'))

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('sendMessage',(payload)=>{
      //console.log(payload)
      try {
        let decodedToken = functions.verifyJWT(payload.token)
        console.log(decodedToken) 
        let msgSan = functions.sanitize(payload.message)
        let message = `${msgSan}-${decodedToken.data.username}`
        socket.broadcast.emit("msg",message)
        socket.emit("msg",message)
      } catch (error) {
        console.log(error)
        socket.emit('login')
        return
      }
    })
  });

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
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
      console.log(results)
      if(functions.hasher(password)==results[0].password){
        console.log(`succesful login for ${username}`)
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

app.post('/authenticateToken',(req,res)=>{

})
//signup route
app.post('/signup',(req,res)=>{
  let body = req.body;
  console.log(body)
  let email = functions.sanitize(body.email)
  let username = functions.sanitize(body.username)
  let password = body.password
  var passwordR = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/g
  //check password
  if(!password.match(passwordR)){
    console.log("fix-password")
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
      console.log(hash)
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

