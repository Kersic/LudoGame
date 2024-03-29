const {removeRoom} = require("./rooms");
const {getHomePositions} = require("./ludoBoard");
const {HasFinished} = require("./ludoBoard");
const {PlayerHasFigureOnField} = require("./ludoBoard");
const {KickPlayerFromField} = require("./ludoBoard");
const {getNewFigurePosition} = require("./ludoBoard");
const {getRoom} = require('./rooms');
const {CanMovePlayer} = require("./ludoBoard");
const {getNextPlayer} = require("./ludoBoard");
const {getNumberOfRolls} = require("./ludoBoard");
const {hasFiguresOnField} = require("./ludoBoard");
const {isUserInRoom} = require("./rooms");
const userModel = require('./Models/user');
const {getInitialsPositions} = require("./ludoBoard");
const {getStopPosition} = require("./ludoBoard");

const {PlayerColor} = require('./ludoBoard');

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
            // player.positions = getHomePositions(player.color);
            // player.positions.splice(1, 1);
            // player.positions.push(getStopPosition(player.color));
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

const handlePossibleActions = (newValue, room, io) => {
    console.log("handle possible actions");
    room.currentPlayerRollsLeft = room.currentPlayerRollsLeft - 1;

    //set rolls left
    if (newValue === 6) {
        room.currentPlayerRollsLeft = 1;
    } else if(hasFiguresOnField(room.currentPlayer)) {
        room.currentPlayerRollsLeft = 0;
    }

    //set figure movement or next player
    if(CanMovePlayer(room.currentPlayer, room.currentDiceValue, room)) {
        console.log("set figure moving");
        room.canCurrentPlayerRollDice = false;
        room.canCurrentPlayerMoveFigure = true;
        sendGameState(io, room);
    } else {
        setNextPlayer(io, room);
    }

}

const handleMove = (roomId, tokenUser, playerPosition, callback, io) => {
    console.log(playerPosition)
    const { error, room } = isUserInRoom(roomId, tokenUser);
    if(error) return callback(error);

    if(room.currentPlayer.username !== tokenUser.username) return callback({error: 'Can not move another player figures'});

    const currentPlayerColor = room.currentPlayer.color;
    const figureIndex = room.currentPlayer.positions.findIndex((p) => p[0] === playerPosition[0] && p[1] === playerPosition[1]);

    if(figureIndex === -1)  {
        return callback({ error: "Can not move figure. Figure not found" });
    }

    const newPosition = getNewFigurePosition(room.currentDiceValue, currentPlayerColor, playerPosition, room);

    if(newPosition.error) {
        console.log(newPosition.error);
        return callback({error: newPosition.error});
    } else if(PlayerHasFigureOnField(room.currentPlayer, newPosition.position) ) {
        console.log("Can not kick out yur own figure");
        return callback({error: "Can not kick out yur own figure"});
    } else {
        KickPlayerFromField(io, room, newPosition.position);
        room.currentPlayer.positions.splice(figureIndex, 1);
        room.currentPlayer.positions.push(newPosition.position);
        setNextPlayer(io, room);
    }

    callback();
}

const setNextPlayer = (io, room) => {
    // return if there is no active players
    let hasActivePlayers = false;
    room.users.map(user => {
        if(user.active){
            hasActivePlayers = true;
        }
    })

    if(!hasActivePlayers) {
        removeRoom(room.id);
        return;
    }

    //check if player finished game
    if(HasFinished(room.currentPlayer)){
        let place = 0;
        room.users.map(user => {
            if(HasFinished(user)) place++;
        })

        if(place === 1) {
            io.to(room.id).emit('gameMessage', room.currentPlayer.username + " won!");
        }
        else if (place > 1) {
            io.to(room.id).emit('gameMessage', room.currentPlayer.username + " took the " + place + ". place!");
        }

        io.to(room.id).emit('wonAnimation');

        console.log("updating current player " + room.currentPlayer.username);
        //save score
        userModel.findOne({_id: room.currentPlayer._id})
            .then(user => {
                userModel.updateOne(
                    {_id: user._id},
                    {
                        $set: {
                            numberOfPlayedGames: user.numberOfPlayedGames + 1,
                            firstPlaces: (user.firstPlaces ? user.firstPlaces : 0) + (place === 1 ? 1 : 0),
                            secondPlaces: (user.secondPlaces ? user.secondPlaces : 0) + (place === 2 ? 1 : 0),
                            thirdPlaces: (user.thirdPlaces ? user.thirdPlaces : 0) + (place === 3 ? 1 : 0),
                            fourthPlaces: (user.fourthPlaces ? user.fourthPlaces : 0) + (place === 4 ? 1 : 0),
                        }
                    }).then(() => {
                    console.log(user.username + " updated");
                })
            });

        console.log(place + " ... " + room.users.length);
        if(place === room.users.length - 1) {
            room.gameStarted = false;
            io.to(room.id).emit('gameFinished');
            console.log("game finished");

            let lastPlayer = null;
            room.users.map(user => {
                if(!HasFinished(user)) lastPlayer = user;
            })

            if(lastPlayer) {
                console.log("updating last player :" + lastPlayer.username);
                //save last player score
                userModel.findOne({_id: lastPlayer._id})
                    .then(user => {
                        userModel.updateOne(
                            {_id: user._id},
                            {
                                $set: {
                                    numberOfPlayedGames: user.numberOfPlayedGames + 1,
                                    firstPlaces: (user.firstPlaces ? user.firstPlaces : 0) + (place === 1 ? 1 : 0),
                                    secondPlaces: (user.secondPlaces ? user.secondPlaces : 0) + (place === 2 ? 1 : 0),
                                    thirdPlaces: (user.thirdPlaces ? user.thirdPlaces : 0) + (place === 3 ? 1 : 0),
                                    fourthPlaces: (user.fourthPlaces ? user.fourthPlaces : 0) + (place === 4 ? 1 : 0),
                                }
                            })
                            .then(() => {
                                console.log(user.username + " updated");
                                //removeRoom(room.id);
                            })
                            .catch(err => {
                                console.log(err);
                                //removeRoom(room.id);
                            });
                    });
            }
        }
    }

    console.log("test test test");
    console.log(room.gameStarted);

    if(room.gameStarted === false){
        console.log("remove room")
        room.canCurrentPlayerRollDice = false;
        room.canCurrentPlayerMoveFigure = false;
        sendGameState(io, room);
        removeRoom(room.id);
    } else {
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
}

module.exports = {handleGame, rollDice, handleMove, setNextPlayer};