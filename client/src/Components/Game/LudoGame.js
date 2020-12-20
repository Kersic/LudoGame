import React from 'react';
import {belowBreakpoint, breakpoint4, center, cornerRadius, shadowAllDirections, white} from "../../mixins";
import {createUseStyles} from "react-jss";

const useStyles = createUseStyles({
    paper: {
        height: "100%",
        backgroundColor: white,
        borderRadius: cornerRadius,
        boxShadow: shadowAllDirections,
        ...center,
        flexDirection: "column",
    },
});

const LudoGame = () => {
    const classes = useStyles();
    return (
        <div className={classes.paper}>

        </div>
    )
}

export default LudoGame;