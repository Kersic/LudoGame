import React, {useState} from "react";
import dice1 from "../../icons/dice1.png"
import dice2 from "../../icons/dice2.png"
import dice3 from "../../icons/dice3.png"
import dice4 from "../../icons/dice4.png"
import dice5 from "../../icons/dice5.png"
import dice6 from "../../icons/dice6.png"
import {createUseStyles} from "react-jss";
import {classNames} from "../../mixins";

const useStyles = createUseStyles({
    image: {
        height: "50px",
        margin: "10px",
        cursor: "pointer",
        "-webkit-filter": "drop-shadow(1px 1px 1px black)",
        filter: "drop-shadow(1px 1px 1px black)",
    },
    disabled: {
        cursor: "unset",
        opacity: "0.4",
    },
    diceRolling: {
        animation: "spin 1s ease-out"
    }
})

const Dice = ({value, disabled, isRolling, setIsRolling}) => {
    const classes = useStyles();
    //const [isRolling, setIsRolling] = useState(false);

    let srcImage = dice1;
    if(value === 2) srcImage = dice2;
    if(value === 3) srcImage = dice3;
    if(value === 4) srcImage = dice4;
    if(value === 5) srcImage = dice5;
    if(value === 6) srcImage = dice6;

    const rollDice = () => {
        if(!disabled)
            setIsRolling(true);
    }

    return (
        <img
            alt={"dice"}
            src={srcImage}
            className={classNames(classes.image, disabled ? classes.disabled : "", isRolling ? classes.diceRolling : "")}
            onClick={rollDice}
        />
    )
}

export default Dice;