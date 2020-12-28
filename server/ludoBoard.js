const {arrayOfPointsIncludes} = require("./helperFunctions");
const {getIndexOfPointInPath} = require("./helperFunctions");
const PlayerColor = {
    RED: 'red',
    GREEN: 'green',
    YELLOW: 'yellow',
    BLUE: 'blue'
}

const getInitialsPositions = (playerColor) => {
    switch (playerColor) {
        case PlayerColor.RED:
            return [[0,0], [0,1], [1, 0], [1,1]];
        case PlayerColor.GREEN:
            return [[0,9], [0,10], [1, 9], [1,10]];
        case PlayerColor.YELLOW:
            return [[9,9], [9,10], [10, 9], [10,10]];
        case PlayerColor.BLUE:
            return [[9,0], [9,1], [10, 0], [10,1]];
    }
}

const getStartPosition = (playerColor) => {
    switch (playerColor) {
        case PlayerColor.RED:
            return [4, 0];
        case PlayerColor.GREEN:
            return [0, 6];
        case PlayerColor.YELLOW:
            return [6, 10];
        case PlayerColor.BLUE:
            return [10, 4];
    }
}

const getStopPosition = (playerColor) => {
    switch (playerColor) {
        case PlayerColor.RED:
            return [5, 0];
        case PlayerColor.GREEN:
            return [0, 5];
        case PlayerColor.YELLOW:
            return [5, 10];
        case PlayerColor.BLUE:
            return [10, 5];
    }
}

const getHomePositions = (playerColor) => {
    switch (playerColor) {
        case PlayerColor.RED:
            return [[5,1], [5,2], [5, 3], [5, 4]];
        case PlayerColor.GREEN:
            return [[1, 5], [2, 5], [3, 5], [4, 5]];
        case PlayerColor.YELLOW:
            return [[5, 9], [5, 8], [5, 7], [5, 6]];
        case PlayerColor.BLUE:
            return [[9, 5], [8, 5], [7, 5], [6, 5]];
    }
}

const colorSpecificFields = (playerColor) => {
    return getHomePositions(playerColor).concat(getInitialsPositions(playerColor));
}

const gamePath = [
    [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4], [0, 5],
    [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [4, 7], [4, 8], [4, 9], [4, 10], [5, 10],
    [6, 10], [6, 9], [6, 8], [6, 7], [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [10, 5],
    [10, 4], [9, 4], [8, 4], [7, 4], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0], [5, 0],
];

const PlayerPath = (playerColor) => {
    let playerPath = [];

    const startIndex = getIndexOfPointInPath(gamePath, getStartPosition(playerColor));

    for(let i = startIndex; i < gamePath.length; i++){
        playerPath.push(gamePath[i]);
    }
    for(let i = 0; i < startIndex; i++){
        playerPath.push(gamePath[i]);
    }
    playerPath = playerPath.concat(getHomePositions(playerColor));

    return playerPath;
}

const getPathToNewPosition = (startPosition, numOfMoves, playerColor) => {
    let movePath = [];
    let playerPath = PlayerPath(playerColor);
    const startIndex = getIndexOfPointInPath(playerPath, startPosition);

    if(startIndex+numOfMoves >= playerPath.length)
        return {path: [], error: true}

    for(let i = startIndex; i <= startIndex+numOfMoves; i++){
        movePath.push(playerPath[i]);
    }

    return {path: movePath, error: false}
}

const hasFiguresOnField = (player) => {
    const playerFields = colorSpecificFields(player.color);
    let figuresOnField = false;
    player.positions.map(position => {
        if(!arrayOfPointsIncludes(playerFields, position)){
            figuresOnField = true;
        }
    })
    return figuresOnField;
}

const canMovePlayersInHome = (player) => {
    const homePositions = getHomePositions(player.color);
    for(let i = homePositions.length - 1; i >= 0; i--){
        for(let j = i - 1; j >= 0; j--){
            if(!arrayOfPointsIncludes(player.positions, homePositions[i]) && arrayOfPointsIncludes(player.positions, homePositions[j])){
                return true;
            }
        }
    }
    return false;
}

const getNumberOfRolls = (player) => {
    if(!hasFiguresOnField(player) && !canMovePlayersInHome(player)) {
        return 3;
    }
    return 1;
}

const getNextPlayer = (room) => {
    let currentIndex = room.users.findIndex((u) => u.username === room.currentPlayer.username);
    currentIndex++;
    if(currentIndex === room.users.length){
        currentIndex = 0;
    }
    //skip inactive players and players that already won
    while (!room.users[currentIndex].active || HasFinished(room.users[currentIndex])) {
        currentIndex++;
        if(currentIndex === room.users.length){
            currentIndex = 0;
        }
    }
    return room.users[currentIndex];
}

const HasFinished = (player) => {
    let hasWon = true;
    player.positions.map(position => {
        if(!arrayOfPointsIncludes(getHomePositions(player.color), position)){
            hasWon = false;
        }
    })
    return hasWon;
}

const getNewFigurePosition = (diceVale, currentPlayerColor, playerPosition) => {
     if(arrayOfPointsIncludes(getInitialsPositions(currentPlayerColor),playerPosition)){
        if(diceVale === 6) {
            return {position:getStartPosition(currentPlayerColor), error: null}
        } else {
            return {position: null, error: "Can not move this figure." };
        }
    } else {
        const result = getPathToNewPosition(playerPosition, diceVale, currentPlayerColor)
        if(result.error){
            return {position: null, error: "Can not move this figure." };
        } else {
            return {position:result.path[result.path.length-1], error: null}
        }
    }
}

const PlayerHasFigureOnField = (player, position) => {
    return arrayOfPointsIncludes(player.positions, position);
}

const CanMovePlayer = (player, diceValue) => {
    let canMovePlayer = false;
    player.positions.map(position => {
        const newPosition = getNewFigurePosition(diceValue, player.color, position).position
        if(newPosition !== null && !PlayerHasFigureOnField(player, newPosition)){
            canMovePlayer = true;
        }
    })
    return canMovePlayer;
}

const KickPlayerFromField = (io, room, position) => {
    let playerRemoveIndex = -1;
    let positionRemoveIndex = -1;
    room.users.map((user, userIndex) => {
        user.positions.map((figurePosition , positionIndex) => {
            if(figurePosition[0] === position[0] && figurePosition[1] === position[1]) {
                playerRemoveIndex = userIndex;
                positionRemoveIndex = positionIndex;
                console.log("kick figure form field");
            }
        })
    })

    if(playerRemoveIndex > -1 && positionRemoveIndex > -1){
        let initialPosition = null;
        getInitialsPositions(room.users[playerRemoveIndex].color).map(p => {
            if(!arrayOfPointsIncludes(room.users[playerRemoveIndex].positions, p)){
                initialPosition = p;
            }
        })
        room.users[playerRemoveIndex].positions.splice(positionRemoveIndex, 1);
        room.users[playerRemoveIndex].positions.push(initialPosition);
        io.to(room.id).emit('kickAnimation', initialPosition);
    }

}

module.exports =  {
    PlayerColor,
    getInitialsPositions,
    getHomePositions,
    getStartPosition,
    getStopPosition,
    hasFiguresOnField,
    getNumberOfRolls,
    getNextPlayer,
    getPathToNewPosition,
    getNewFigurePosition,
    CanMovePlayer,
    KickPlayerFromField,
    PlayerHasFigureOnField,
    HasFinished
}