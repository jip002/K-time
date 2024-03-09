const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { sign } = require('jsonwebtoken');
const { validateToken } = require('../middlewares/AuthMiddleware');
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// API
router.get('/verify', validateToken, (req, res) => {
    res.json(req.user);
});


router.post('/', async (req, res) => {
    const { nickname, password, email, school } = req.body;

    // Generate the next highest uid for the given school
    getNextUidForSchool(school)
        .then(nextUid => {
            // Hash the password
            bcrypt.hash(password, 10)
                .then(hash => {
                    // Construct item parameters with the next uid
                    const params = {
                        TableName: 'User',
                        Item: {
                            'school': school,
                            'uid': nextUid,
                            'password': hash,
                            'email': email,
                            'likedPost': {},
                            'createdPost': {},
                            'nickname': nickname
                        }
                    };

                    // Insert the item into DynamoDB
                    dynamodb.put(params, (putErr, putData) => {
                        if (putErr) {
                            console.error('Unable to add item to the table:', putErr);
                            res.status(500).json({ error: 'Internal Server Error' });
                        } else {
                            console.log('Item added successfully:', putData);
                            const accessToken = sign({nickname: nickname, id: nextUid, school: school, email: email},"secret");
                            // console.log('login');
                            res.json({
                                token: accessToken,
                                nickname: nickname,
                                id: nextUid,
                                school: school,
                                email: email
                            });
                        }
                    });
                });
        })
        .catch(error => {
            console.error('Error generating next uid:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// Function to get the next highest uid for a given school
function getNextUidForSchool(school) {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: 'User',
            KeyConditionExpression: 'school = :school',
            ExpressionAttributeValues: {
                ':school': school
            },
            ProjectionExpression: 'uid'
        };

        dynamodb.query(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                if (data.Items.length === 0) {
                    // If no user found for the school, start from 1
                    resolve(1);
                } else {
                    console.log(data);
                    // Get the highest uid and increment it by 1
                    const highestUid = data.Items.length;
                    resolve(highestUid + 1);
                }
            }
        });
    });
};


router.post('/login', async (req, res) => {
    const { password, email } = req.body;

    // Scan the DynamoDB table to find a user with the provided email
    // NOTE if school given, can perform query faster
    const params = {
        TableName: 'User',
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
            ':email': email
        }
    };

    dynamodb.scan(params, async (err, data) => {
        if (err) {
            console.error('Error scanning DynamoDB table:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Check if any user with the provided email is found
        if (data.Items.length === 0) {
            return res.json({error: "User Doesn't Exist"});
        }

        const user = data.Items[0]; // Assuming email is unique

        bcrypt.compare(password, user.password).then((match) => {
            if(!match) res.json({error: "Wrong Email and Password Combination"});
    
            const accessToken = sign({nickname: user.nickname, id: user.uid, school: user.school, email: user.email},"secret");
            res.json({
                token: accessToken,
                nickname: user.nickname,
                id: user.uid,
                school: user.school,
                email: user.email
            });
        });
    });
});

router.post('/glogin', async (req, res) => {
    const { password, email } = req.body;

    // Scan the DynamoDB table to find a user with the provided email
    // NOTE if school given, can perform query faster
    const params = {
        TableName: 'User',
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
            ':email': email
        }
    };

    dynamodb.scan(params, async (err, data) => {
        if (err) {
            console.error('Error scanning DynamoDB table:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Check if any user with the provided email is found
        if (data.Items.length === 0) {
            return res.json({error: "User Doesn't Exist"});
        }

        const user = data.Items[0]; // Assuming email is unique

        const accessToken = sign({nickname: user.nickname, id: user.uid, school: user.school, email: user.email},"secret");
            // console.log('login');
            res.json({
                token: accessToken,
                nickname: user.nickname,
                id: user.uid,
                school: user.school,
                email: user.email
            });
    });
});

// nickname 수정
// TODO update changedNickname in token
router.put('/nickname', validateToken, async (req, res) => {
    const user = req.user;
    const { nickname } = req.body;

    const updateUserParams = {
        TableName: 'User',
        Key: {
            'school': user.school,
            'email': user.email
        },
        UpdateExpression: 'SET nickname = :newNickname',
        ExpressionAttributeValues: {
            ':newNickname': nickname
        },
        ReturnValues: 'ALL_NEW' // Optional parameter to return the updated item
    };

    try {
        await dynamodb.update(updateUserParams).promise();


        // Update nickname in the Post table
        const postParams = {
            TableName: 'Post',
            FilterExpression: 'school = :school AND uid = :uid',
            ExpressionAttributeValues: {
                ':school': user.school,
                ':uid': user.id
            }
        };
        
        dynamodb.scan(postParams, async (err, data) => {
            if (err) {
                console.error("Unable to scan Post table. Error JSON:", JSON.stringify(err, null, 2));
                res.status(500).json({ error: 'Unable to update posts' });
            } else {
                try {
                    for (const post of data.Items) {
                        const updateParams = {
                            TableName: 'Post',
                            Key: {
                                'postCategory': post.postCategory,
                                'pid': post.pid // Assuming 'pid' is the sort key
                            },
                            UpdateExpression: 'SET author = :newNickname',
                            ExpressionAttributeValues: {
                                ':newNickname': nickname
                            }
                        };
                        await dynamodb.update(updateParams).promise();
                    }
                } catch (error) {
                    console.error("Error updating posts:", error);
                    res.status(500).json({ error: 'Unable to update posts' });
                }
            }
        });
        

        // Update nickname in the Comment table
        const commentParams = {
            TableName: 'Comment',
            FilterExpression: 'school = :school AND uid = :uid',
            ExpressionAttributeValues: {
                ':school': user.school,
                ':uid': user.id
            }
        };

        dynamodb.scan(commentParams, async (err, data) => {
            if (err) {
                console.error("Unable to scan Comment table. Error JSON:", JSON.stringify(err, null, 2));
                res.status(500).json({ error: 'Unable to update comments' });
            } else {
                try {
                    for (const comment of data.Items) {
                        const updateParams = {
                            TableName: 'Comment',
                            Key: {
                                'postCategory': comment.postCategory,
                                'commentId': comment.commentId // Assuming 'pid' is the sort key
                            },
                            UpdateExpression: 'SET nickname = :newNickname',
                            ExpressionAttributeValues: {
                                ':newNickname': nickname
                            }
                        };
                        await dynamodb.update(updateParams).promise();
                    }
                } catch (error) {
                    console.error("Error updating comments:", error);
                    res.status(500).json({ error: 'Unable to update comments' });
                }
            }
        });


        // Update nickname in the Chat table (sender)
        const chatParams = {
            TableName: 'Chat',
            FilterExpression: 'school = :school AND senderId = :uid',
            ExpressionAttributeValues: {
                ':school': user.school,
                ':uid': user.id
            }
        };

        dynamodb.scan(chatParams, async (err, data) => {
            if (err) {
                console.error("Unable to scan Chat table. Error JSON:", JSON.stringify(err, null, 2));
                res.status(500).json({ error: 'Unable to update chat' });
            } else {
                try {
                    for (const chat of data.Items) {
                        const updateParams = {
                            TableName: 'Chat',
                            Key: {
                                'school': chat.school,
                                'chatId': chat.chatId // Assuming 'pid' is the sort key
                            },
                            UpdateExpression: 'SET senderNickname = :newNickname',
                            ExpressionAttributeValues: {
                                ':newNickname': nickname
                            }
                        };
                        await dynamodb.update(updateParams).promise();
                    }
                } catch (error) {
                    console.error("Error updating chat:", error);
                    res.status(500).json({ error: 'Unable to update chat' });
                }
            }
        });


        // Update nickname in the Chat table (receiver)
        const chatParams2 = {
            TableName: 'Chat',
            FilterExpression: 'school = :school AND receiverId = :uid',
            ExpressionAttributeValues: {
                ':school': user.school,
                ':uid': user.id
            }
        };

        dynamodb.scan(chatParams2, async (err, data) => {
            if (err) {
                console.error("Unable to scan Chat table. Error JSON:", JSON.stringify(err, null, 2));
                res.status(500).json({ error: 'Unable to update chat' });
            } else {
                try {
                    for (const chat of data.Items) {
                        const updateParams = {
                            TableName: 'Chat',
                            Key: {
                                'school': chat.school,
                                'chatId': chat.chatId // Assuming 'pid' is the sort key
                            },
                            UpdateExpression: 'SET receiverNickname = :newNickname',
                            ExpressionAttributeValues: {
                                ':newNickname': nickname
                            }
                        };
                        await dynamodb.update(updateParams).promise();
                    }
                } catch (error) {
                    console.error("Error updating chat:", error);
                    res.status(500).json({ error: 'Unable to update chat' });
                }
            }
        });
 

        const accessToken = sign({nickname: nickname, id: user.uid, school: user.school, email: user.email},"secret");
        res.json({
            token: accessToken,
            nickname: nickname,
            id: user.uid,
            school: user.school,
            email: user.email
        });
        // res.json({ success: true });
    } catch (error) {
        console.error("Error updating nickname:", error);
        res.status(500).json({ error: 'Unable to update nickname' });
    }
});


// password 수정
router.put('/pw', validateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;

    try {

        const checkingOldPwparams = {
            TableName: 'User',
            Key: {
                'school': user.school,
                'email': user.email
            }
        };

        dynamodb.get(checkingOldPwparams, async (err, data) => {
            if (err) {
                console.error("Error retrieving user data:", err);
                return res.status(500).json({ error: 'Internal server error' });
            }
        
            if (!data.Item || !(await bcrypt.compare(oldPassword, data.Item.password))) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }

            // res.json({ success: true, message: 'Current password is correct' });

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const params = {
                TableName: 'User',
                Key: {
                    'school': user.school,
                    'email': user.email
                },
                UpdateExpression: 'SET password = :newPassword',
                ExpressionAttributeValues: {
                    ':newPassword': hashedPassword
                },
                ReturnValues: 'ALL_NEW' // Optional parameter to return the updated item
            };

            // Update the item in the database
            dynamodb.update(params, (err, data) => {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                    res.status(500).json({ error: 'Unable to update password' });
                } else {
                    console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                    res.json({ success: true });
                }
            });
        });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;