import React from 'react';

const SentBoxContainer = ({ sentBox, openInfo, senderDelete }) => {
    return (
        <div className="sentBoxContainer">
            <h2>Chats Sent</h2>
            <div className="sentBox">
                {sentBox.map(chat => (
                    <div key={chat.id} className="chatInfo" onClick={() => openInfo(chat, true)}>
                        <div className='chatContent'>{chat.msgContent}</div>
                        <div className='nickname'>to. {chat.receiverNickname}</div>
                        <div className='chatTime'>{chat.createdAt}</div>
                        {chat.isRead
                            ? <div className='isRead'>Read</div>
                            : <div className='notRead'>Not Read</div>}
                        <button onClick={(e) => {
                            e.stopPropagation();
                            senderDelete(chat.id);
                        }}>x</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SentBoxContainer;