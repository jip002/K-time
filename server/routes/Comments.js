const express = require('express');
const router = express.Router();
const {Comment} = require('../models');

router.get('/', async (req, res) => {
    const commentList = await Comment.findAll();
    res.json(commentList);
});

router.post('/', async (req, res) => {
    const comment = req.body;
    const newComment = await Comment.create(comment);
    res.json(newComment.text);
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const comment = await Comment.findByPk(id);
    res.json(comment);
});

router.delete('/:id', async (req, res) => {
    const commentId = req.params.id;
    Comment.destroy({
        where: {
            id: commentId
        }
    });
    res.json(`${commentId} deleted from the database`);
});

module.exports = router;