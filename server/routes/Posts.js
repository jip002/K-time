const express = require('express');
const router = express.Router();
const {Post} = require('../models');

router.get('/', async (req, res) => {
    const postList = await Post.findAll();
    res.json(postList);
});

router.post('/', async (req, res) => {
    const post = req.body;
    console.log(post);
    const newPost = await Post.create(post);
    res.json(newPost.id);
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const post = await Post.findByPk(id);
    res.json(post);
});

router.delete('/:id', async (req, res) => {
    const postId = req.params.id;
    Post.destroy({
        where: {
            id: postId
        }
    });
    res.json(`${postId} deleted from the database`);
});

module.exports = router;