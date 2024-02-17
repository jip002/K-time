module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define("Post", {
        postTitle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        postBody: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        postCategory: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        editDate: {
            type: DataTypes.STRING,
            allowNull: true
        },
        postAuthor: {
            type: DataTypes.STRING,
            defaultValue: 'Anonymous User',
            allowNull: false
        },
        numLike: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
    });
    Post.associate = (models) => {
        Post.hasMany(models.Comment, {
            onDelete: "cascade"
        });
        Post.hasMany(models.PostLike, {
            onDelete: "cascade"
        });
    };
    return Post;
}