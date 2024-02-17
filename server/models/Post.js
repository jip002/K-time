// Define the Post model for DynamoDB
const Post = (dynamodb, AWS) => {
    const tableName = 'Post'; // Define the DynamoDB table name
    return {
        create: async (post) => {
            const params = {
                TableName: Post.tableName,
                Item: {
                    postCategory: post.postCategory,
                    postDate: post.postDate,
                    author: post.author,
                    body: post.body,
                    isDeleted: post.isDeleted,
                    isEdited: post.isEdited,
                    likers: post.likers,
                    numLikes: post.numLikes,
                    pid: post.pid,
                    school: post.school,
                    title: post.title,
                    viewCount: post.viewCount,
                }
            };
            try {
                await dynamodb.put(params).promise();
                return params.Item;
            } catch (error) {
                console.error('Error creating post:', error);
                throw error;
            }
        }
        // You can add more methods for updating, querying, deleting, etc., as needed
    }
};

module.exports = Post;
