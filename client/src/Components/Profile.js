import React, {useEffect} from "react";
import BackgroundWrapper from "./BackgroundWrapper";
import {useHistory} from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import {createUseStyles} from "react-jss";
import {blue, LuckiestGuyFont} from "../mixins";

const useStyles = createUseStyles({
    text: {
        ...LuckiestGuyFont,
        color: blue,
        margin: "20px",
        fontSize: "30px",
    }
})

const Profile = () => {
    const classes = useStyles();
    let history = useHistory();
    const {fetchProfile, profile, getUsername} = useAuth();

    useEffect(() => {
        fetchProfile();
    }, [])
    return (
        <BackgroundWrapper title={getUsername()} backAction={history.goBack}>
            <div>
                <div className={classes.text}>Number of points:</div> <div className={classes.text}>{profile?.points}</div>
                <div className={classes.text}>Number of wins:</div> <div className={classes.text}>{profile?.numberOfWins}</div>
                <div className={classes.text}>Number of games played:</div> <div className={classes.text}>{profile?.numberOfPlayedGames}</div>
            </div>
        </BackgroundWrapper>
    )
}

export default Profile;