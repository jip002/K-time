module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        nickname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        school: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    User.associate = (models) => {
        User.hasMany(models.PostLike, {
            onDelete: "cascade"
        });
        User.hasMany(models.Post, {});
        User.hasMany(models.Comment, {});
    };

    return User;
}