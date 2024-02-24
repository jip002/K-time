const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { sign } = require('jsonwebtoken');
const { validateToken } = require('../middlewares/AuthMiddleware');

router.get('/', async (req, res) => {
    const userList = await User.findAll();
    res.json(userList);
});

router.get('/verify', validateToken, (req, res) => {
    res.json(req.user);
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const user = await User.findByPk(id, {
        attributes: {exclude: ['password']}
    });
    res.json(user);
});

router.post('/', async (req, res) => {
    const { nickname, password, email, school } = req.body;
    bcrypt.hash(password, 10).then((hash) => {
        User.create({
            nickname: nickname,
            password: hash,
            email: email,
            school: school
        });
        res.json('SUCCESS');
    });
});

router.post('/login', async (req, res) => {
    const {password, email} = req.body;
    const user = await User.findOne({
        where: { email: email }
    });
    if(!user) res.json({error: "User Doesn't Exist"});

    bcrypt.compare(password, user.password).then((match) => {
        if(!match) res.json({error: "Wrong Email and Password Combination"});

        const accessToken = sign({nickname: user.nickname, id: user.id},"secret");
        
        res.json({
            token: accessToken,
            nickname: user.nickname,
            id: user.id
        });
    });
});

module.exports = router;