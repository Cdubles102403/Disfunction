//get rid of all rooms and connecting Databases
const sql = require('sqlite3').verbose();
const db = new sql.Database('./db/database.db'); //creates connection to DB

let SQL_getAllRooms =`SELECT * FROM roomDirectory`
db.all(SQL_getAllRooms,[],(err,results)=>{
    if(err){console.error(err)}
  //  console.log(results)
    //delete all tables
    for(let i=0; i<results.length;i++){
        console.log(`deleting Room: ${results[i].name}`)
        let SQL_deleteDirectory =  `DELETE FROM roomDirectory WHERE id=?`
        db.run(SQL_deleteDirectory,[results[i].id],(err)=>{if(err)console.error(err)})
        let SQL_deleteTable = `DROP TABLE ${results[i].name}`
        db.run(SQL_deleteTable,[],(err)=>{if(err)console.error(err)})
        SQL_deleteTable = `DROP TABLE ${results[i].chatList}`
        db.run(SQL_deleteTable,[],(err)=>{if(err)console.error(err)})
        SQL_deleteTable = `DROP TABLE ${results[i].memberList}`
        db.run(SQL_deleteTable,[],(err)=>{if(err)console.error(err)})
    }
    //rest sequence ID
    let SQl_resetSequence = 'UPDATE sqlite_sequence SET seq = 0 WHERE name = "roomDirectory"'
    db.run(SQl_resetSequence,[],(err)=>{if(err)console.error(err)})
})