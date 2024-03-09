const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const {Comment} = require('../models');
const { validateToken } = require('../middlewares/AuthMiddleware');

const dynamodb = new AWS.DynamoDB.DocumentClient();


// Create comment from a post
router.post('/', validateToken, async (req, res) => {
    const comment = req.body;
    const user = req.user;

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
                    'uid': user.id,
                    'school': user.school
                },
            };

            // Add the item to the table
            dynamodb.put(itemParams, (err, data) => {
                if (err) {
                    console.error('Unable to add item to the table:', err);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    console.log('Item added successfully:', data);
                }

                // Increment numComments by 1
                const updateParams = {
                    TableName: 'Post',
                    Key: {
                        'postCategory': comment.postCategory,
                        'pid': comment.PostId
                    },
                    UpdateExpression: 'SET #numComments = #numComments + :inc',
                    ExpressionAttributeNames: {
                        '#numComments': 'numComments'
                    },
                    ExpressionAttributeValues: {
                        ':inc': 1
                    }
                };

                dynamodb.update(updateParams, (err, data) => {
                    if (err) {
                        console.error('Unable to update numComments:', err);
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        console.log('numComments updated successfully:', data);
                        res.json({nickname: comment.nickname, commentId: nextCommentId});
                    }
                });
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
// TODO delete from user table
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
            if (data.Attributes) {
                const oldPostId = data.Attributes.postId;
                // Update numComments for the corresponding post
                const updateParams = {
                    TableName: 'Post',
                    Key: {
                        'postCategory': category,
                        'pid': oldPostId
                    },
                    UpdateExpression: 'SET #numComments = #numComments - :dec',
                    ExpressionAttributeNames: {
                        '#numComments': 'numComments'
                    },
                    ExpressionAttributeValues: {
                        ':dec': 1
                    }
                };
                // Decrease numComments by 1
                dynamodb.update(updateParams, (err, data) => {
                    if (err) {
                        console.error('Error updating numComments:', err);
                        res.status(500).json({ error: 'Error updating numComments.' });
                    } else {
                        console.log('numComments updated successfully:', data);
                        res.json({ message: 'Comment deleted successfully.' });
                    }
                });
            } else {
                res.status(404).json({ error: 'Comment not found.' });
            }
        }
    });
});


// User edits a comment
// TODO need to check if req user and comment user matches
router.put('/:params', async (req, res) => {
    const { postCategory, commentId } = JSON.parse(req.params.params);
    const { body } = req.body;

    const params = {
        TableName: 'Comment',
        Key: {
            'postCategory': postCategory,
            'commentId': commentId
        },
        UpdateExpression: 'SET body = :body, isEdited = :isEdited',
        ExpressionAttributeValues: {
            ':body': body,
            ':isEdited': true,
        },
        ReturnValues: 'ALL_NEW'
    };

    dynamodb.update(params, (err, data) => {
        if (err) {
            console.error('Error updating comment:', err);
            res.status(500).json({ error: 'Error updating comment.' });
        } else {
            res.json({ message: 'Comment updated successfully.' });
        }
    });
});


// Endpoint not checked yet
router.post('/nested/:params', validateToken, async (req, res) => {
    const nestedComment = req.body;
    const user = req.user;

    const params = {
        TableName: 'nestedComment',
        KeyConditionExpression: 'postCategory = :postCategory',
        ExpressionAttributeValues: {
            ':postCategory': nestedComment.postCategory
        },
        ProjectionExpression: 'nestedCommentId',
        ScanIndexForward: false,
        Limit: 1
    };

    dynamodb.query(params, (err, data) => {
        const comment = data.body;
        if (err) {
            console.error('Unable to query table:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            let nextNestedCommentId;
            if (data.Items.length === 0) {
                nextNestedCommentId = 0; // Start from 0 if no items found
            } else {
                nextNestedCommentId = data.Items[0].nextNestedCommentId + 1; // Increment the highest commentId by 1
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

            let updatedNestedComment = data.Item.nestedComment;
            const nested = {
                'body': comment.nestedComment.body,
                'commenterId': user.id,
                'date': formattedDate,
                'isDeleted': false,
                'isEdited': false,
                'likers': [],
                'nestedCommentId': nextNestedCommentId,
                'nickname': comment.nestedComment.nickname,
                'numLikes': 0,
            };

            updatedNestedComment.push(nested);

            const updateNestedComment = {
                TableName: 'Comment',
                Key: {
                    'postCategory': comment.postCategory,
                    'commendId': comment.commendId,
                },
                UpdateExpression: 'SET nestedComment = :nestedComment',
                ExpressionAttributeValues: {
                    ':nestedComment': updatedNestedComment
                },
                ReturnValues: 'ALL_NEW'
            };

            dynamodb.update(updateNestedComment, (err, data) => {
                if (err) {
                    console.error('Error updating User table:', err);
                    res.status(500).json({ error: 'Error updating User table' });
                    return;
                }

                console.log('User table updated successfully:', data);
            });
        }
    });
});


module.exports = router;