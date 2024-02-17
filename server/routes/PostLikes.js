const express = require('express');
const router = express.Router();
const { PostLike } = require('../models');
const { validateToken } = require('../middlewares/AuthMiddleware');

// router.get('/', async (req, res) => {
//     const LikeList = await Like.findAll();
//     res.json(LikeList);
// });

router.post('/', validateToken, async (req, res) => {
    const UserId = req.user.id;
    const { PostId } = req.body;

    const found = await PostLike.findOne({
        where: { 
            PostId: PostId,
            UserId: UserId
        }
    });
    if(!found) {
        await PostLike.create({
            UserId: UserId,
            PostId: PostId
        });
        res.json('Like Success');
    }
    else {
        await PostLike.destroy({
            where :{
                UserId: UserId,
                PostId: PostId
            }
        });
        res.json('UnLike Success');
    }
});

module.exports = router;