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

const arrayOfPointsIncludes = (array, point) => {
    let includes = false
    array.map( p => {
        if(p[0] === point[0] && p[1] === point[1]){
            includes = true;
        }
    })
    return includes;
}

module.exports = {verifyToken, getDataFromToken, arrayOfPointsIncludes}