// Define the Post model for DynamoDB
const User = (dynamodb, AWS) => {
    const tableName = 'User'
    return {
        create: async (user) => {
            const params = {
                TableName: User.tableName,
                Item: {
                    school: post.school,
                    uid: post.uid,
                    background: post.background,
                    email: post.email,
                    emailNotification: post.emailNotification,
                    font: post.font,
                    interactions: post.interactions,
                    nickname: post.nickname,
                    password: post.password,
                }
            };
            try {
                await dynamodb.put(params).promise();
                return params.Item;
            } catch (error) {
                console.error('Error creating user:', error);
                throw error;
            }
        }
        // You can add more methods for updating, querying, deleting, etc., as needed
    }
};

module.exports = User;
