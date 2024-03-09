const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const {Post} = require('../models');
const { validateToken } = require('../middlewares/AuthMiddleware');
const Cookies = require('js-cookie');

const dynamodb = new AWS.DynamoDB.DocumentClient();


// For showing all posts from recent to old on Forum page
router.get('/', validateToken, async (req, res) => {
    const user = req.user;
    const school = user.school;
    const params = {
        TableName: 'Post',
        FilterExpression: 'isDeleted <> :deleted AND school = :school',
        ExpressionAttributeValues: {
            ':deleted': true,
            ':school': school
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
router.post('/', validateToken, async (req, res) => {
    const post = req.body;
    const user = req.user;

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

                'uid': user.id,
                'lastEditDate': formattedDate,
                'author': user.nickname,
                'body': post.postBody,
                'postDate': formattedDate,
                'isDeleted': false,
                'isEdited': false,
                'likers': [],
                'numLikes': 0,
                'school': user.school,
                'title': post.postTitle,
                'viewCount': 0,
                'numComments': 0,
            },
        };

        dynamodb.put(itemParams, (err, data) => {
            if (err) {
              console.error('Unable to add item to the table. Error JSON:', JSON.stringify(err, null, 2));
            } else {
              console.log('Item added successfully:', JSON.stringify(data, null, 2));
            }
        });

        const userParams = {
            TableName: 'User',
            Key: {
                'school': user.school,
                'email': user.email
            }
        }

        // Callback function to handle the user query result and update interactions
        const userQueryCallback = (err, userData) => {
            if (err) {
                console.error('Unable to query User table:', err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }

            if (!userData.Item) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            // Update interactions object with the new post information
            let createdPost = userData.Item.createdPost;

            // Check if the postCategory key exists in createdPost
            if (!createdPost[post.postCategory]) {
                // If not, initialize it as an empty list
                createdPost[post.postCategory] = [];
            }
            createdPost[post.postCategory].push(nextPid);

            // Define params to update the User table with the modified interactions
            const updateUserParams = {
                TableName: 'User',
                Key: {
                    'school': user.school,
                    'email': user.email
                },
                UpdateExpression: 'SET createdPost = :createdPost',
                ExpressionAttributeValues: {
                    ':createdPost': createdPost
                },
                ReturnValues: 'ALL_NEW'
            };

            // Update the User table with the modified interactions
            dynamodb.update(updateUserParams, (err, data) => {
                if (err) {
                    console.error('Error updating User table:', err);
                    res.status(500).json({ error: 'Error updating User table' });
                    return;
                } else {
                    res.json({ success: true });
                }

                console.log('User table updated successfully:', data);
            });
        };

        // Query the User table to retrieve user data
        dynamodb.get(userParams, userQueryCallback);
    };

    dynamodb.query(params, queryCallback);
});


// Get post by postCategory
router.get('/byCategory/:postCategory', validateToken, async (req, res) => {
    const postCategory = req.params.postCategory;
    const user = req.user;
    const school = user.school;

    const params = {
        TableName: 'Post',
        KeyConditionExpression: 'postCategory = :postCategory',
        FilterExpression: 'isDeleted <> :deleted AND school = :school',
        ExpressionAttributeValues: {
            ':postCategory': postCategory,
            ':deleted': true,
            ':school': school,
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
// TODO delete from user table
router.delete('/:params', validateToken, async (req, res) => {
    const { postCategory, pid } = JSON.parse(req.params.params);
    const user = req.user;

    const params = {
        TableName: 'Post',
        Key: {
            'postCategory': postCategory,
            'pid': pid
        },
        ConditionExpression: 'uid = :uid AND school = :school',
        UpdateExpression: 'SET isDeleted = :deleted',
        ExpressionAttributeValues: {
            ':deleted': true,
            ':uid': user.id,
            ':school': user.school,
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


// Editing a post (updating title and body and changing isEdited to true)
// NOTE postCategory can't be edited
router.put('/:params', validateToken, async (req, res) => {
    const { postCategory, pid } = JSON.parse(req.params.params);
    const { title, body } = req.body;
    const user = req.user;

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

    const params = {
        TableName: 'Post',
        Key: {
            'postCategory': postCategory,
            'pid': pid
        },
        ConditionExpression: 'uid = :uid AND school = :school',
        UpdateExpression: 'SET title = :title, body = :body, isEdited = :isEdited, lastEditDate = :lastEditDate',
        ExpressionAttributeValues: {
            ':title': title,
            ':body': body,
            ':isEdited': true,
            ':lastEditDate': formattedDate,
            ':uid': user.id,
            ':school': user.school,
        },
        ReturnValues: 'ALL_NEW'
    };

    dynamodb.update(params, (err, data) => {
        if (err) {
            console.error('Error updating post:', err);
            res.status(500).json({ error: 'Error updating post.' });
        } else {
            res.json(data.Attributes);
        }
    });
});


router.get('/likedByUser', validateToken, (req, res) => {
    const user = req.user;

    const params = {
        TableName: 'User',
        Key: {
            'school': user.school,
            'email': user.email
        }
    };

    dynamodb.get(params, (err, data) => {
        if (err) {
            console.error('Error getting user:', err);
            res.status(500).json({ error: 'Error getting user.' });
        }

        if (!data.Item || !data.Item.likedPost) {
            return res.json({ message: 'No post liked by this user.' });
        }

        const likedPosts = data.Item.likedPost;
        const partitionKeys = Object.keys(likedPosts);
        const queryPromises = [];

        partitionKeys.forEach(partitionKey => {
            const sortKeys = likedPosts[partitionKey];
            sortKeys.forEach(sortKey => {
                const postParams = {
                    TableName: 'Post',
                    Key: {
                        'postCategory': partitionKey,
                        'pid': sortKey
                    }
                };
                // Push the promise returned by dynamodb.get() to the array
                queryPromises.push(dynamodb.get(postParams).promise());
            });
        });

        // Execute all queries asynchronously
        Promise.all(queryPromises)
            .then(results => {
                // Extract the post data from the results
                const posts = results.map(result => result.Item)
                                    .filter(post => !post.isDeleted) // Exclude posts marked as deleted
                                    .sort((a, b) => new Date(b.postDate) - new Date(a.postDate)); // Sort by postDate in descending order
                res.json(posts);
            })
            .catch(error => {
                console.error('Error fetching posts:', error);
                res.status(500).json({ error: 'Error fetching posts.' });
            });
    });
})


router.get('/createdByUser', validateToken, (req, res) => {
    const user = req.user;

    const params = {
        TableName: 'User',
        Key: {
            'school': user.school,
            'email': user.email
        }
    };

    dynamodb.get(params, (err, data) => {
        if (err) {
            console.error('Error getting user:', err);
            res.status(500).json({ error: 'Error getting user.' });
        }

        if (!data.Item || !data.Item.createdPost) {
            return res.json({ message: 'No post created by this user.' });
        }

        const createdPosts = data.Item.createdPost;
        const partitionKeys = Object.keys(createdPosts);
        const queryPromises = [];

        partitionKeys.forEach(partitionKey => {
            const sortKeys = createdPosts[partitionKey];
            sortKeys.forEach(sortKey => {
                const postParams = {
                    TableName: 'Post',
                    Key: {
                        'postCategory': partitionKey,
                        'pid': sortKey
                    }
                };
                // Push the promise returned by dynamodb.get() to the array
                queryPromises.push(dynamodb.get(postParams).promise());
            });
        });

        // Execute all queries asynchronously
        Promise.all(queryPromises)
            .then(results => {
                // Extract the post data from the results
                const posts = results.map(result => result.Item)
                                    .filter(post => !post.isDeleted) // Exclude posts marked as deleted
                                    .sort((a, b) => new Date(b.postDate) - new Date(a.postDate)); // Sort by postDate in descending order
                res.json(posts);
            })
            .catch(error => {
                console.error('Error fetching posts:', error);
                res.status(500).json({ error: 'Error fetching posts.' });
            });
    });
})


// Opening a specific post
router.get('/:params', validateToken, async (req, res) => {
    // ISSUE post call is called twice
    const { postCategory, pid } = JSON.parse(req.params.params); // Decode parameters
    const user = req.user;
    const school = user.school;
    const params = {
        TableName: 'Post',
        KeyConditionExpression: 'postCategory = :postCategory AND pid = :pid',
        ExpressionAttributeValues: {
            ':postCategory': postCategory,
            ':pid': pid,
            ':school': school,
        },
        FilterExpression: 'school = :school'
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

module.exports = router;
