const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const { validateToken } = require('../middlewares/AuthMiddleware');

const dynamodb = new AWS.DynamoDB.DocumentClient();

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

    const itemParams = {
        TableName: 'Chat',
        Item: {
            // Define the attributes of the item
            'school': school,

            'uid1': user1Id,
            'lastReplyDate': formattedDate,
            'uid2': user2Id,
            'user1left': false,
            'user1Nickname': user1Nickname,
            'user2left': false,
            'user2Nickname': user2Nickname,
            'msgContent': {
                'date': formattedDate,
                'senderNickname': user1Nickname,
                'senderId': user1Id,
                'body': chatMsg
            }
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


})

module.exports = router;