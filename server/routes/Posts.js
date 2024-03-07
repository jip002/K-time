const express = require('express');
const router = express.Router();
const { Post, PostLike } = require('../models');
const { validateToken } = require('../middlewares/AuthMiddleware');

router.get('/', async (req, res) => {
    const postList = await Post.findAll({ 
        include: [PostLike]
    });
    res.json(postList);
});

router.get('/byUser/:id', async (req, res) => {
    const id = req.params.id;
    const postList = await Post.findAll({
        where: {UserId: id},
        include: [PostLike]
    });
    res.json(postList);
})


router.post('/', validateToken, async (req, res) => {
    const post = req.body;
    post.postAuthor = req.user.nickname;
    post.UserId = req.user.id;
    const newPost = await Post.create(post);
    res.json(newPost.id);
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const post = await Post.findByPk(id);
    res.json(post);
});

router.delete('/:id', validateToken, async (req, res) => {
    const postId = req.params.id;
    await Post.destroy({
        where: {
            id: postId
        }
    });
    res.json(`${postId} deleted from the database`);
});

router.put('/:id', validateToken, async (req, res) => {
    const postId = req.params.id;
    const {postTitle, postBody, postCategory} = req.body;
    await Post.update(
        {
            postTitle: postTitle,
            postBody: postBody,
            postCategory: postCategory
        },
        {
            where: {
                id: postId
            }
        }
    )
    const updatedPost = await Post.findByPk(postId);
    res.json(updatedPost);
})

module.exports = router;