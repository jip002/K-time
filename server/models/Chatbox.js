module.exports = (sequelize, DataTypes) => {
    const Chatbox = sequelize.define("Chatbox", {
        senderId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        senderNickname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        receiverId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        receiverNickname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        msgContent: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        school:{
            type: DataTypes.STRING,
            allowNull: false
        },
        senderDel: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        receiverDel: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    });

    return Chatbox;
}