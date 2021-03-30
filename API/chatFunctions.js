const sql = require('sqlite3').verbose();
const db = new sql.Database('./db/database.db'); 

var functions = {
    makeChat: function(roomName,chatName,maker){
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
}
module.exports = functions