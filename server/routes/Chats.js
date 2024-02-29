const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const { validateToken } = require('../middlewares/AuthMiddleware');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// TODO need to check if there is already a chat room with user1 and user2
router.post('/', validateToken, async (req, res) => {
    let school = req.user.school;
    let user1Id = req.user.id;
    let user1Nickname = req.user.nickname;
    let user2Id = req.body.user2Id;
    let user2Nickname = req.body.user2Nickname;
    let chatMsg = req.body.chatMsg;

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

    // Getting the max pid for a specified school
    const params = {
        TableName: 'Chat',
        KeyConditionExpression: 'school = :school',
        ExpressionAttributeValues: {
            ':school': school
        },
        ProjectionExpression: 'chatId', 
        ScanIndexForward: false,
        Limit: 1
    };
    
    const queryCallback = (err, data) => {
        if (err) {
            console.error('Unable to query table:', err);
            return;
        }

        let lastChatId;
        if (data.Items.length === 0) {
            lastChatId = -1;
        } else {
            lastChatId = data.Items[0].chatId;
        }

        // Increment the last pid value to get the next highest value
        const nextChatId = lastChatId + 1;

        const itemParams = {
            TableName: 'Chat',
            Item: {
                // Define the attributes of the item
                'school': school,
                'chatId': nextChatId,
    
                'senderId': user1Id,
                'date': formattedDate,
                'receiverId': user2Id,
                'senderLeft': false,
                'senderNickname': user1Nickname,
                'receiverLeft': false,
                'receiverNickname': user2Nickname,
                'msgContent': chatMsg,
                'isRead': false,
            },
        };

        dynamodb.put(itemParams, (err, data) => {
            if (err) {
              console.error('Unable to add item to the table. Error JSON:', JSON.stringify(err, null, 2));
            } else {
              console.log('Chat added successfully:', JSON.stringify(data, null, 2));
              res.json({Success: "Success"});
            }
        });
    }

    dynamodb.query(params, queryCallback);
});

router.get('/', validateToken, async (req, res) => {
    let school = req.user.school;
    let userId = req.user.id;

    const params = {
        TableName: 'Chat',
        KeyConditionExpression: 'school = :school',
        FilterExpression: 'uid1 = :uid OR uid2 = :uid',
        ExpressionAttributeValues: {
            ':school': school,
            ':uid': userId
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

router.get('/:params', validateToken, async (req, res) => {
    const { chatId } = JSON.parse(req.params.params); // Decode parameters
    let school = req.user.school;

    const params = {
        TableName: 'Chat',
        KeyConditionExpression: 'school = :school AND chatId = :chatId',
        ExpressionAttributeValues: {
            ':school': school,
            ':chatId': chatId,
        }
    };


    dynamodb.query(params, (err, data) => {
        if (err) {
            console.error('Unable to query the table:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const params2 = {
                TableName: 'Chat',
                Key: {
                    'school': school,
                    'chatId': chatId
                },
                UpdateExpression: 'SET isRead = :isRead',
                ExpressionAttributeValues: {
                    ':isRead': true
                },
                ReturnValues: 'ALL_NEW'
                
            };

            dynamodb.update(params2, (err, data) => {
                if (err) {
                    console.error('Error updating post:', err);
                    res.status(500).json({ error: 'Error updating post.' });
                } else {
                    res.json({ message: 'Read updated successfully.' });
                }
            });

        }
    });

});

router.delete('/:params', validateToken, async (req, res) => {
    const { chatId } = JSON.parse(req.params.params); // Decode parameters
    let school = req.user.school;
    let userId = req.user.id;

    const params = {
        TableName: 'Chat',
        KeyConditionExpression: 'school = :school',
        FilterExpression: 'receiverId = :userId OR senderId = :userId',
        ExpressionAttributeValues: {
            ':school': school,
            ':userId': userId
        }
    };

    dynamodb.query(params, (err, data) => {
        if (err) {
            console.error('Unable to query the table:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log(data[0]);
            // const params2 = {
            //     TableName: 'Chat',
            //     Key: {
            //         'school': school,
            //         'chatId': chatId
            //     },
            //     UpdateExpression: 'SET isRead = :isRead',
            //     ExpressionAttributeValues: {
            //         ':isRead': true
            //     },
            //     ReturnValues: 'ALL_NEW'
                
            // };

            // dynamodb.update(params2, (err, data) => {
            //     if (err) {
            //         console.error('Error updating post:', err);
            //         res.status(500).json({ error: 'Error updating post.' });
            //     } else {
            //         res.json({ message: 'Read updated successfully.' });
            //     }
            // });

        }
    });

});



module.exports = router;