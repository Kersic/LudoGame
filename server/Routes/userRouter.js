const express = require('express');
const router = express.Router();
const userModel = require('../Models/user');
const {jwtSign} = require("../config");
const {verifyToken} = require("../helperFunctions");
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    console.log("POST user/register");
    if(!req.body.email) {
        res.status(500).json({message:"email is required"});
        return;
    }
    else if(!req.body.username) {
        res.status(500).json({message:"username is required"});
        return;
    }
    else if(!req.body.password) {
        res.status(500).json({message:"password is required"});
        return;
    }
    else if(req.body.password.length < 8) {
        res.status(500).json({message:"password should have 8 characters"});
        return;
    }

    let users = await userModel.find({username: req.body.username});
    if(!users || users.length > 0){
        res.status(500).json({message:"Username is taken"});
        return;
    }
    users = await userModel.find({email: req.body.email});
    if(!users || users.length > 0){
        res.status(500).json({message:"User with email address already exists"});
        return;
    }
    console.log("creating user");
    const tag = new userModel({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        points: 0,
        numberOfPlayedGames: 0,
        numberOfWins: 0,
    });
    tag.save()
        .then(user => {
            jwt.sign({user: {_id: user._id, username: user.username}}, jwtSign, {expiresIn: '8h'}, (err, token) =>{
                res.json({message:'success', token:token, user:user});
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });

});

router.post('/login', (req, res) => {
    console.log("POST user/login");
    userModel.authenticate(req.body.email, req.body.password, function (err, user) {
        if (!user) {
            res.status(500).json({message:'Wrong username or password'});
        }
        else if(err){
            console.log(err);
            res.status(500).json(err);
        }else {
            jwt.sign({user: {_id: user._id, username: user.username}}, jwtSign, {expiresIn: '8h'}, (err, token) =>{
                res.json({message:'success', token:token, user:user});
            });
        }
    })
});

router.get('/profile', verifyToken, (req, res) => {
    console.log('GET: user/profile');
    userModel.findOne({_id: req.authData.user._id})
        .then(data => {
            data.password=null;
            res.json(data);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});



module.exports = router;