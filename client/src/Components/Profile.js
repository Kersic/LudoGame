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
                <div className={classes.text}>Number of games played:</div> <div className={classes.text}>{profile?.numberOfPlayedGames}</div>
                <div className={classes.text}>Number of first places:</div> <div className={classes.text}>{profile?.firstPlaces ? profile?.firstPlaces : 0}</div>
                <div className={classes.text}>Number of second places:</div> <div className={classes.text}>{profile?.secondPlaces ? profile?.secondPlaces : 0}</div>
                <div className={classes.text}>Number of third places:</div> <div className={classes.text}>{profile?.thirdPlaces ? profile?.thirdPlaces : 0}</div>
                <div className={classes.text}>Number of fourth places:</div> <div className={classes.text}>{profile?.fourthPlaces ? profile?.fourthPlaces : 0}</div>
            </div>
        </BackgroundWrapper>
    )
}

export default Profile;