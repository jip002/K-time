const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const {Comment} = require('../models');
const { validateToken } = require('../middlewares/AuthMiddleware');

const dynamodb = new AWS.DynamoDB.DocumentClient();


// Create comment from a post
router.post('/', validateToken, async (req, res) => {
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


// Get all comments from a post
router.get('/byPost/:params', async (req, res) => {
    const { postCategory, pid } = JSON.parse(req.params.params); // Decode parameters

    const params = {
        TableName: 'Comment',
        KeyConditionExpression: 'postCategory = :postCategory',
        FilterExpression: 'postId = :postId AND isDeleted = :deleted',
        ExpressionAttributeValues: {
            ':postCategory': postCategory,
            ':postId': pid,
            ':deleted': false,
        }
    };

    dynamodb.query(params, (err, data) => {
        if (err) {
            console.error('Unable to query the table:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(data.Items);
        }
    });
});


// NOTE need to pass in params (postCategory, commentId)
// Deleting a comment (changing isDeleted value to true)
// TODO need to check if req user and comment user matches
router.delete('/:params', async (req, res) => {
    const { category, id } = JSON.parse(req.params.params);

    const params = {
        TableName: 'Comment',
        Key: {
            'postCategory': category,
            'commentId': id
        },
        UpdateExpression: 'SET isDeleted = :deleted',
        ExpressionAttributeValues: {
            ':deleted': true
        },
        ReturnValues: 'ALL_NEW'
    };

    dynamodb.update(params, (err, data) => {
        if (err) {
            console.error('Error updating post:', err);
            res.status(500).json({ error: 'Error updating post.' });
        } else {
            res.json({ message: 'Comment deleted successfully.' });
        }
    });
});


// User likes a comment


// TODO User edits a comment

module.exports = router;