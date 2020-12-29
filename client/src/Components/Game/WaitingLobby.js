import React, {useEffect, useState} from 'react';
import BackgroundWrapper from "../BackgroundWrapper";
import {createUseStyles} from "react-jss";
import {
    belowBreakpoint,
    blue, breakpoint4,
    classNames,
    cornerRadius,
    LuckiestGuyFont,
    orange,
    red,
    textShadow,
    white
} from "../../mixins";
import {useHistory} from "react-router-dom";
import useRooms from "../../Hooks/useRooms";
import queryString from 'query-string';
import io from "socket.io-client";
import {serverURL} from "../../config";
import useAuth from "../../Hooks/useAuth";

const useStyles = createUseStyles({
    message: {
        color: blue,
        ...LuckiestGuyFont,
    },
    roomDataWrapper: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr ",
        ...belowBreakpoint(breakpoint4,{
            gridTemplateColumns: "auto",
        }),
        width: "100%",
        margin: "40px 0",
    },
    playersTitle: {
        color: orange,
        ...LuckiestGuyFont,
        fontSize: "40px"
    },
    players: {
        color: orange,
        ...LuckiestGuyFont,
        fontSize: "30px",
        margin: "15px",
        display:"flex",
        justifyContent: "space-evenly"
    },
    button: {
        backgroundColor: red,
        maxWidth: "300px",
        borderRadius: cornerRadius,
        boxShadow: textShadow,
        padding: "30px 10px",
        cursor: "pointer",
        margin: "auto",
        marginTop: "30px",
    },
    startGameButton: {
        backgroundColor: blue,
    },
    buttonText: {
        color: white,
        ...LuckiestGuyFont,
        fontSize: "30px",
    },
})

let socket;

const WaitingLobby = ({location}) => {
    const classes = useStyles();

    const {getToken, getUsername, logout} = useAuth();

    let history = useHistory();
    const {rooms, getRooms} = useRooms();
    const { id } = queryString.parse(location.search);
    const [room, setRoom] = useState({
        id: "",
        name: "Room not found",
        users:[],
        hasStarted:false,
    });

    useEffect(() => {
        const currentRoom = rooms ? rooms.find((r) => r.id === id) : null;
        if(currentRoom)
            setRoom(currentRoom);

        if((!socket || !socket.connected) && currentRoom && currentRoom.users.find(u => u.username === getUsername())){
            handleJoin();
        }
    }, [rooms]);

    useEffect(() => {
       return () => {
           handleLeave();
        }
    }, []);

    const handleJoin = () => {
        if((socket && socket.connected)) return;
        const { id } = queryString.parse(location.search);
        socket = io(serverURL);
        socket.emit('join', { roomId:id, token:getToken() }, (error) => {
            if(error) {
                if(error === 'unauthorized user') {
                    logout();
                    return;
                }
                console.log(error);
            }
            getRooms();
        });

        socket.on('gameStarted', () => {
            console.log("game started");
            history.push(`/game?id=${id}`);
        });
        console.log(socket);
    }

    const handleLeave = () => {
        if((!socket || !socket.connected)) return;
        socket.emit('leaveRoom', { roomId:id, token:getToken() }, (error) => {
            if(error) {
                console.log(error);
            }
            getRooms();
            socket.disconnect();
        });
    }

    const handleStartGame = () => {
        if((!socket || !socket.connected)) return;
        socket.emit('startGame', { roomId:id, token:getToken() }, (error) => {
            if(error) {
                console.log(error);
                getRooms();
            }
        });
    }

    const activeUsers = room.users.filter(u => u.active);
    const isConnected = (socket && socket.connected);

    return (
        <BackgroundWrapper title={room.name} backAction={history.goBack}>
            {room.id &&
                <>
                <div className={classes.message}>{activeUsers.length < 2 ? `Waiting for ${2-activeUsers.length} more players to join` : `Waiting for first player to start game`} </div>
                <div className={classes.roomDataWrapper}>
                    <div>
                        <div className={classes.playersTitle}>Players:</div>
                        <div>
                        {activeUsers.map(user =>
                            <div key={user.username} className={classes.players}>
                                <div>
                                    {user.username}
                                </div>
                                <div>
                                    {user.allPoints}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                    <div>
                        <div className={classes.button} onClick={isConnected ? handleLeave : handleJoin}>
                            <div className={classes.buttonText}>{isConnected ? "Leave" : "Join"}</div>
                        </div>
                        {activeUsers.length > 1 && getUsername() === activeUsers[0].username && isConnected &&
                            <div className={classNames(classes.button, classes.startGameButton)} onClick={handleStartGame}>
                                <div className={classes.buttonText}>{"Start game"}</div>
                            </div>
                        }
                    </div>
                </div>
                </>
            }
        </BackgroundWrapper>
    )
}

export default WaitingLobby;