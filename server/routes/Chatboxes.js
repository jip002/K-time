const express = require('express');
const router = express.Router();
const { Chatbox, User } = require('../models');
const { validateToken } = require('../middlewares/AuthMiddleware');

router.get('/sent', validateToken, async (req, res) => {
    const sentChat = await Chatbox.findAll({
        where: {
            senderId: req.user.id,
            senderDel: false
        }
    });
    res.json(sentChat);
});

router.get('/received', validateToken, async (req, res) => {
    const receivedChat = await Chatbox.findAll({
        where: {
            receiverId: req.user.id,
            receiverDel: false
        }
    });
    res.json(receivedChat);
});

router.put('/read/:id', validateToken, async(req, res) => {
    const chatId = req.params.id;
    const updated = await Chatbox.update({
        isRead: true
    },
    {
        where: {
            id: chatId
        }
    });
    if (updated > 0) {
        res.json({ message: "Chat marked as read." });
    } else {
        res.status(404).json({ message: "Chat not found or already marked as read." });
    }
})

router.put('/sent/delete/:id', validateToken, async (req, res) => {
    const chatId = req.params.id;
    
    try {
        const chatToDelete = await Chatbox.findOne({
            where: {
                id: chatId
            }
        });

        if (!chatToDelete) {
            return res.status(404).json({ error: "Chat not found." });
        }

        if (chatToDelete.senderId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized delete request" });
        }

        if (!chatToDelete.receiverDel) {
            await Chatbox.update({ senderDel: true }, { where: { id: chatId } });
            res.json("senderDel marked true but not deleted");
        } else {
            await Chatbox.destroy({ where: { id: chatId } });
            res.json("whole message deleted");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
});

router.put('/received/delete/:id', validateToken, async (req, res) => {
    const chatId = req.params.id;
    
    try {
        const chatToDelete = await Chatbox.findOne({
            where: {
                id: chatId
            }
        });

        if (!chatToDelete) {
            return res.status(404).json({ error: "Chat not found." });
        }
        
        if (chatToDelete.receiverId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized delete request" });
        }

        if (!chatToDelete.senderDel) {
            await Chatbox.update({ receiverDel: true }, { where: { id: chatId } });
            res.json("receiverDel marked true but not deleted");
        } else {
            await Chatbox.destroy({ where: { id: chatId } });
            res.json("whole message deleted");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
});

router.post('/byEmail', validateToken, async (req, res) => {
    const receiver = await User.findOne({
        where: {
            email: req.body.receiverEmail
        }
    });
    const chat = {
        senderId: req.user.id,
        senderNickname: req.user.nickname,
        receiverId: receiver.id,
        receiverNickname: receiver.nickname,
        school: receiver.school,
        msgContent: req.body.msgContent,
        isRead: false,
        senderDel: false,
        receiverDel: false
    }
    newChat = await Chatbox.create(chat);
    res.json(newChat);
});

router.post('/:id', validateToken, async (req, res) => {
    const receiver = await User.findByPk(req.params.id);
    const chat = {
        senderId: req.user.id,
        senderNickname: req.user.nickname,
        receiverId: receiver.id,
        receiverNickname: receiver.nickname,
        school: receiver.school,
        msgContent: req.body.msgContent,
        isRead: false,
        senderDel: false,
        receiverDel: false
    }
    newChat = await Chatbox.create(chat);
    res.json(newChat);
});

module.exports = router;