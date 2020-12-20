import React from 'react';
import {createUseStyles} from "react-jss";
import {
    belowBreakpoint,
    breakpoint4, center,
    cornerRadius,
    lightOrange,
    LuckiestGuy, LuckiestGuyFont, orange, red,
    shadowAllDirections, shadowButtonRight,
    white
} from "../mixins";
import PersonIcon from '@material-ui/icons/Person';
import {AccountCircle} from "@material-ui/icons";
import {useHistory} from "react-router-dom";

const useStyles = createUseStyles({
    background: {
        minHeight: "100vh",
        padding: "40px",
        ...belowBreakpoint(breakpoint4, {
            padding: "20px",
        }),
        backgroundColor: lightOrange,
    },
    paper: {
        backgroundColor: white,
        minHeight: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRadius: cornerRadius,
        boxShadow: shadowAllDirections,
        textAlign: "center",
    },
    title: {
        ...LuckiestGuyFont,
        fontSize: "90px",
        color: red,
        margin: "30px",
        ...belowBreakpoint(breakpoint4, {
            margin: "20px",
            marginTop: "40px",
            fontSize: "60px",
        })
    },
    logout: {
        backgroundColor: orange,
        ...center,
        fontFamily: LuckiestGuy,
        color: white,
        boxShadow: shadowButtonRight,
        paddingTop: "2px",
        fontSize: "15px",
        margin: "20px 20px 0 0",
        width: "30px",
        height: "30px",
        borderRadius: "20px",
        cursor: "pointer"
    },
    buttonsWrapper: {
        display:"flex",
        alignSelf: "flex-end",
    }
});

const BackgroundWrapper = ({children, title, backAction, showProfile}) => {
    const classes = useStyles();
    let history = useHistory();
    return (
        <div className={classes.background} >
            <div className={classes.paper}>
                <div className={classes.buttonsWrapper}>
                    {showProfile && <div className={classes.logout} onClick={()=>history.push("/profile")}><PersonIcon /></div>}
                    <div className={classes.logout} onClick={backAction}>X</div>
                </div>
                <div className={classes.title}>{title}</div>
                {children}
            </div>
        </div>
    )
}

export default BackgroundWrapper;