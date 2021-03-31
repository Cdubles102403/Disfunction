const sql = require('sqlite3').verbose();
const db = new sql.Database('./db/database.db'); 

var functions = {
  makeChat: function(roomName,chatName,maker){
      let chatList = `${roomName}ChatList`
      let messageTable = `${roomName}_${chatName}`
      let date = Date.now()
      let SQL_findChatList =`SELECT * FROM ${chatList} WHERE name = ?`
      let SQL_makeChat = `INSERT INTO ${chatList}(name,messageList,dateCreated) values(?,?,?)`
      let SQL_makeMessageTable=`CREATE TABLE ${messageTable} (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, message TEXT,date INTEGER)`
    
      console.log(SQL_findChatList)
      db.all(SQL_findChatList,[chatName],function(err,results){
        if(err){console.error(err)} //log error
        console.log(results)
        if(results.length==0){
          //create new chat entry
          db.run(SQL_makeChat,[chatName,messageTable,date],function(err2,results2){
            if(err2){console.error(err2)}
            //create new message table
            db.run(SQL_makeMessageTable,[],function(err3,results3){
              if(err3){console.error(err3)}
            })
          })
        }
      })
    },
  saveChat: function(sender,room,chat,message){
    //check if is member of room
    let memberList=`${room}MemberList`
    let SQL_checkMember = `SELECT * FROM ${memberList} WHERE name = ?`
    let chatRoom = `${room}_${chat}`
    let SQL_saveChat =`INSERT INTO ${chatRoom} (name,message,date) values(?,?,?)`
    let date = Date.now()
    db.all(SQL_checkMember,[sender],(err,results)=>{
      if(err){console.error(err)}
      console.log(results)
      if(results.length>0){
        //member in chat
        db.run(SQL_saveChat,[sender,message,date],(err)=>{
          if(err){console.error(err)}
        })
      }
    })
  }
}
module.exports = functions