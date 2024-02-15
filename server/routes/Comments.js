const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const {Comment} = require('../models');

const dynamodb = new AWS.DynamoDB.DocumentClient();

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
    // const pid = req.params.postId;
    const pid = "0";

    const params = {
        TableName: 'Comment',
        KeyConditionExpression: 'postType = :postType AND pid = :pid',
        ExpressionAttributeValues: {
            ':pid': pid,
            ':postType': '테스트' // TODO Adding postType value
        }
    };

    dynamodb.query(params, (err, data) => {
        if (err) {
            console.error('Unable to query post by pid and postType:', err);
            res.status(500).json({ error: 'Unable to query post.' });
        } else {
            if (data.Items.length === 0) {
                res.status(404).json({ error: 'Post not found.' });
            } else {
                const post = data.Items[0];
                res.json(post);
            }
        }
    });


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