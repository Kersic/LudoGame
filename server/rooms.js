const { uuid } = require('uuidv4');

const rooms = [
    {
        id: uuid(),
        name: 'Room 1',
        users:[],
        hasStarted:false,
        currentPlayer: null,
        currentPlayerRollsLeft: 0,
        canCurrentPlayerRollDice: true,
        canCurrentPlayerMoveFigure: false,
        firstPlayerSelected: false,
        currentDiceValue: 1,
    },
    {
        id: uuid(),
        name: 'Room 2',
        users:[],
        hasStarted:false,
        currentPlayer: null,
        currentPlayerRollsLeft: 0,
        canCurrentPlayerRollDice: true,
        canCurrentPlayerMoveFigure: false,
        firstPlayerSelected: false,
        currentDiceValue: 1,
    },
    {
        id: uuid(),
        name: 'Room 3',
        users:[],
        hasStarted:false,
        currentPlayer: null,
        currentPlayerRollsLeft: 0,
        canCurrentPlayerRollDice: true,
        canCurrentPlayerMoveFigure: false,
        firstPlayerSelected: false,
        currentDiceValue: 1,
    },
    {
        id: uuid(),
        name: 'Room 4',
        users:[],
        hasStarted:false,
        currentPlayer: null,
        currentPlayerRollsLeft: 0,
        canCurrentPlayerRollDice: true,
        canCurrentPlayerMoveFigure: false,
        firstPlayerSelected: false,
        currentDiceValue: 1,
    },
];

const addUserInRoom = ( socketId, user, roomId ) => {
    const room = rooms.find((room) => room.id === roomId);
    if(!room) return { error: 'Room not found' };

    const userIndex = room.users.findIndex((u) => u._id.toString() === user._id.toString());
    if(userIndex > -1){
        console.log("user set active");
        room.users[userIndex].active = true;
        room.users[userIndex].socketId = socketId;
        return { userRoom: room, gameStarted: room.hasStarted};

    } else if(!room.hasStarted) {
        const newUser = {
            socketId: socketId,
            _id: user._id,
            username: user.username,
            allPoints: user.points,
            pointsThisGame: 0,
            hasPlayed: false,
            active: true,
            positions: [],
            color: null,
            firstDiceValue: 0,
        }
        room.users.push(newUser);
        console.log("user added");
        return { userRoom: room, gameStarted: room.hasStarted};
    } else {
        return { error: 'Game has started. Cannot add new players' }
    }
}

const removeUserFromRoom = (userId, roomId) => {
    const room = rooms.find((room) => room.id === roomId);
    if(!room) return { error: 'Room not found' };
    if(room.hasStarted) return { error: 'Game has started. Cannot remove players' }

    const userIndex = room.users.findIndex((u) => u._id.toString() === userId.toString());
    if(userIndex > -1){
        room.users.splice(userIndex, 1);
        return { error: null };
    } else {
        return { error: "User is not in room" };
    }
}

const setUserInactive = (socketId) => {
    let userFound = false;

    rooms.map((room)=> {
        const userIndex = room.users.findIndex((u) => u.socketId.toString() === socketId.toString());
        if(userIndex > -1){
            userFound = true;
            room.users[userIndex].active = false;
            console.log("user set inactive");
            return { error: null };
        }
    })

    return { error: "User not found in any room" };
}

const startGame = (roomId, authData) => {
    const room = rooms.find((room) => room.id === roomId);
    if(!room) return { error: 'Room not found' };
    if(room.hasStarted) return { error: 'Has already started' };
    const userIndex = room.users.findIndex((u) => u._id.toString() === authData._id.toString());
    if(userIndex === -1) return { error: 'User is not in room. Cant start game' };

    if(room.users.filter(u=>u.active).length < 2) return { error: 'Not enough players' };
    room.hasStarted = true;
    console.log("start game");
    return {};
}

const isUserInRoom = (roomId, authData) => {
    const room = rooms.find((room) => room.id === roomId);
    if(!room) return { error: 'Room not found' };
    const userIndex = room.users.findIndex((u) => u._id.toString() === authData._id.toString());
    if(userIndex === -1) return { error: 'User is not in room. Cant start game' };

    return {userInRoom: true, room: room}
}

// const isUserDrawing = (roomId, authData) => {
//     const room = rooms.find((room) => room.id === roomId);
//     if(!room) return { error: 'Room not found' };
//     if(!room.currentPlayer) return { error: 'No current user fund' };
//     if(room.currentPlayer && room.currentPlayer._id.toString() === authData._id.toString())
//         return { isDrawing: true }
//     else
//         return { isDrawing: false }
// }

const getRoom = (roomId) => {
    const room = rooms.find((room) => room.id === roomId);
    if(!room) return { error: 'Room not found' };
    return {room}
}

const removeRoom = (roomId) => {
    const roomIndex = rooms.findIndex((r) => r.id.toString() === roomId.toString());
    if(roomIndex > -1){
        rooms.splice(roomIndex, 1)
    }
}

const removeInactivePlayersFromRoom = (roomId) => {
    const {room} = getRoom(roomId);
    const inactiveIndexes = room.users.map((user, index) => !user.active ? index : null);
    if(inactiveIndexes && inactiveIndexes.length > 0) inactiveIndexes.filter(i=>i !== null).map(index => room.users.splice(index, 1));
}

module.exports = {
    rooms,
    addUserInRoom,
    removeUserFromRoom,
    setUserInactive,
    startGame,
    isUserInRoom,
    getRoom,
    removeRoom,
    removeInactivePlayersFromRoom
};