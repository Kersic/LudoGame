import {useContext, useEffect, useState} from "react";
import {httpGet, httpPost} from "../Services/Fetcher";
import {serverURL} from "../config";
import {LoaderContext} from "../Contexts/LoaderPrivider";
import useAuth from "./useAuth";
import {useHistory} from "react-router-dom";
import { uuid } from 'uuidv4';

const useRooms = () => {
    const [rooms, setRooms] = useState([]);
    const {getToken} = useAuth();
    let history = useHistory();

    const { setIsLoading } = useContext(LoaderContext);

    useEffect(() => {
        httpGet(serverURL + "rooms", getToken(), setIsLoading, (rooms) => {
            setRooms(rooms);
        });
        const intervalId = setInterval(getRooms, 5000);
        return () => {
            clearInterval(intervalId)
        }
    },[]);

    const getRooms = () => {
        httpGet(serverURL + "rooms",  getToken(), null, (rooms) => {
            if(rooms) {
                setRooms(rooms)
            }
        })
    }

    const createRoom = (name) => {
        const id = uuid();
        httpPost(serverURL + "rooms", getToken(), {id, name}, setIsLoading, () => {
            history.push("/waiting-lobby?id="+id);
        })
    }

    return {rooms, createRoom, getRooms};
}

export default useRooms;