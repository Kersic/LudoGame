import {useContext, useState} from "react";
import {LoaderContext} from "../Contexts/LoaderPrivider";
import {httpGet, httpPost} from "../Services/Fetcher";
import {serverURL} from "../config";
import { useHistory } from "react-router-dom";
import {AlertContext} from "../Contexts/AlertProvider";

function useAuth() {
    const { setIsLoading } = useContext(LoaderContext);
    const { setAlert } = useContext(AlertContext);
    const [profile, setProfile] = useState();
    let history = useHistory();

    const login = (email, password) => {
        httpPost(
            serverURL + "user/login",
            null,
            {
                email,
                password
            },
            setIsLoading,
            (data) => {
                console.log(data);
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('username', data.user?.username);
                history.push('/')
            },
            (err) => {
                setAlert(err);
            }
        )
    }

    const register = (email, username, password) => {
        httpPost(
            serverURL + "user/register",
            null,
            {
                email,
                username,
                password
            },
            setIsLoading,
            (data) => {
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('username', data.user?.username);
                history.push('/');
            },
            (err) => {
                setAlert(err);
            }
        )
    }

    const fetchProfile = () => {
        httpGet(serverURL + "user/profile", getToken(), setIsLoading, (data) => {
            setProfile(data);
        })
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('username');
        history.push('/login');
    }

    const getToken = () => {
        return sessionStorage.getItem('token');
    }

    const getUsername = () => {
        return sessionStorage.getItem('username');
    }

    const isLoggedIn = !!sessionStorage.getItem('token');

    return {login, register, logout, getToken, getUsername, isLoggedIn, fetchProfile, profile};
}
export default useAuth;