import axios from "axios";

export const httpGet = (url, token, setIsLoading, callback) => {
    if(setIsLoading) setIsLoading(true);
    axios({
        method: 'get',
        url: url,
        headers: token ? {
            'Authorization': token
        } : null,
    }).then(res =>{
        if(setIsLoading) setIsLoading(false);
        callback(res.data);
    }).catch(err => {
        if(setIsLoading) setIsLoading(false);
        console.log(err)
    });
}

export const httpPost = (url, token, data, setIsLoading, callback, onError) => {
    setIsLoading(true);
    axios({
        method: 'post',
        url: url,
        data: data,
        headers: token ? {
            'Authorization': token
        } : null,
    }).then(res =>{
        setIsLoading(false);
        if(callback) callback(res.data);
    }).catch(err => {
        setIsLoading(false);
        if(onError && err?.response?.data?.message) onError(err.response.data.message);
        else alert(err);
    });
}

export const httpPut = (url, data, setIsLoading, callback) => {
    setIsLoading(true);
    axios({
        method: 'put',
        url: url,
        data: data,
    }).then(res =>{
        setIsLoading(false);
        callback(res.data);
    }).catch(err => {
        setIsLoading(false);
        console.log(err);
        return err;
    });
}

export const httpDelete = (url, setIsLoading, callback) => {
    setIsLoading(true);
    axios({
        method: 'delete',
        url: url,
    }).then(res =>{
        setIsLoading(false);
        callback(res.data);
    }).catch(err => {
        setIsLoading(false);
        console.log(err)
    });
}