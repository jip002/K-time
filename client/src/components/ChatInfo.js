import axios from 'axios';
import React from 'react'
import {useState} from 'react'
import '../styles/ChatInfo.css';

const ChatInfo = ({open, onClose, chat, isSent, addToSentBox}) => {
    const [replyOpen, setReplyOpen] = useState(false);
    const [msgContent, setMsgContent] = useState('');
    if(!open) return null;
    
    const replyMessage = () => {
        axios.post(`http://localhost:3001/chatboxes/${chat.receiverId}`, {msgContent: msgContent}, {
            headers: {
                accessToken: sessionStorage.getItem('accessToken')
            }
        }).then((res) => {
            console.log(res.data);
            setMsgContent('');
            setReplyOpen(false);
            addToSentBox(res.data);
        })
    }

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
                    {!isSent && <button 
                        className='chatReplyBtn'
                        onClick={() => setReplyOpen(true)}>
                            reply</button>}
                    {replyOpen && (
                        <div className='replayBoxContainer'>
                            <input 
                                type='text' 
                                value = {msgContent}
                                autoComplete='off' 
                                onChange={event => setMsgContent(event.target.value)}
                            />
                            <button onClick = {replyMessage}>Reply</button>
                            <button onClick = {() => setReplyOpen(false)}>Cancel</button>
                        </div> )
                    }
                </div>
                <button onClick = {onClose}>x</button>
            </div>
        </div>
    )
}

export default ChatInfo