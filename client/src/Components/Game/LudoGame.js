import React, {useState} from 'react';
import {
    belowBreakpoint,
    breakpoint4,
    center,
    cornerRadius, green, orange,
    red,
    blue,
    shadowAllDirections,
    textShadow,
    white, LuckiestGuy
} from "../../mixins";
import {createUseStyles} from "react-jss";
import Dice from "./Dice";

const useStyles = createUseStyles({
    paper: {
        height: "100%",
        ...center,
        flexDirection: "column",
    },
    gameGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(11, 1fr)",
        gridTemplateRows: "repeat(11, 1fr)"
    },
    filed: {
        backgroundColor: red,
        height: "60px",
        width: "60px",
        borderRadius: "60px",
        margin: "10px",
        boxShadow: textShadow,
        ...center,
    },
    player: {
        paddingTop: "2px",
        height: "40px",
        width: "40px",
        borderRadius: "40px",
        boxShadow: textShadow,
        ...center,
        fontFamily: LuckiestGuy,
        color: white,
    }
});

const FiledType = {
    NOT_FIELD: 0,
    RED: 2,
    GREEN: 3,
    YELLOW: 4,
    BLUE: 5,
    EMPTY: 1,
    DICE: 6,
}

const gameGrid = [
    [2,2,0,0,1,1,3,0,0,3,3],
    [2,2,0,0,1,3,1,0,0,3,3],
    [0,0,0,0,1,3,1,0,0,0,0],
    [0,0,0,0,1,3,1,0,0,0,0],
    [2,1,1,1,1,3,1,1,1,1,1],
    [1,2,2,2,2,6,5,5,5,5,1],
    [1,1,1,1,1,4,1,1,1,1,5],
    [0,0,0,0,1,4,1,0,0,0,0],
    [0,0,0,0,1,4,1,0,0,0,0],
    [4,4,0,0,1,4,1,0,0,5,5],
    [4,4,0,0,4,1,1,0,0,5,5],
];

const playersPositions = [
    {
        name: "Tadeja",
        positions: [[0,0], [0,1], [1, 0], [1,1]],
    },
    {
        name: "Saso",
        positions: [[0,9], [0,10], [1, 9], [1,10]],
    },
    {
        name: "Maja",
        positions: [[9,0], [9,1], [10, 0], [10,1]],
    },
    {
        name: "Klemen",
        positions: [[9,9], [9,10], [10, 9], [10,10]],
    },
]

const LudoGame = () => {
    const classes = useStyles();
    const [diceValue, setDiceValue] = useState(1);
    return (
        <div className={classes.paper}>
            <div className={classes.gameGrid}>
                { gameGrid.map((row, rowIndex) => row.map((field, columnIndex) => {
                    let player = null;

                    playersPositions.map((playerPositions, playerIndex) => playerPositions.positions.map(position => {
                        if(position[0] === rowIndex && position[1] === columnIndex) {
                            const shortName = playerPositions.name.slice(0,2);
                            if(playerIndex === 0)
                                player = <div className={classes.player} style={{backgroundColor: red}}>{shortName}</div>
                            else if (playerIndex === 1)
                                player = <div className={classes.player} style={{backgroundColor: green}}>{shortName}</div>
                            else if (playerIndex === 2)
                                player = <div className={classes.player} style={{backgroundColor: orange}}>{shortName}</div>
                            else if (playerIndex === 3)
                                player = <div className={classes.player} style={{backgroundColor: blue}}>{shortName}</div>

                        }
                    }))

                    if(field === FiledType.RED){
                        return (<div className={classes.filed} style={{backgroundColor: red}}> {player} </div>)
                    } else if(field === FiledType.BLUE){
                       return (<div className={classes.filed} style={{backgroundColor: blue}}> {player} </div>)
                    } else if(field === FiledType.YELLOW){
                       return (<div className={classes.filed} style={{backgroundColor: orange}}> {player} </div>)
                    } else if(field === FiledType.GREEN){
                       return (<div className={classes.filed} style={{backgroundColor: green}}> {player} </div>)
                    } else if(field === FiledType.EMPTY){
                        return (<div className={classes.filed} style={{backgroundColor: white}}> {player} </div>)
                    } else if(field === FiledType.DICE){
                        return (
                            <Dice
                                value={diceValue}
                                setValue={setDiceValue}
                                disabled={false}
                            />
                        )
                    } else {
                       return (<div/>)
                    }
                })
                )}
            </div>
        </div>
    )
}

export default LudoGame;