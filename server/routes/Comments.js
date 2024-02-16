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

    // Query params to get the highest commentId in the partition
    const params = {
        TableName: 'Comment',
        KeyConditionExpression: 'postCategory = :postCategory',
        ExpressionAttributeValues: {
            ':postCategory': comment.postCategory
        },
        ProjectionExpression: 'commentId',
        ScanIndexForward: false,
        Limit: 1
    };

    dynamodb.query(params, (err, data) => {
        if (err) {
            console.error('Unable to query table:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            let nextCommentId;
            if (data.Items.length === 0) {
                nextCommentId = 0; // Start from 0 if no items found
            } else {
                nextCommentId = data.Items[0].commentId + 1; // Increment the highest commentId by 1
            }

            // Getting the date value
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
            const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}:${milliseconds}`;

            const itemParams = {
                TableName: 'Comment',
                Item: {
                    'postCategory': comment.postCategory,
                    'commentId': nextCommentId,
                    'body': comment.body,
                    'nickname': comment.nickname,
                    'postId': comment.PostId,
                    'date': formattedDate,
                    'isDeleted': false,
                    'isEdited': false,
                    'likers': [],
                    'nestedComment': [],
                    'numLikes': 0,
                    'uid': 0  // TODO need this from req.body
                },
            };

            // Add the item to the table
            dynamodb.put(itemParams, (err, data) => {
                if (err) {
                    console.error('Unable to add item to the table:', err);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    console.log('Item added successfully:', data);
                    res.json(comment); // Respond with the added comment but not necessary (?)
                }
            });
        }
    });
});


router.get('/byPost/:params', async (req, res) => {
    const { postCategory, pid } = JSON.parse(req.params.params); // Decode parameters

    const params = {
        TableName: 'Comment',
        FilterExpression: 'postCategory = :postCategory AND postId = :postId',
        ExpressionAttributeValues: {
            ':postCategory': postCategory,
            ':postId': pid
        }
    };
    // NOTE might not be the best idea to use scan
    dynamodb.scan(params, (err, data) => {
        if (err) {
            console.error('Unable to scan the table:', err);
        } else {
            res.json(data.Items);
        }
    });
});


// TODO need to set what to pass in params (postCategory, commentId)
router.delete('/:params', async (req, res) => {
    const commentId = req.params.id;
    Comment.destroy({
        where: {
            id: commentId
        }
    });
    res.json(`${commentId} deleted from the database`);
});

module.exports = router;