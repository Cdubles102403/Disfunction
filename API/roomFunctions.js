const sql = require('sqlite3').verbose();
const db = new sql.Database('./db/database.db'); //creates connection to DB

let functions = {
  //make a new room
  makeRoom: function(name,maker){
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
      },
      //add a member to a room
  addMember:function (member,role,room){
    let memberList=`${room}MemberList`
    let SQL_findMember = 'SELECT * FROM members WHERE username = ?'
    let SQL_insertMember = `INSERT INTO ${memberList} (name,role,dateAdded) values(?,?,?)`
    let SQL_getMember = `SELECT * FROM ${memberList} WHERE name = ?`
    let SQL_addToMemberToRoom =`INSERT INTO memberToRoom (memberName,roomName) values(?,?)`
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
}

module.exports = functions