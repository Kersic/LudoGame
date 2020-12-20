const {jwtSign} = require("./config");
const jwt = require('jsonwebtoken');

const getDataFromToken = (token, callback, onError) => {
    jwt.verify(token, jwtSign,(err, authData) => {
        if (err)
            onError("unauthorized user");
        else {
            callback(authData);
        }
    });
}

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        req.token = bearerHeader;
        jwt.verify(req.token, jwtSign,(err, authData) => {
            if (err)
                res.sendStatus(403);
            else {
                req.authData = authData;
                next();
            }
        });
    }
    else
    {
        res.sendStatus(403);
    }
}

const getTimeStringFromSeconds = (seconds) => {
    const min = Math.floor(seconds / 60).toString();
    let sec = (seconds % 60).toString();
    sec = sec.length > 1 ? sec : "0"+sec;
    return `${min}:${sec}`;
}

module.exports = {verifyToken, getDataFromToken, getTimeStringFromSeconds}