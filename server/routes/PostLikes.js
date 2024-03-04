const express = require('express');
const router = express.Router();
const { PostLike } = require('../models');
const { validateToken } = require('../middlewares/AuthMiddleware');

router.get('/:id', async (req, res) => {
    const postId = req.params.id;
    const likes = await PostLike.findAll({
        where: {
            PostId: postId
        }
    })
    res.json(likes);
})

router.post('/:id', validateToken, async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.id;

    const found = await PostLike.findOne({
        where: { 
            UserId: userId,
            PostId: postId
        }
    });
    if(!found) {
        const newLike = await PostLike.create({
            UserId: userId,
            PostId: postId
        });
        res.json({liked: true, newLike: newLike});
    }
    else {
        await PostLike.destroy({
            where :{
                UserId: userId,
                PostId: postId
            }
        });
        res.json({liked: false, newLike: null});
    }
});

module.exports = router;