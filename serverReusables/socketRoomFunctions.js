let roomFunctions = {
    makeRoom: function (name) {
        let room = {
            'name':name,
            members:{}
        }
        return room
    },
    addToRoom:function (name){},
    takeFromRoom: function (name){},   
}

module.exports = roomFunctions