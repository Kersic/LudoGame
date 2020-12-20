import React, {useState} from 'react';
import {
    center,
    classNames,
    LuckiestGuy,
    orange,
    textShadow,
    white
} from "../../mixins";
import RoundedInput from "../RoundedInput";
import {createUseStyles} from "react-jss";
import {useHistory} from "react-router-dom";
import useRooms from "../../Hooks/useRooms";

const useStyles = createUseStyles({
    buttonWrapper: {
        display: "flex",
    },
    inputWrapper: {
        margin: "10px",
    },
    button: {
        padding: "0 10px",
        margin: "10px",
        borderRadius: "15px",
        backgroundColor: orange,
        color: white,
        fontFamily: LuckiestGuy,
        boxShadow: textShadow,
        textShadow: textShadow,
        fontSize: "20px",
        height: "30px",
        ...center,
        paddingTop: "3px",
        cursor: "pointer",
    },
    roomName: {
        fontFamily: LuckiestGuy,
        fontSize: "30px",
        color: white,
        textShadow: textShadow,
    },
    addRoom: {
        fontSize: "70px",
    },
});

const RoomForm = ({addingNewRoom, setAddingNewRoom}) => {
    const classes = useStyles();
    const [roomName, setRoomName] = useState("");
    const {createRoom} = useRooms();

    const handleCreate = () => {
        if(!roomName) return;
        createRoom(roomName);
    }

    return (
        <div>
            {!addingNewRoom &&
                <div className={classNames(classes.roomName, classes.addRoom)}>
                    +
                </div>
            }
            {addingNewRoom &&
            <div className={classNames(classes.roomName)}>
                <div>Name</div>
                <div className={classes.inputWrapper}>
                    <RoundedInput value={roomName} setValue={setRoomName} />
                </div>
                <div className={classes.buttonWrapper}>
                    <div className={classes.button} onClick={handleCreate}>
                        CREATE
                    </div>
                    <div className={classes.button} onClick={()=>setAddingNewRoom(false)}>
                        CANCEL
                    </div>
                </div>
            </div>
            }
        </div>
    )
}

export default RoomForm;