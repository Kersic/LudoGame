import React, {useEffect, useState} from 'react';
import {
    belowBreakpoint,
    breakpoint4,
    center,
    cornerRadius, green, orange,
    red,
    blue,
    shadowAllDirections,
    textShadow,
    white, LuckiestGuy, classNames
} from "../../mixins";
import {createUseStyles} from "react-jss";
import Dice from "./Dice";
import useAuth from "../../Hooks/useAuth";

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
        height: "50px",
        width: "50px",
        borderRadius: "50px",
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
    },
    movablePlayer: {
        cursor: "pointer",
    },
    kickedPlayer: {
        animation: "shake 0.82s cubic-bezier(.36,.07,.19,.97)"
    }
});

const FiledType = {
    NOT_FIELD: 0,
    RED: 2,
    GREEN: 3,
    BLUE: 4,
    YELLOW: 5,
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

const Player = ({user, color, canMoveFigures, movePlayer, wasKicked}) => {
    const {getUsername} = useAuth();
    const classes = useStyles();
    const shortName = user.username.slice(0,2);
    const arePlayersFigures = user.username === getUsername();
    if(arePlayersFigures && canMoveFigures){
        return (<div className={classNames(classes.player, classes.movablePlayer, wasKicked ? classes.kickedPlayer : "")} onClick={movePlayer} style={{backgroundColor: color}}>{shortName}</div>)
    } else {
        return (<div className={classNames(classes.player, wasKicked ? classes.kickedPlayer : "")} style={{backgroundColor: color}}>{shortName}</div>)
    }
}

const LudoGame = ({playersPositions, isDiceRolling, setIsDiceRolling, diceValue, canRollDice, canMoveFigures, movePlayer, kickPosition}) => {
    const classes = useStyles();

    return (
        <div className={classes.paper}>
            <div className={classes.gameGrid}>
                { gameGrid.map((row, rowIndex) => row.map((field, columnIndex) => {
                    let player = null;

                    playersPositions.map((playerPositions, playerIndex) => playerPositions.positions.map(position => {
                        const wasKicked = kickPosition && kickPosition[0] === position[0] && kickPosition[1] === position[1]
                        if(position[0] === rowIndex && position[1] === columnIndex) {
                            if(playerPositions.color === "red")
                                player = <Player user={playerPositions} color={red} canMoveFigures={canMoveFigures} movePlayer={()=>movePlayer(position)} wasKicked={wasKicked}/>
                            else if (playerPositions.color === "green")
                                player = <Player user={playerPositions} color={green} canMoveFigures={canMoveFigures} movePlayer={()=>movePlayer(position)} wasKicked={wasKicked}/>
                            else if (playerPositions.color === "yellow")
                                player = <Player user={playerPositions} color={orange} canMoveFigures={canMoveFigures} movePlayer={()=>movePlayer(position)} wasKicked={wasKicked}/>
                            else if (playerPositions.color === "blue")
                                player = <Player user={playerPositions} color={blue} canMoveFigures={canMoveFigures} movePlayer={()=>movePlayer(position)} wasKicked={wasKicked}/>
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
                                disabled={!canRollDice}
                                isRolling={isDiceRolling}
                                setIsRolling={setIsDiceRolling}
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