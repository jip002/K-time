// Define the Comment model for DynamoDB
const Comment = (dynamodb, AWS) => {
    const tableName = 'Comment'; // Define the DynamoDB table name

    return {
        create: async (comment) => {
            const params = {
                TableName: tableName,
                Item: {
                    postType: comment.postType,
                    pid: comment.pid,
                    body: comment.body,
                    commenter: comment.commenter,
                    date: comment.date,
                    isDeleted: comment.isDeleted,
                    isEdited: comment.isEdited,
                    likers: comment.likers,
                    nestedComment: comment.nestedComment,
                    numLikes: comment.numLikes,
                }
            };
            try {
                await dynamodb.put(params).promise();
                return params.Item;
            } catch (error) {
                console.error('Error creating comment:', error);
                throw error;
            }
        }
        // You can add more methods for updating, querying, deleting, etc., as needed
    };
};

module.exports = Comment;

