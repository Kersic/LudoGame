const {getDataFromToken} = require("./helperFunctions");
const userModel = require('./Models/user');
const {addUserInRoom, removeUserFromRoom, setUserInactive, startGame, isUserInRoom, isUserDrawing, removeInactivePlayersFromRoom} = require('./rooms');
const {handleGame, showResultAndGivePoints} = require('./gameHandling');

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
                        socket.emit('message', { user: null, text: `Welcome ${user.username}! Guess what other players are drawing with typing the exact word into the chat.`});
                        socket.emit('nextPlayerCountdown', { currentPlayer: userRoom.currentPlayer ? userRoom.currentPlayer.username: null, time: 0, gamesPlayed: userRoom.gamesPlayed});
                        if(userRoom.currentPlayer && user.username === userRoom.currentPlayer.username){
                            socket.emit('currentWord', userRoom.currentWord);
                        }
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
            const { error, room } = isUserInRoom(roomId, tokenData.user);
            if(error) return callback(error);
            io.to(roomId).emit('message', { user: tokenData.user.username, text: message });
            callback();

            try{
                if(message.toLowerCase() === room.currentWord.toLowerCase()){
                    userModel.findOne({_id: tokenData.user._id})
                        .then(user => {
                            if(room.currentPlayer && user.username !== room.currentPlayer.username)
                                showResultAndGivePoints(io, roomId, user);
                        })
                }
            } catch (e) {
                //console.log(e);
            }
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

    socket.on('canvasData', ({token, roomId, canvasData}) => {
        getDataFromToken(token, (tokenData) => {
            const { isDrawing, error } = isUserDrawing(roomId, tokenData.user);
            if(error || !isDrawing) return;
            socket.broadcast.to(roomId).emit('canvasDataUpdate', canvasData);
        })
    });

    socket.on('disconnect', () => {
        console.log("user has left");
        setUserInactive(socket.id);
    })
}

module.exports = {handleConnection}
