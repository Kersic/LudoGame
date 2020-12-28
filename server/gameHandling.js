const {PlayerHasFigureOnField} = require("./ludoBoard");
const {KickPlayerFromField} = require("./ludoBoard");
const {getNewFigurePosition} = require("./ludoBoard");
const {getRoom} = require('./rooms');
const {CanMovePlayer} = require("./ludoBoard");
const {getNextPlayer} = require("./ludoBoard");
const {getNumberOfRolls} = require("./ludoBoard");
const {hasFiguresOnField} = require("./ludoBoard");
const {isUserInRoom} = require("./rooms");

const {getInitialsPositions, PlayerColor} = require('./ludoBoard');

const handleGame = (socket, io, roomId) => {
    console.log("handle game");

    setTimeout(()=> {
        const {room} = getRoom(roomId);

        room.users.map((player, playerIndex) => {
            switch (playerIndex) {
                case 0:
                    player.color = PlayerColor.RED;
                    break;
                case 1:
                    player.color = PlayerColor.GREEN;
                    break;
                case 2:
                    player.color = PlayerColor.YELLOW;
                    break;
                case 3:
                    player.color = PlayerColor.BLUE;
                    break;

            }
            player.positions = getInitialsPositions(player.color);
        })
        room.canCurrentPlayerRollDice = true;
        sendGameState(io, room);
    }, 500);
}

const sendGameState = (io, room) => {
    io.to(room.id).emit('gameState', {
        users: room.users,
        currentPlayer: room.currentPlayer,
        canRollDice: room.canCurrentPlayerRollDice,
        diceValue: room.currentDiceValue,
        canMoveFigure: room.canCurrentPlayerMoveFigure,
    });
}

const rollDice = (roomId, tokenUser, callback, io, socket) => {
    const { error, room } = isUserInRoom(roomId, tokenUser);
    if(error) return callback(error);

    const newValue = Math.floor(Math.random() * Math.floor(6) + 1);
    console.log(tokenUser.username + " rolled " + newValue);

    let firstDiceValuesNum = 0
    room.users.map(user => {
            if(user.firstDiceValue === 0 && user.username === tokenUser.username){
                user.firstDiceValue = newValue;
                //io.to(roomId).emit('message', { user: null, text: user.username + " rolled " + newValue });
            }
            if(user.firstDiceValue !== 0 && user.active){
                firstDiceValuesNum++;
            }
        }
    )

    if(!room.firstPlayerSelected && firstDiceValuesNum === room.users.filter(user => user.active).length) {
        setFirstPayer(room, io);
        room.firstPlayerSelected = true;
    } else if (!room.firstPlayerSelected) {
        socket.emit('gameState', {users: room.users, currentPlayer: room.currentPlayer, canRollDice: false, canMoveFigure: false});
    } else if (room.firstPlayerSelected) {
        room.currentDiceValue = newValue;
        socket.to(room.id).emit('currentPlayerRolledDice', {value: newValue});
        io.to(room.id).emit('gameMessage', "");
        handlePossibleActions(newValue, room, io, socket)
    }
    return callback(newValue);
}

const setFirstPayer = (room, io) => {
    console.log("set first player");
    let firstUser = null;
    room.users.map(user => {
        if(firstUser === null || user.firstDiceValue > firstUser.firstDiceValue) {
            firstUser = user;
        }
    });
    room.currentPlayer = firstUser;
    room.currentPlayerRollsLeft = getNumberOfRolls(room.currentPlayer);
    console.log(room.currentPlayer.username + " has " + room.currentPlayerRollsLeft + " rolls left");
    room.canCurrentPlayerRollDice = true;
    sendGameState(io, room);
    io.to(room.id).emit('gameMessage', "First player is " + firstUser.username);
}

const handlePossibleActions = (newValue, room, io, socket) => {
    console.log("handle possible actions");
    room.currentPlayerRollsLeft = room.currentPlayerRollsLeft - 1;

    //set rolls left
    if (newValue === 6) {
        room.currentPlayerRollsLeft = 1;
    } else if(hasFiguresOnField(room.currentPlayer)) {
        room.currentPlayerRollsLeft = 0;
    }

    //set figure movement or next player
    if(CanMovePlayer(room.currentPlayer, room.currentDiceValue)) {
        console.log("set figure moving");
        room.canCurrentPlayerRollDice = false;
        room.canCurrentPlayerMoveFigure = true;
        sendGameState(io, room);
    } else {
        setNextPlayer(io, room);
    }

}

const handleMove = (roomId, tokenUser, playerPosition, callback, io, socket) => {
    console.log(playerPosition)
    const { error, room } = isUserInRoom(roomId, tokenUser);
    if(error) return callback(error);

    if(room.currentPlayer.username !== tokenUser.username) return callback({error: 'Can not move another player figures'});

    const currentPlayerColor = room.currentPlayer.color;
    const figureIndex = room.currentPlayer.positions.findIndex((p) => p[0] === playerPosition[0] && p[1] === playerPosition[1]);

    if(figureIndex === -1)  {
        return callback({ error: "Can not move figure. Figure not found" });
    }

    const newPosition = getNewFigurePosition(room.currentDiceValue, currentPlayerColor, playerPosition);

    if(newPosition.error) {
        console.log(newPosition.error);
        return callback({error: newPosition.error});
    } else if(PlayerHasFigureOnField(room.currentPlayer, newPosition.position) ) {
        console.log("Can not kick out yur own figure");
        return callback({error: "Can not kick out yur own figure"});
    } else {
        KickPlayerFromField(room, newPosition.position);
        room.currentPlayer.positions.splice(figureIndex, 1);
        room.currentPlayer.positions.push(newPosition.position);
        setNextPlayer(io, room);
    }

    callback({error: ""});
}

const setNextPlayer = (io, room) => {
    if (room.currentPlayerRollsLeft <= 0) {
        console.log("set next player dice roll");
        room.currentPlayer = getNextPlayer(room);
        room.currentPlayerRollsLeft = getNumberOfRolls(room.currentPlayer);
    } else {
        console.log("set same player dice roll");
    }
    room.canCurrentPlayerRollDice = true;
    room.canCurrentPlayerMoveFigure = false;

    sendGameState(io, room);
}

const showResultAndGivePoints = (io, roomId, user) => {
    // const {room} = getRoom(roomId);
    // io.to(roomId).emit('roundFinished');
    // if(user !== null){
    //     clearInterval(room.countDown);
    //
    //     //give points
    //     const points = (room.counter * 100) / playerTime;
    //     const winner = room.users.find(u => u.username === user.username);
    //     if(winner) winner.pointsThisGame += Math.floor(points);
    //     const currentPlayer = room.users.find(u => u.username === room.currentPlayer.username);
    //     if(currentPlayer) currentPlayer.pointsThisGame += Math.floor(points / 2);
    //     io.to(roomId).emit('timeCountdown', { time: "0:00", users: room.users});
    //
    //
    //     io.to(roomId).emit('result', { winner: user.username, word: room.currentWord});
    // } else {
    //     io.to(roomId).emit('result', { winner: null, word: room.currentWord});
    // }
    // room.currentPlayer = null;
    // room.currentWord = "";
    //
    // setTimeout(()=>nextPlayerCountDown(io, roomId), 4000);
}

module.exports = {handleGame, showResultAndGivePoints, rollDice, handleMove};