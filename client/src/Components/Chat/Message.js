import React from 'react';
import {createUseStyles} from "react-jss";
import {blue, center, LuckiestGuy, red, shadowButtonRight, white} from "../../mixins";
import useAuth from "../../Hooks/useAuth";

const useStyles = createUseStyles({
    messageBox: {
        display: "flex",
        alignItems: "flex-end",
        margin: "5px",
    },
    name: {
        paddingTop: "2px",
        fontSize: "15px",
        margin: "0 5px",
        backgroundColor: red,
        width: "30px",
        height: "30px",
        borderRadius: "20px",
        ...center,
        fontFamily: LuckiestGuy,
        color: white,
        boxShadow: shadowButtonRight,
    },
    message: {
        fontSize: "20px",
        backgroundColor: white,
        padding: '10px',
        borderRadius: "15px",
        maxWidth: "70%",
        boxShadow: shadowButtonRight,
    },
});

const Message = ({name, message}) => {
    const classes = useStyles();
    const {getUsername} = useAuth();
    return (
        <div className={classes.messageBox} style={{flexDirection: name === getUsername() ? "row-reverse" : "row"}}>
            {name && <div  style={{backgroundColor: name === getUsername() ? red : blue}} className={classes.name}>{name.slice(0,2)}</div>}
            <div className={classes.message}>{message}</div>
        </div>
    )
}

export default Message;