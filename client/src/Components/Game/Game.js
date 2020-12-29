import React, {useEffect, useState} from 'react'
import {createUseStyles} from "react-jss";
import queryString from 'query-string';
import io from "socket.io-client";
import useSound from 'use-sound';

import {
    blue,
    center, classNames,
    cornerRadius, green,
    lightOrange, LuckiestGuy,
    orange, red, shadowAllDirections, shadowButtonRight, shadowTopLeft, textShadow,
    white,
} from "../../mixins";
import {serverURL} from "../../config";
import useAuth from "../../Hooks/useAuth";
import {useHistory} from "react-router-dom";
import LudoGame from "./LudoGame";
import {PlayerColor} from "../../enums";
import diceSound from '../../Sounds/dice.mp3';
import kickSound from '../../Sounds/kick.mp3';
import wonSound from '../../Sounds/won2.mp3';
import ConfettiAnimation from "./ConfettiAnimation";

const chatWrapperSize = 50;
const infoBoxSizes = 70;

const useStyles = createUseStyles({
    background: {
        backgroundColor: lightOrange,
        minHeight: "100vh",
        display: "grid",
    },
    paper: {
        marginLeft: "40px",
        marginRight: "40px",
        marginTop: `-${infoBoxSizes/2}px`,
        marginBottom: `-${infoBoxSizes/2}px`,
    },
    sideBoxes: {
        zIndex: 5,
        pointerEvents: "none",
        fontFamily: LuckiestGuy,
        color: white,
        fontSize: "25px",
        display: "flex",
        justifyContent: "space-between",
        textShadow: textShadow,
    },
    nameBox: {
        height: "100%",
        width: "140px",
        boxShadow: shadowButtonRight,
        ...center,
        justifyContent: "start",
        textTransform: "uppercase"
    },
    topLeft:{
        backgroundColor: red,
        borderBottomRightRadius: cornerRadius,
        paddingLeft: "60px",
    },
    topRight:{
        backgroundColor: green,
        borderBottomLeftRadius: cornerRadius,
        paddingLeft: "60px",
    },
    bottomRight:{
        backgroundColor: orange,
        borderTopLeftRadius: cornerRadius,
        paddingLeft: "60px",
    },
    bottomLeft:{
        backgroundColor: blue,
        borderTopRightRadius: cornerRadius,
        paddingLeft: "60px",
    },
    leftColumn: {
        display: "grid",
        gridTemplateRows: `${infoBoxSizes}px auto ${infoBoxSizes}px`,
    },
    rightColumn: {
        boxShadow: shadowTopLeft,
        display: "grid",
        gridTemplateRows: `50fr ${chatWrapperSize}px 50fr`,
        backgroundColor: orange,
        zIndex: 5,
        height: "100vh",
    },
    chatWrapper: {
        backgroundColor: orange,
        overflowY: "scroll",
        "&::-webkit-scrollbar": {
            display: 'none',
        }
    },
    chatInputWrapper:{
        backgroundColor: blue,
        boxShadow: shadowAllDirections,
        zIndex: 5,
        borderTopLeftRadius: cornerRadius,
        borderBottomLeftRadius: cornerRadius,
        marginLeft: `-${20}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: "20px",
    },
    sendButton: {
        borderRadius: cornerRadius,
        backgroundColor: white,
        width: "30px",
        margin: " 0 10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: textShadow,
    },
    scoreWrapper: {
        marginTop: `-${chatWrapperSize / 2}px`,
        backgroundColor: red,
        overflowY: "scroll",
        "&::-webkit-scrollbar": {
            display: 'none',
        }
    },
    resultList: {
        backgroundColor:white,
        borderRadius: "15px",
        margin: "20px",
        marginTop: "40px",
        padding: "10px",
        boxShadow: textShadow,
    },
    resultListData: {
        display: "flex",
        padding: "10px",
        justifyContent: "space-between",
        borderTop: '1px solid gray'
    },
    resultListHeader: {
        borderTop: 'none',
        fontWeight: "bold",
        color: "gray",
    },
    logout: {
        backgroundColor: white,
        ...center,
        fontFamily: LuckiestGuy,
        color: red,
        boxShadow: textShadow,
        paddingTop: "2px",
        fontSize: "15px",
        margin: "20px 20px 0 0",
        width: "30px",
        height: "30px",
        borderRadius: "20px",
        cursor: "pointer",
        position: 'fixed',
        zIndex: 10,
        left: "10px",
    },
    currentPlayer: {
        textDecoration: "underline"
    },
    inactive: {
        opacity: "0.4"
    },
    gameMessage: {
        marginTop: "30px",
        color: blue,
        maxWidth: "500px",
        textTransform: "uppercase",
        textAlign: "center",
    }
});

let socket;

const SideBox = ({user, isCurrentPlayer, isActive}) => {
    const classes = useStyles();
    if(user)
        return (
            <div className={classNames(
                user.color === PlayerColor.RED ? classes.topLeft : "",
                user.color === PlayerColor.GREEN ? classes.topRight : "",
                user.color === PlayerColor.YELLOW ? classes.bottomRight : "",
                user.color === PlayerColor.BLUE ? classes.bottomLeft : "",

                classes.nameBox,
                isCurrentPlayer(user) ? classes.currentPlayer : "",
                isActive(user) ? "" : classes.inactive,
            )}
            >
                {user.username}
            </div>
        )
    else
        return <div/>
}

const Game = ({location}) => {
    const classes = useStyles();
    const {getToken, getUsername, logout} = useAuth();
    const history = useHistory();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [gameFinished, setGameFinished] = useState(false);
    const [users, setUsers] = useState([]);
    const { id } = queryString.parse(location.search);
    const [redUser, setRedUser] = useState(null);
    const [greenUser, setGreenUser] = useState(null);
    const [yellowUser, setYellowUser] = useState(null);
    const [blueUser, setBluseUser] = useState(null);
    const [isDiceRolling, setIsDiceRolling] = useState(false);
    const [diceValue, setDiceValue] = useState(1);
    const [diceEnabled, setDiceEnabled] = useState(true);
    const [canMoveFigures, setCanMoveFigures] = useState(false);
    const [gameMessage, setGameMessage] = useState("Roll a dice! Player with highest number starts");
    const [kickPosition, setKickPosition] = useState(false);
    const [winner, setWinner] = useState(false);
    const [confettiActive, setConfettiActive] = useState(false);

    //sounds
    const [PlayDiceSound] = useSound(diceSound, { volume: 0.5 });
    const [PlayKickSound] = useSound(kickSound, { volume: 0.5 });
    const [PlayWonSound] = useSound(wonSound, { volume: 0.5 });

    useEffect(() => {
        socket = io(serverURL);
        socket.emit('join', { roomId:id, token:getToken() }, (error) => {
            if(error) {
                if(error === 'unauthorized user') {
                    logout();
                    return;
                }
                console.log(error);
            }
        });
        return () => socket.disconnect();

    }, []);

    useEffect(() => {
        socket.on('message', message => {
            setMessages(messages => [ ...messages, message ]);
        });

        socket.on('gameState', (gameState) => {
            console.log(gameState);
            setUsers(gameState.users);
            setCurrentPlayer(gameState.currentPlayer);
            setDiceValue(gameState.diceValue);

            if(!gameState.canRollDice) {
                setDiceEnabled(false);
            } else if(!gameState.currentPlayer || (getUsername() === gameState.currentPlayer.username && gameState.canRollDice)) {
                setDiceEnabled(true);
            } else {
                setDiceEnabled(false);
            }

            if(!gameState.canMoveFigure) {
                setCanMoveFigures(false);
            } else if(getUsername() === gameState.currentPlayer.username && gameState.canMoveFigure) {
                setCanMoveFigures(true);
            } else {
                setDiceEnabled(false);
            }
        });

        socket.on('currentPlayerRolledDice', (data) => {
            setIsDiceRolling(true);
            setTimeout(function(){
                setIsDiceRolling(false);
                setDiceValue(data.value);
            }, 1000);
        });

        socket.on('gameMessage', (message) => {
            setGameMessage( message);

        });
        socket.on('kickAnimation', (position) => {
            console.log("kick animation " + position );
            setKickPosition(position);
        });

        socket.on('wonAnimation', () => {
            console.log("won animation");
            setConfettiActive(true);
            setWinner(!winner);
            setTimeout(function(){
                setConfettiActive(false);
            }, 2000);
            PlayWonSound();
        });

        socket.on('gameFinished', () => {
            console.log("game finished");
            setGameFinished(true);
            setDiceEnabled(false);
            setTimeout(function(){
                setGameMessage("Game has finished");
            }, 2000);
        });

    }, []);

    useEffect(() => {
        PlayKickSound();
    }, [kickPosition])

    useEffect(() => {
        PlayWonSound();
    }, [winner])

    useEffect(() => {
        setRedUser(users.filter(user => user.color === PlayerColor.RED).length > 0 ? users.filter(user => user.color === PlayerColor.RED)[0] : null);
        setGreenUser(users.filter(user => user.color === PlayerColor.GREEN).length > 0 ? users.filter(user => user.color === PlayerColor.GREEN)[0] : null);
        setYellowUser(users.filter(user => user.color === PlayerColor.YELLOW).length > 0 ? users.filter(user => user.color === PlayerColor.YELLOW)[0] : null);
        setBluseUser(users.filter(user => user.color === PlayerColor.RED).length > 0 ? users.filter(user => user.color === PlayerColor.BLUE)[0] : null);
    }, [users])

    useEffect(() => {
        if(isDiceRolling && diceEnabled) {
            console.log("roll dice");
            PlayDiceSound();
            socket.emit('rollDice', {token: getToken(), roomId: id}, (value) => {
                setDiceValue(value);
                setTimeout(function(){
                    setIsDiceRolling(false);
                }, 1000);
            });
        }
    }, [isDiceRolling])

    const sendMessage = (event) => {
        event.preventDefault();
        if(message) {
            socket.emit('sendMessage', {token: getToken(), roomId: id, message: message}, () => setMessage(''));
        }
    }

    const movePlayer = (playerPosition) => {
        console.log("move player " + playerPosition);
        socket.emit('movePlayer', {token: getToken(), roomId: id, playerPosition: playerPosition}, (err) => {
            console.log(err);
            if(err) setGameMessage(err.error);
        });
    }

    const handleKeyDown = (event) => {
        if (event.keyCode !== 13) return;
        sendMessage(event);
    }

    const isCurrentPlayer = (player) => {
        if(!currentPlayer) return false;
        return player.username === currentPlayer.username;
    }

    const isActive = (player) => {
        return player.active;
    }

    return (
        <div className={classes.background} onKeyDown={handleKeyDown}>
            <div className={classes.logout} onClick={() => history.push('/')}>X</div>
            <div className={classes.leftColumn}>
                <div className={classes.sideBoxes}>
                    <SideBox user={redUser} isActive={isActive} isCurrentPlayer={isCurrentPlayer} />
                    <div className={classes.gameMessage}>
                        <ConfettiAnimation active={confettiActive} />
                        {gameMessage}
                    </div>
                    <SideBox user={greenUser} isActive={isActive} isCurrentPlayer={isCurrentPlayer} />
                </div>
                <div className={classes.paper}>
                    <LudoGame
                        playersPositions={users}
                        isDiceRolling={isDiceRolling}
                        setIsDiceRolling={setIsDiceRolling}
                        diceValue={diceValue}
                        canRollDice={diceEnabled}
                        canMoveFigures={canMoveFigures}
                        movePlayer={movePlayer}
                        kickPosition={kickPosition}
                    />
                </div>
                <div className={classes.sideBoxes}>
                    <SideBox user={blueUser} isActive={isActive} isCurrentPlayer={isCurrentPlayer} />
                    <SideBox user={yellowUser} isActive={isActive} isCurrentPlayer={isCurrentPlayer} />
                </div>
            </div>
        </div>
    )
}

export default Game;