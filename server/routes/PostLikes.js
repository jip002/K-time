const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const { PostLike } = require('../models');
const { validateToken } = require('../middlewares/AuthMiddleware');

const dynamodb = new AWS.DynamoDB.DocumentClient();

router.put('/', validateToken, async (req, res) => {
    const user = req.user;
    const uid = user.id;
    const email = user.email;
    const school = user.school;
    const { postCategory, postId } = req.body;

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
        const isLiked = likers.includes(uid);

        // If the userId is not in the likers list, add it and increment numLikes; otherwise, remove it and decrement numLikes
        if (!isLiked) {
            likers.push(uid);
            numLikes++;
        } else {
            const removeIndex = likers.indexOf(uid);
            likers.splice(removeIndex, 1);
            numLikes--;
        }

        // Update the item in the table with the modified numLikes and likers
        // Only storing uid since only user from the same school can view the post
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

        const userParams = {
            TableName: 'User',
            Key: {
                'school': school,
                'email': email
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
            let likedPost = userData.Item.likedPost;

            if (isLiked) {
                likedPost[postCategory] = likedPost[postCategory].filter(item => item !== postId);
            } else {
                // Check if the postCategory key exists in likedPost
                if (!likedPost[postCategory]) {
                    likedPost[postCategory] = [];
                }
                likedPost[postCategory].push(postId);
            }

            // Define params to update the User table with the modified interactions
            const updateUserParams = {
                TableName: 'User',
                Key: {
                    'school': school,
                    'email': email
                },
                UpdateExpression: 'SET likedPost = :likedPost',
                ExpressionAttributeValues: {
                    ':likedPost': likedPost
                },
                ReturnValues: 'ALL_NEW'
            };

            // Update the User table with the modified interactions
            dynamodb.update(updateUserParams, (err, data) => {
                if (err) {
                    console.error('Error updating User table:', err);
                    res.status(500).json({ error: 'Error updating User table' });
                    return;
                }

                console.log('User table updated successfully:', data);
            });
        };
        dynamodb.get(userParams, userQueryCallback);

        // Return success message
        res.json(isLiked ? 'Unlike Success' : 'Like Success');
    } catch (error) {
        console.error('Error updating likes:', error);
        res.status(500).json({ error: 'Error updating likes' });
    }
});

module.exports = router;