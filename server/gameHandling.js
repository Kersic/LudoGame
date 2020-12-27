const {getRoom, removeRoom} = require('./rooms');
const {getTimeStringFromSeconds} = require('./helperFunctions');
const {words} = require('./words');
const userModel = require('./Models/user');
const {getPathToNewPosition} = require("./ludoBoard");
const {arrayOfPointsIncludes} = require("./helperFunctions");
const {getHomePositions} = require("./ludoBoard");
const {getStartPosition} = require("./ludoBoard");
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
                io.to(roomId).emit('message', { user: null, text: user.username + " rolled " + newValue });
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
    io.to(room.id).emit('message', { user: null, text: "First player is " + firstUser.username });
}

const handlePossibleActions = (newValue, room, io, socket) => {
    console.log("handle possible actions");
    if (newValue === 6) {
        console.log("rolled 6");
        room.canCurrentPlayerRollDice = false;
        room.canCurrentPlayerMoveFigure = true;
    } else if(hasFiguresOnField(room.currentPlayer)) {
        console.log("has figures on filed");
    } else {
        room.canCurrentPlayerRollDice = true;
        room.canCurrentPlayerMoveFigure = false;
    }

    room.currentPlayerRollsLeft = room.currentPlayerRollsLeft - 1;
    console.log(room.currentPlayerRollsLeft + " rolls left");
    if (room.currentPlayerRollsLeft <= 0 && !room.canCurrentPlayerMoveFigure) {
        room.currentPlayer = getNextPlayer(room);
        room.currentPlayerRollsLeft = getNumberOfRolls(room.currentPlayer);
        room.canCurrentPlayerRollDice = true;
    }

    sendGameState(io, room);
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

    if(arrayOfPointsIncludes(getInitialsPositions(currentPlayerColor),playerPosition)){
        if(room.currentDiceValue === 6) {
            room.currentPlayer.positions.splice(figureIndex, 1);
            room.currentPlayer.positions.push(getStartPosition(currentPlayerColor));
        } else {
            return callback({ error: "Can not move this figure." });
        }
    } else {
        const result = getPathToNewPosition(playerPosition, room.currentDiceValue, currentPlayerColor)
        if(result.error){
            return callback({ error: "Can not move this figure." });
        } else {
            console.log("move path");
            console.log(result.path);
            room.currentPlayer.positions.splice(figureIndex, 1);
            room.currentPlayer.positions.push(result.path[result.path.length-1]);
        }
    }

    callback();
    sendGameState(io, room);
}

// const nextPlayerCountDown = (io, roomId) => {
//     const {room} = getRoom(roomId);
//
//     const possiblePlayers = room.users.filter(u => u.active && !u.hasPlayed);
//     if(possiblePlayers && possiblePlayers.length > 0){
//        room.currentPlayer = possiblePlayers[Math.floor(Math.random() * possiblePlayers.length)];
//        room.currentPlayer.hasPlayed = true;
//     } else {
//         //round points
//         let winner = null;
//         let tie = false;
//         room.users.forEach((u) => {
//             u.pointsThisGame = Math.round(u.pointsThisGame / 10) * 10;
//             if((u.pointsThisGame > 0  && !winner) || (winner && winner.pointsThisGame < u.pointsThisGame)){
//                 winner = u;
//                 tie = false;
//             } else if(winner && winner.pointsThisGame === u.pointsThisGame) {
//                 tie = true;
//             }
//         });
//         io.to(roomId).emit('timeCountdown', { time: "0:00", users: room.users});
//         io.to(roomId).emit('gameFinished', winner && !tie ? winner.username : null);
//
//         //save points
//         room.users.forEach((u) => {
//             userModel.findOne({_id: u._id})
//                 .then(user => {
//                     if(user && winner) {
//                         userModel.updateOne(
//                             {_id: u._id},
//                             {
//                                 $set: {
//                                     points: user.points + u.pointsThisGame,
//                                     numberOfPlayedGames: user.numberOfPlayedGames + 1,
//                                     numberOfWins: user.numberOfWins + winner && winner.username === user.username ? 1 : 0,
//                                 }
//                             })
//                             .then(() => {
//                                 removeRoom(roomId);
//                             })
//                             .catch(err => {
//                                 console.log(err);
//                                 removeRoom(roomId);
//                             });
//                     }
//                 });
//         });
//         return;
//     }
//
//     const allGames =  room.users.filter(u => u.active || (!u.hasPlayed && u.hasPlayed));
//     const playedGames =  room.users.filter(u => u.hasPlayed);
//     if(allGames && playedGames)
//         room.gamesPlayed = playedGames.length + "/" + allGames.length;
//
//     room.currentWord = words[Math.floor(Math.random() * words.length)];
//     io.to(room.currentPlayer.socketId).emit('currentWord', room.currentWord);
//     let counter = 4;
//     let countDown = setInterval(() => {
//         counter--;
//         io.to(roomId).emit('nextPlayerCountdown', { currentPlayer: room.currentPlayer.username, time: counter, gamesPlayed: room.gamesPlayed});
//         if(counter === 0){
//             clearInterval(countDown);
//             remainingTimeCountDown(io, roomId);
//         }
//     }, 1000);
//
//     //console.log("test message send");
//     //io.to(roomId).emit('message', { user: null, text: `Test message`});
// }
//
// const remainingTimeCountDown = (io, roomId) => {
//     const {room} = getRoom(roomId);
//
//     room.counter = playerTime;
//     room.countDown = setInterval(() => {
//         room.counter--;
//         io.to(roomId).emit('timeCountdown', { time: getTimeStringFromSeconds(room.counter), users: room.users});
//         if(room.counter <= 0){
//             room.currentPlayer = null;
//             clearInterval(room.countDown);
//             showResultAndGivePoints(io, roomId, null);
//         }
//     }, 1000);
// }

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