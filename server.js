const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = 8080;

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