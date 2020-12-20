import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(() => ({
    overlay: {
        position: "fixed",
        width: "100%",
        height: "100%",
        top: "0px",
        left: "0px",
        right: "0px",
        bottom: "0px",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        zIndex: "1500",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    loaderWrapper: {
        width: "100px",
        height: "100px",
    }
}));

const Loader = ({isLoading}) => {
    const classes = useStyles();
    return (
        isLoading ?
            <div className={classes.overlay}>
                <div className={classes.loaderWrapper}>
                    <CircularProgress size={70} color={"#000000"} />
                </div>
            </div>
            : null
    );
};

export default Loader;