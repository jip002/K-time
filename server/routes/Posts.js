const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const {Post} = require('../models');

const dynamodb = new AWS.DynamoDB.DocumentClient();


// For showing all posts from recent to old on Forum page
// TODO add filter expression by school later
router.get('/', async (req, res) => {
    const params = {
        TableName: 'Post',
        FilterExpression: 'isDeleted <> :deleted',
        ExpressionAttributeValues: {
            ':deleted': true
        }
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


// Creating a new post
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

                'author': 'testNickname',  // TODO 로그인 기능 완성 후에 바꿔야 함
                'body': post.postBody,
                'postDate': formattedDate,
                'isDeleted': false,
                'isEdited': false,
                'likers': [],
                'numLikes': 0,
                'school': 'ucsd',  // TODO 로그인 기능 완성 후에 바꿔야 함
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


// Opening a specific post
// TODO add filter expression by school later
router.get('/:params', async (req, res) => {
    // ISSUE post call is called twice
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
                // TODO increase viewCount for every refresh || set 10min lock for each user?
                post.viewCount = (post.viewCount || 0) + 1;
                const updateParams = {
                    TableName: 'Post',
                    Key: {
                        'postCategory': postCategory,
                        'pid': pid
                    },
                    UpdateExpression: 'SET viewCount = :viewCount',
                    ExpressionAttributeValues: {
                        ':viewCount': post.viewCount
                    },
                    ReturnValues: 'ALL_NEW'
                };

                dynamodb.update(updateParams, (err, data) => {
                    if (err) {
                        console.error('Error updating viewCount:', err);
                        res.status(500).json({ error: 'Error updating viewCount.' });
                    } else {
                        // Return the updated post
                        res.json(post);
                    }
                });
            }
        }
    });
});


// Get post by postCategory
// TODO add filter expression by school later
router.get('/byCategory/:postCategory', async (req, res) => {
    const postCategory = req.params.postCategory;

    const params = {
        TableName: 'Post',
        KeyConditionExpression: 'postCategory = :postCategory',
        FilterExpression: 'isDeleted <> :deleted',
        ExpressionAttributeValues: {
            ':postCategory': postCategory,
            ':deleted': true
        },

        ScanIndexForward: false  // In descending order
    };

    dynamodb.query(params, (err, data) => {
        if (err) {
            console.error('Unable to query posts by postCategory:', err);
            res.status(500).json({ error: 'Unable to query posts.' });
        } else {
            const posts = data.Items;
            res.json(posts);
        }
    });
});


// Deleting a post (changing isDeleted value to true)
// TODO need to check if req user and post user matches
router.delete('/:params', async (req, res) => {
    const { postCategory, pid } = JSON.parse(req.params.params);

    const params = {
        TableName: 'Post',
        Key: {
            'postCategory': postCategory,
            'pid': pid
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
            res.json({ message: 'Post deleted successfully.' });
        }
    });
});


// TODO User likes a post


// TODO User saves a post


// TODO User edits a post (title, body)


module.exports = router;
