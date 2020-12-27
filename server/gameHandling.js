const {getRoom, removeRoom} = require('./rooms');
const {getTimeStringFromSeconds} = require('./helperFunctions');
const {words} = require('./words');
const userModel = require('./Models/user');
const {isUserInRoom} = require("./rooms");

const {getStartPositions, PlayerColor} = require('./ludoBoard');

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
            player.positions = getStartPositions(player.color);
        })
        io.to(roomId).emit('gameState', {users: room.users, currentPlayer: null});
    }, 500);
}

const rollDice = (roomId, tokenUser, callback, io, socket) => {
    const { error, room } = isUserInRoom(roomId, tokenUser);
    if(error) return callback(error);

    const newValue = Math.floor(Math.random() * Math.floor(6) + 1);

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
    } else if (room.firstPlayerSelected) {
        socket.to(room.id).emit('currentPlayerRolledDice', {value: newValue});
    }
    return callback(newValue);
}

const setFirstPayer = (room, io) => {
    let firstUser = null;
    room.users.map(user => {
        if(firstUser === null || user.firstDiceValue > firstUser.firstDiceValue) {
            firstUser = user;
        }
    });
    room.currentPlayer = firstUser;
    io.to(room.id).emit('gameState', {users: room.users, currentPlayer: room.currentPlayer});
    io.to(room.id).emit('message', { user: null, text: "First player is " + firstUser.username });
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

module.exports = {handleGame, showResultAndGivePoints, rollDice};