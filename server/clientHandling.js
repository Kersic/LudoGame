const {getDataFromToken} = require("./helperFunctions");
const userModel = require('./Models/user');
const {setNextPlayer} = require("./gameHandling");
const {rooms} = require("./rooms");
const {handleMove} = require("./gameHandling");
const {rollDice} = require("./gameHandling");
const {addUserInRoom, removeUserFromRoom, setUserInactive, startGame, isUserInRoom, removeInactivePlayersFromRoom} = require('./rooms');
const {handleGame} = require('./gameHandling');

const handleConnection = (socket, io) => {
    socket.on('join', ({ roomId, token }, callback) => {
        console.log("user joined");
        getDataFromToken(token, (tokenData) => {
            userModel.findOne({_id: tokenData.user._id})
                .then(user => {
                    const { userRoom, gameStarted, error } = addUserInRoom(socket.id, user, roomId );
                    if(error) return callback(error);
                    socket.join(userRoom.id);
                    callback();
                    if(gameStarted) {
                        socket.emit('message', { user: null, text: `Welcome ${user.username}! Roll a dice! The player with highest number will start.`});
                        socket.emit('gameState', {
                            users: userRoom.users,
                            currentPlayer: userRoom.currentPlayer,
                            canRollDice: userRoom.canCurrentPlayerRollDice,
                            diceValue: userRoom.currentDiceValue,
                            canMoveFigure: userRoom.canCurrentPlayerMoveFigure,
                        });
                    }

                    if(userRoom.users.filter(i=>i.active).length >= 4){
                        console.log("room is full startGame");
                        getDataFromToken(token, (tokenData) => {
                            //removeInactivePlayersFromRoom(roomId);
                            const { error } = startGame(roomId, tokenData.user);
                            if(error) return callback(error);
                            callback();
                            io.to(roomId).emit('gameStarted');
                            handleGame(socket, io, roomId);
                        }, (err) => {
                            return callback(err);
                        });
                    }
                })
                .catch(() => {
                    return callback("User not found");
                });

        }, (err) => {
            return callback(err);
        });
    });

    socket.on('sendMessage', ({token, roomId, message}, callback) => {
        console.log("send Message");
        getDataFromToken(token, (tokenData) => {
            const { error } = isUserInRoom(roomId, tokenData.user);
            if(error) return callback(error);
            io.to(roomId).emit('message', { user: tokenData.user.username, text: message });
            callback();

        }, (err) => {
            return callback(err);
        });

    });

    socket.on('leaveRoom', ({roomId, token}, callback) => {
        console.log("user left room");
        getDataFromToken(token, (tokenData) => {
            const { error } = removeUserFromRoom(tokenData.user._id, roomId);
            if(error) return callback(error);
            callback();
        }, (err) => {
            return callback(err);
        });
    });

    socket.on('startGame', ({roomId, token}, callback) => {
        console.log("startGame");
        getDataFromToken(token, (tokenData) => {
            removeInactivePlayersFromRoom(roomId);
            const { error } = startGame(roomId, tokenData.user);
            if(error) return callback(error);
            io.to(roomId).emit('gameStarted');
            callback();
            handleGame(socket, io, roomId);
        }, (err) => {
            return callback(err);
        });
    });

    socket.on('rollDice', ({roomId, token}, callback) => {
        getDataFromToken(token, (tokenData) => {
            rollDice(roomId, tokenData.user, callback, io, socket);
        }, (err) => {
            return callback(err);
        });
    })

    socket.on('movePlayer', ({roomId, token, playerPosition}, callback) => {
        getDataFromToken(token, (tokenData) => {
            handleMove(roomId, tokenData.user, playerPosition, callback, io, socket);
        }, (err) => {
            return callback(err);
        });
    })

    socket.on('disconnect', () => {
        console.log("user has left");
        setUserInactive(socket.id, io);
        rooms.map((room) => {
            if(room.hasStarted) {
                const userIndex = room.users.findIndex((u) => u.socketId.toString() === socket.id.toString());
                if (userIndex > -1) {
                    if (room.currentPlayer && room.users[userIndex].username === room.currentPlayer.username) {
                        room.currentPlayerRollsLeft = 0;
                        setNextPlayer(io, room);
                    }
                }
            }
        })
    })
}

module.exports = {handleConnection}
