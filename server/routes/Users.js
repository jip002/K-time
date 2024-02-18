const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { sign } = require('jsonwebtoken');
const { validateToken } = require('../middlewares/AuthMiddleware');
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();


router.get('/verify', validateToken, (req, res) => {
    res.json(req.user);
});

// router.get('/:id', async (req, res) => {
//     const id = req.params.id;
//     const user = await User.findByPk(id);
//     res.json(user);
// });


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
                            'background': '000000',
                            'emailNotification': true,
                            'font': 'testFont',
                            'interactions': {'likedPost': [], 'commentedPost': [], 'createdPost': [], 'savedPost': []},
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
                            res.json('SUCCESS');
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
            ProjectionExpression: 'uid',
            ScanIndexForward: false,
            Limit: 1
        };

        dynamodb.query(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                if (data.Items.length === 0) {
                    // If no user found for the school, start from 1
                    resolve(1);
                } else {
                    // Get the highest uid and increment it by 1
                    const highestUid = data.Items[0].uid;
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
            res.json({error: "User Doesn't Exist"});
        }

        const user = data.Items[0]; // Assuming email is unique

        bcrypt.compare(password, user.password).then((match) => {
            if(!match) res.json({error: "Wrong Email and Password Combination"});
    
            const accessToken = sign({nickname: user.nickname, id: user.uid},"secret");
            // console.log('login');
            res.json({
                token: accessToken,
                nickname: user.nickname,
                id: user.uid
            });
        });
    });
});

module.exports = router;