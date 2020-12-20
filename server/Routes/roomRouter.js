const express = require('express');
const router = express.Router();
const userModel = require('../Models/user');
const {rooms} = require('../rooms');
const {verifyToken} = require("../helperFunctions");

router.get('/', verifyToken, (req, res) => {
    const reducedRooms = rooms.map((room) => {
        return {
            id: room.id,
            name: room.name,
            users: room.users.map((user) => {return{
                allPoints: user.allPoints,
                username: user.username,
                active: user.active,
            }}),
            hasStarted:room.hasStarted,
        }
    })
    res.json(reducedRooms);
});

router.post('/', verifyToken, (req, res) => {
    if(!req.body.id) {
        res.status(500).json({message:"missing room id"});
        return;
    }
    if(!req.body.name) {
        res.status(500).json({message:"missing room name"});
        return;
    }
    userModel.findOne({_id: req.authData.user._id})
        .then(user => {
            const room = {
                id: req.body.id,
                name: req.body.name,
                users:[{
                    _id: user._id,
                    username: user.username,
                    allPoints: user.points,
                    pointsThisGame: 0,
                    hasPlayed: false,
                    active: false,
                }],
                hasStarted:false,
            }
            rooms.push(room);
            res.json(room);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

module.exports = router;