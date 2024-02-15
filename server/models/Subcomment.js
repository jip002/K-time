module.exports = (sequelize, DataTypes) => {
    const Subcomment = sequelize.define("Subcomment", {
        Subcommenter: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        text: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });
    return Subcomment;
}