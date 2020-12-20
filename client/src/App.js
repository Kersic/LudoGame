import React, {Profiler} from 'react';
import './App.css'
import {YanoneKaffeesatz} from "./mixins";
import { createUseStyles } from 'react-jss';
import {Switch, Route} from "react-router-dom";
import Login from "./Components/Login/Login";
import Register from "./Components/Login/Register";
import Dashboard from "./Components/Dashboard/Dashboard";
import Game from "./Components/Game/Game";
import PrivateRoute from "./Components/Login/PriveteRoute";
import WaitingLobby from "./Components/Game/WaitingLobby";
import Profile from "./Components/Profile";

const useStyles = createUseStyles({
    app: {
        fontFamily: YanoneKaffeesatz,
        fontSize: "20px",
        minHeight: "100%",
    },
});

function App() {
    const classes = useStyles();
    return (
        <div className={classes.app}>
            <Switch>
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Register} />
                <PrivateRoute path="/game" component={Game} />
                <PrivateRoute path="/waiting-lobby" component={WaitingLobby} />
                <PrivateRoute path="/profile" component={Profile} />
                <PrivateRoute path="/" component={Dashboard} />
            </Switch>
        </div>
    );
}

export default App;
