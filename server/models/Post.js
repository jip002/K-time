// module.exports = (sequelize, DataTypes) => {
//     const Post = sequelize.define("Post", {
//         postTitle: {
//             type: DataTypes.STRING,
//             allowNull: false,
//         },
//         postBody: {
//             type: DataTypes.STRING,
//             allowNull: false,
//         },
//         postCategory: {
//             type: DataTypes.STRING,
//             allowNull: false,
//         },
//         editDate: {
//             type: DataTypes.STRING,
//             allowNull: true
//         },
//         postAuthor: {
//             type: DataTypes.STRING,
//             defaultValue: 'Anonymous User',
//             allowNull: false
//         },
//         numLike: {
//             type: DataTypes.INTEGER,
//             defaultValue: 0,
//             allowNull: false,
//         },
//     });
//     Post.associate = (models) => {
//         Post.hasMany(models.Comment, {
//             onDelete: "cascade"
//         });
//     };
//     return Post;
// }


// Define the Post model for DynamoDB
const Post = (dynamodb, AWS) => {
    const tableName = 'Post'; // Define the DynamoDB table name
    return {
        create: async (post) => {
            const params = {
                TableName: Post.tableName,
                Item: {
                    postType: post.postType,
                    postDate: post.postDate,
                    author: post.author,
                    body: post.body,
                    isDeleted: post.isDeleted,
                    isEdited: post.isEdited,
                    likers: post.likers,
                    numLikes: post.numLikes,
                    pid: post.pid,
                    school: post.school,
                    title: post.title
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
