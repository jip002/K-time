import React from 'react';

const InboxContainer = ({ inBox, openInfo, receiverDelete }) => {
    return (
        <div className='inBoxContainer'>
            <h2>Inboxes</h2>
            <div className="inBox">
                {inBox.map(chat => (
                    <div key={chat.id} className="chatInfo" onClick={() => openInfo(chat, false)}>
                        <div className='chatContent'>{chat.msgContent}</div>
                        <div className='nickname'>from. {chat.senderNickname}</div>
                        <div className='chatTime'>{chat.createdAt}</div>
                        <button onClick={(e) => {
                            e.stopPropagation(); // Prevent opening the chat info when clicking delete
                            receiverDelete(chat.id);
                        }}>x</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InboxContainer;