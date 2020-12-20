import React, {useContext, useEffect, useState} from 'react'
import {createUseStyles} from "react-jss";
import RoundedInput from "../RoundedInput";
import {loginStyles} from "./Login";
import {NavLink} from "react-router-dom";
import {AlertContext} from "../../Contexts/AlertProvider";
import useAuth from "../../Hooks/useAuth";

const useStyles = createUseStyles(loginStyles);

const Login = () => {
    const classes = useStyles();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const { alert, setAlert } = useContext(AlertContext);
    const {register} = useAuth();

    useEffect(() => {
        setAlert("");
    }, [])

    const handleRegister = () => {
        if(!email) {
            setAlert("Email is required");
            return;
        }
        else if(!username) {
            setAlert("Username is required");
            return;
        }
        else if(!password) {
            setAlert("Password is reqired");
            return;
        }
        else if(password !== repeatPassword) {
            setAlert("confirm password doesn't match");
            return;
        }
        register(email, username, password);
    }

    return (
        <div className={classes.background}>
            <div className={classes.paper}>
                <div className={classes.title}>DRAW AND GUESS</div>
                {alert && typeof alert === "string" && <div className={classes.alert}>{alert.toUpperCase()}</div>}
                <div className={classes.input}>
                    <div>EMAIL</div>
                    <RoundedInput value={email} setValue={setEmail}  />
                </div>
                <div className={classes.input}>
                    <div>USERNAME</div>
                    <RoundedInput value={username} setValue={setUsername}  />
                </div>
                <div className={classes.input}>
                    <div>PASSWORD</div>
                    <RoundedInput type={"password"} value={password} setValue={setPassword} />
                </div>
                <div className={classes.input}>
                    <div>CONFIRM PASSWORD</div>
                    <RoundedInput type={"password"} value={repeatPassword} setValue={setRepeatPassword} />
                </div>
                <div className={classes.button} onClick={handleRegister}>
                    REGISTER
                </div>
                <NavLink to={'/login'} className={classes.textButton}>LOGIN</NavLink>
            </div>
        </div>
    )
}

export default Login;