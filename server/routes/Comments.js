const express = require('express');
const router = express.Router();
const {Comment} = require('../models');

router.get('/', async (req, res) => {
    const commentList = await Comment.findAll();
    res.json(commentList);
});

router.post('/', async (req, res) => {
    const comment = req.body;
    if(comment.commenter == '') comment.commenter = 'Anonymous User';
    const newComment = await Comment.create(comment);
    res.json(newComment.text);
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const comment = await Comment.findByPk(id);
    res.json(comment);
});

router.get('/byPost/:postId', async (req, res) => {
    const postId = req.params.postId;
    try {
        const commentList = await Comment.findAll({
            where: { PostId: postId }
        });
        res.json(commentList);
    } catch (error) {
        res.status(500).send(error.message);
    }
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