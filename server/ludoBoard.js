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
            return [[9,0], [9,1], [10, 0], [10,1]];
        case PlayerColor.BLUE:
            return [[9,9], [9,10], [10, 9], [10,10]];
    }
}

const getStartPosition = (playerColor) => {
    switch (playerColor) {
        case PlayerColor.RED:
            return [4, 0];
        case PlayerColor.GREEN:
            return [0, 6];
        case PlayerColor.YELLOW:
            return [10, 4];
        case PlayerColor.BLUE:
            return [6, 10];
    }
}

const getStopPosition = (playerColor) => {
    switch (playerColor) {
        case PlayerColor.RED:
            return [5, 0];
        case PlayerColor.GREEN:
            return [0, 6];
        case PlayerColor.YELLOW:
            return [10, 5];
        case PlayerColor.BLUE:
            return [5, 10];
    }
}

const getHomePositions = (playerColor) => {
    switch (playerColor) {
        case PlayerColor.RED:
            return [[5,1], [5,2], [5, 3], [5, 4]];
        case PlayerColor.GREEN:
            return [[1, 5], [2, 5], [3, 5], [4, 5]];
        case PlayerColor.YELLOW:
            return [[9, 5], [8, 5], [7, 5], [6, 5]];
        case PlayerColor.BLUE:
            return [[5, 9], [5, 8], [5, 7], [5, 6]];
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
    console.log(playerPath);

    const startIndex = getIndexOfPointInPath(playerPath, startPosition);

    if(startIndex+numOfMoves >= playerPath.length)
        return {path: [], error: true}

    for(let i = startIndex; i <= startIndex+numOfMoves; i++){
        movePath.push(playerPath[i]);
    }

    return {path: movePath, error: false}
}

const hasFiguresOnField = (player) => {
    player.positions.map(position => {
        if(!colorSpecificFields(player.color).includes(position)){
            return true;
        }
    })
    return false;
}

const canMovePlayersInHome = (player) => {
    const homePositions = getHomePositions(player.color);
    for(let i = homePositions.length - 1; i >= 0; i--){
        for(let j = i - 1; j >= 0; j--){
            if(!player.positions.includes(homePositions[i]) && player.positions.includes(homePositions[j])){
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
    while (!room.users[currentIndex].active) {
        currentIndex++;
        if(currentIndex === room.users.length){
            currentIndex = 0;
        }
    }
    return room.users[currentIndex];
}

module.exports =  {PlayerColor, getInitialsPositions, getHomePositions, getStartPosition, getStopPosition, hasFiguresOnField, getNumberOfRolls, getNextPlayer, getPathToNewPosition}