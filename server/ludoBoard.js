const PlayerColor = {
    RED: 'red',
    GREEN: 'green',
    YELLOW: 'yellow',
    BLUE: 'blue'
}

const getStartPositions = (playerColor) => {
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

module.exports =  {PlayerColor, getStartPositions}