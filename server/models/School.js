module.exports = (sequelize, DataTypes) => {
    const School = sequelize.define("School", {
        schoolName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    School.associate = (models) => {
        School.hasMany(models.Post, {});
    };
    return School;
}