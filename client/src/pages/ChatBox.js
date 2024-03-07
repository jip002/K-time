import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ChatBox.css';

export const ChatBox = () => {
  const [sentBox, setSentBox] = useState([]);
  const [inBox, setInBox] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3001/chatboxes/sent', {headers: {
        accessToken: sessionStorage.getItem('accessToken')
    }}).then((res) => {
        setSentBox(res.data);
    });

    axios.get('http://localhost:3001/chatboxes/received', {headers: {
        accessToken: sessionStorage.getItem('accessToken')
    }}).then((res) => {
        setInBox(res.data);
    });

  }, []);

  return (
    <div className="ChatBox">
      <h1>ChatBox</h1>
      <div className='chatBoxContainer'> {/* This should wrap both containers */}
        <div className="sentBoxContainer">
            <h2>Chats Sent</h2>
            <div className="sentBox">
                {sentBox.map(chat => (
                    <div key={chat.id} className="chatInfo">
                        <div className='chatContent'>{chat.msgContent}</div>
                        <div className='nickname'>to. {chat.receiverNickname}</div>
                        <div className='chatTime'>{chat.createdAt}</div>
                    </div>
                ))}
            </div>
        </div>
        <div className='inBoxContainer'>
            <h2>Inboxes</h2>
            <div className="inBox">
                {inBox.map(chat => (
                    <div key={chat.id} className="chatInfo">
                        <div className='chatContent'>{chat.msgContent}</div>
                        <div className='nickname'>from. {chat.senderNickname}</div>
                        <div className='chatTime'>{chat.createdAt}</div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );  
}