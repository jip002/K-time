const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const {Post} = require('../models');

const dynamodb = new AWS.DynamoDB.DocumentClient();


router.get('/', async (req, res) => {
    const params = {
        TableName: 'Post'
    };
    dynamodb.scan(params, (err, data) => {
        if (err) {
            console.error('Unable to scan table:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // Sort the items by postDate
            const sortedItems = data.Items.sort((a, b) => {
                return new Date(b.postDate) - new Date(a.postDate);
            });
            res.json(sortedItems);
        }
    });
});

router.post('/', async (req, res) => {
    const post = req.body;

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

    // Getting the max pid for a specified postCategory
    const params = {
        TableName: 'Post',
        KeyConditionExpression: 'postCategory = :postCategory',
        ExpressionAttributeValues: {
            ':postCategory': post.postCategory
        },
        ProjectionExpression: 'pid', 
        ScanIndexForward: false,
        Limit: 1
    };
    
    const queryCallback = (err, data) => {
        if (err) {
            console.error('Unable to query table:', err);
            return;
        }

        let lastPid;
        if (data.Items.length === 0) {
            res.status(404).json({ error: 'No items found for the specified postCategory.' });
            lastPid = -1;
        } else {
            lastPid = data.Items[0].pid;
        }

        // Increment the last pid value to get the next highest value
        const nextPid = lastPid + 1;

        // itemParams for the new Post
        const itemParams = {
            TableName: 'Post',
            Item: {
                // Define the attributes of the item
                'postCategory': post.postCategory,
                'pid': nextPid,

                'author': 'testNickname',  // TODO 추후에 바꿔야 함
                'body': post.postBody,
                'postDate': formattedDate,
                'isDeleted': false,
                'isEdited': false,
                'likers': [],
                'numLikes': 0,
                'school': 'ucsd',  // TODO user별
                'title': post.postTitle,
                'viewCount': 0,
            },
        };

        dynamodb.put(itemParams, (err, data) => {
            if (err) {
              console.error('Unable to add item to the table. Error JSON:', JSON.stringify(err, null, 2));
            } else {
              console.log('Item added successfully:', JSON.stringify(data, null, 2));
            }
        });
    };

    dynamodb.query(params, queryCallback);
});


router.get('/:params', async (req, res) => {
    const { postCategory, pid } = JSON.parse(req.params.params); // Decode parameters
    const params = {
        TableName: 'Post',
        KeyConditionExpression: 'postCategory = :postCategory AND pid = :pid',
        ExpressionAttributeValues: {
            ':postCategory': postCategory,
            ':pid': pid
        }
    };

    dynamodb.query(params, (err, data) => {
        if (err) {
            console.error('Unable to scan post by postCategory and pid:', err);
            res.status(500).json({ error: 'Unable to scan post.' });
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


// TODO get post filtered by postCategory


// TODO
// router.delete('/:id', async (req, res) => {
//     const postId = req.params.id;
//     Post.destroy({
//         where: {
//             id: postId
//         }
//     });
//     res.json(`${postId} deleted from the database`);
// });

module.exports = router;
