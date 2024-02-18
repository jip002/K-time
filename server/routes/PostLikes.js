const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const { PostLike } = require('../models');
const { validateToken } = require('../middlewares/AuthMiddleware');

const dynamodb = new AWS.DynamoDB.DocumentClient();

router.put('/', async (req, res) => {
    let postCategory;
    let postId;
    let userId;

    try {
        // Retrieve the item from the table
        const getItemParams = {
            TableName: 'Post',
            Key: {
                'postCategory': postCategory,
                'pid': postId
            }
        };
        const { Item } = await dynamodb.get(getItemParams).promise();

        // If the item doesn't exist, return an error
        if (!Item) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Update numLikes and likers based on whether userId is already in the list
        let { numLikes, likers } = Item;
        likers = likers || [];
        const isLiked = likers.includes(userId);

        // If the userId is not in the likers list, add it and increment numLikes; otherwise, remove it and decrement numLikes
        if (!isLiked) {
            likers.push(userId);
            numLikes++;
        } else {
            const removeIndex = likers.indexOf(userId);
            likers.splice(removeIndex, 1);
            numLikes--;
        }

        // Update the item in the table with the modified numLikes and likers
        const updateParams = {
            TableName: 'Post',
            Key: {
                'postCategory': postCategory,
                'pid': postId
            },
            UpdateExpression: 'SET numLikes = :numLikes, likers = :likers',
            ExpressionAttributeValues: {
                ':numLikes': numLikes,
                ':likers': likers
            },
            ReturnValues: 'ALL_NEW' // Return the updated item
        };
        await dynamodb.update(updateParams).promise();

        // Return success message
        res.json(isLiked ? 'Unlike Success' : 'Like Success');
    } catch (error) {
        console.error('Error updating likes:', error);
        res.status(500).json({ error: 'Error updating likes' });
    }
});

module.exports = router;