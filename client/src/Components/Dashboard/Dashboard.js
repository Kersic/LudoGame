import React, {useState} from 'react'
import {createUseStyles} from "react-jss";
import {
    belowBreakpoint, black,
    blue, breakpoint2,
    breakpoint4, center, classNames,
    cornerRadius,
    LuckiestGuy,
    orange,
    red,
    textShadow,
    white
} from "../../mixins";
import { NavLink } from "react-router-dom";
import RoomForm from "./RoomForm";
import useRooms from "../../Hooks/useRooms";
import BackgroundWrapper from "../BackgroundWrapper";
import useAuth from "../../Hooks/useAuth";

const useStyles = createUseStyles({
    gamesWrapper: {
        width: "90%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        ...belowBreakpoint(breakpoint2, {
            gridTemplateColumns: "1fr 1fr ",
        }),
        ...belowBreakpoint(breakpoint4, {
            gridTemplateColumns: "auto ",
        }),
        marginBottom: "20px",
    },
    gameBox: {
        backgroundColor: blue,
        margin: "25px",
        height: "200px",
        borderRadius: cornerRadius,
        display: "flex",        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-evenly",
        boxShadow: textShadow,
        ...belowBreakpoint(breakpoint2, {
            margin: "7%",
        }),
        ...belowBreakpoint(breakpoint4, {
            margin: "5%",
        }),
        cursor: "pointer",
        textDecoration: "none",
        color: black,
        overflow: "auto",
    },
    roomName: {
        fontFamily: LuckiestGuy,
        fontSize: "30px",
        color: white,
        textShadow: textShadow,
        textTransform: "uppercase"
    },
    roomJoinButton: {
        backgroundColor: white,
        padding: "5px 20px",
        borderRadius: "15px",
        boxShadow: textShadow,
        "&:hover": {
            boxShadow: "1px 1px 1px gray",
        }
    },
    roomUsers: {
        fontFamily: LuckiestGuy,
        fontSize: "20px",
        color: white,
        textShadow: textShadow,
        margin: "0 20px"
    },
    disabled: {
        cursor: "default",
        opacity: "0.5",
        "&:hover": {
            boxShadow: "1px 1px 1px gray",
        }
    }
});


const Dashboard = () => {
    const classes = useStyles();
    const colors = [orange, red, blue];
    const [addingNewRoom, setAddingNewRoom] = useState(false);
    const {rooms} = useRooms();
    const {logout} = useAuth();

    return (
        <BackgroundWrapper title={"DRAW AND GUESS"} backAction={logout} showProfile={true}>
            <div className={classes.gamesWrapper}>
                <div className={classes.gameBox} onClick={()=> !addingNewRoom ? setAddingNewRoom(true) : null}>
                    <RoomForm setAddingNewRoom={setAddingNewRoom} addingNewRoom={addingNewRoom} />
                </div>
                {rooms.map((room, index) => (
                    <NavLink exact to={room.hasStarted ? "/" : `/waiting-lobby?id=${room.id}`} key={room.id} style={{backgroundColor: colors[index % colors.length]}} className={classes.gameBox}>
                        <div className={classes.roomName}>{room.name}</div>
                        <div className={classes.roomUsers}>{room.users.filter(u => u.active).length + "/8" }</div>
                        <div className={classNames(classes.roomJoinButton, room.hasStarted ? classes.disabled : "")}>Join </div>
                    </NavLink>
                ))}
            </div>
        </BackgroundWrapper>
    )
}

export default Dashboard;