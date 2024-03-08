import React from 'react'
import '../styles/ChatInfo.css';

const ChatInfo = ({open, onClose, chat, isSent}) => {
    if(!open) return null;
    return (
        <div className='overlay' onClick = {onClose}>
            <div className='chatInfoContainer' onClick={e => e.stopPropagation()}>
                <div className='detailedInfo'>
                    <div className='chatBody'>{chat?.msgContent}</div>
                    <div className='chatUserNickname'>
                        {isSent 
                            ? `to. ${chat?.receiverNickname}` 
                            : `from. ${chat?.senderNickname}`}
                    </div>
                    <div className='chatDate'>{chat?.createdAt}</div>
                    {!isSent && <button className='chatReplyBtn'>reply</button>}
                </div>
                <button onClick = {onClose}>x</button>
            </div>
        </div>
    )
}

export default ChatInfo