const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const sql = require('sqlite3').verbose();

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

app.post('/signup',(req,res)=>{

})

function sanitize(string) { //stop xss
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    }
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match)=>(map[match]));
  }