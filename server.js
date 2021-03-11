const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const sql = require('sqlite3').verbose();
const crypto = require('crypto')
const functions = require('./serverReusables/function.js')
app.use(express.json())

const db = new sql.Database('./db/database.db'); //creates connection to DB

const PORT = 8080; //port to start on

app.use(express.static('views'))
app.use(express.static('public'))

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('sendMessage',(msg)=>{
      console.log(msg)
      let msgSan = sanitize(msg)
      socket.broadcast.emit("msg",msgSan)
      socket.emit("msg",msgSan)
    })
  });

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
//login route
app.post('/login',(req,res)=>{

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
      res.send({message:'redirect', target:"/"})
    }
    else{ //already exists
      res.send({message:"already-exists"})
    }
  })
})

