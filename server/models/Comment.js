module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define("Comment", {
        commenter: {
            type: DataTypes.STRING,
            defaultValue: 'Anonymous User',
            allowNull: false,
        },
        text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        numLike: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
    });

    Comment.associate = (models) => {
        Comment.hasMany(models.Subcomment, {});
    };
    return Comment;
}