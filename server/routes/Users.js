const express = require('express');
const router = express.Router();
const { User, Post, Comment } = require('../models');
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

router.put('/nickname/:id', validateToken, async (req, res) => {
    const id = req.params.id;
    const user = await User.findOne({
        where: { id: id }
    });
    if(!user) res.json({error: "Change nickname failed : User Doesn't Exist"});
    await User.update(
        { nickname: req.body.nickname },
        { where: {id : id} }
    )
    await Post.update(
        { postAuthor: req.body.nickname },
        { where: { UserId: id } }
    );
    await Comment.update(
        { commenter: req.body.nickname },
        { where: { UserId: id } }
    );

    const accessToken = sign({nickname: user.nickname, id: user.id},"secret");

    res.json({token: accessToken, nickname: req.body.nickname, id: id});
})

router.put('/changepw', validateToken, async (req,res) => {
    const {oldPassword, newPassword} = req.body;
    const user = await User.findOne({
        where: { id: req.user.id }
    });
    if(!user) res.json({error: "Password Change Error: User Doesn't Exist"});

    bcrypt.compare(oldPassword, user.password).then((match) => {
        if(!match) res.json({error: "Wrong password!"});

        bcrypt.hash(newPassword, 10).then((hash) => {
        User.update(
            { password: hash },
            { where: {id : req.user.id} }
        )
        res.json('Password Update Success');
        });
        
    });
})

module.exports = router;