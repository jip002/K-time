// Define the User model for DynamoDB
const User = (dynamodb, AWS) => {
    const tableName = 'User'
    return {
        create: async (user) => {
            const params = {
                TableName: tableName,
                Item: {
                    school: user.school,
                    uid: user.uid,
                    background: user.background,
                    email: user.email,
                    emailNotification: user.emailNotification,
                    font: user.font,
                    interactions: user.interactions,
                    nickname: user.nickname,
                    password: user.password,
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
