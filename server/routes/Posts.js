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
        res.json(data.Items);
        }
    });
});

router.post('/', async (req, res) => {
    const post = req.body;
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
        TableName: 'Post',
        Item: {
          // Define the attributes of the item
          'postType': post.postCategory,
          'postDate': formattedDate,

          'author': 0,  // TODO 추후에 바꿔야 함
          'body': post.postBody,
          'isDeleted': false,
          'isEdited': false,
          'likers': [],
          'numLikes': 0,
          'pid': 1,  // TODO increment (after getting max, needs to be unique)
          'school': 'ucsd',  // TODO user별
          'title': post.postTitle,
        },
      };

    // Add the item to the table
    dynamodb.put(itemParams, (err, data) => {
        if (err) {
          console.error('Unable to add item to the table. Error JSON:', JSON.stringify(err, null, 2));
        } else {
          console.log('Item added successfully:', JSON.stringify(data, null, 2));
        }
    });
});



router.get('/:id', async (req, res) => {
    // const id = req.params.id;
    // // const post = await Post.findByPk(id);
    // // res.json(post);
    // const params = {
    //     TableName: 'Post',
    //     KeyConditionExpression: 'pid = :pid AND postType = :postType', // Adding postType condition
    //     ExpressionAttributeValues: {
    //         ':pid': id,
    //         ':postType': '테스트' // Adding postType value
    //     }
    // };

    // dynamodb.query(params, (err, data) => {
    //     if (err) {
    //         console.error('Unable to query post by pid and postType:', err);
    //         res.status(500).json({ error: 'Unable to query post.' });
    //     } else {
    //         if (data.Items.length === 0) {
    //             res.status(404).json({ error: 'Post not found.' });
    //         } else {
    //             const post = data.Items[0];
    //             res.json(post);
    //         }
    //     }
    // });


    // const postType = req.params.postType;
    const postType = '테스트';
    // const pid = parseInt(req.params.id);
    const pid = 0;

    const params = {
        TableName: 'Post',
        FilterExpression: 'postType = :postType AND pid = :pid',
        ExpressionAttributeValues: {
            ':postType': postType,
            ':pid': pid
        }
    };

    dynamodb.scan(params, (err, data) => {
        if (err) {
            console.error('Unable to scan post by postType and pid:', err);
            res.status(500).json({ error: 'Unable to scan post.' });
        } else {
            if (data.Items.length === 0) {
                res.status(404).json({ error: 'Post not found.' });
            } else {
                const posts = data.Items;
                res.json(posts);
            }
        }
    });
});

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
