const {getRoom, removeRoom} = require('./rooms');
const {getTimeStringFromSeconds} = require('./helperFunctions');
const {words} = require('./words');
const userModel = require('./Models/user');

const playerTime = 3*60;

const handleGame = (socket, io, roomId) => {
    console.log("handle game");
    //setTimeout(()=>nextPlayerCountDown(io, roomId), 1000);
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

module.exports = {handleGame, showResultAndGivePoints};