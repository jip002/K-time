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

// router.get('/newest', async (req, res) => {
//     try {
//         const newestpost = await Post.findOne({
//             order: [['createdAt', 'DESC']], // Order by creation date in descending order
//             limit: 1 // Limit the result to one post
//         });
        
//         res.json(newestpost);
//     } catch (error) {
//         console.error('Error fetching newest post:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

router.delete('/:id', async (req, res) => {
    const postId = req.params.id;
    Post.destroy({
        where: {
            id: postId
        }
    });
    res.json(`${postId} deleted from the database`);
});

// router.get('/bySchool/:id', async (req, res) => {
//     const schoolId = req.params.id;
//     const Post = await Post.findAll({
//         where: {
//             SchoolId: schoolId
//         }
//     });
//     res.json(Post);
// })

module.exports = router;