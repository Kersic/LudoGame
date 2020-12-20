import React from 'react';
import {createUseStyles} from "react-jss";
import {black, center, textShadow, white} from "../mixins";

const useStyles = createUseStyles({
    roundedInput: {
        "-webkit-border-radius": "20px",
        "-moz-border-radius": "20px",
        borderRadius: "20px",
        border: "1px solid " + white,
        color: black,
        width: "-webkit-fill-available",
        height: "30px",
        paddingLeft: "10px",
        boxShadow: textShadow,
        "&:focus": {
            outline: "none",
        },
        textAlign: "center"
    },
});

export const RoundedInput = ({value, setValue, placeholder, type, disabled}) => {
    const classes = useStyles();
    return (
        <input type={type?type:"text"} value={value} disabled={disabled} onChange={(e) => setValue(e.target.value)} className={classes.roundedInput} placeholder={placeholder} autoComplete={"on"}/>
    )
}

export default RoundedInput;
