import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatInfo from '../components/ChatInfo';
import '../styles/ChatBox.css';

export const ChatBox = () => {
  const [sentBox, setSentBox] = useState([]);
  const [inBox, setInBox] = useState([]);
  const [openChatInfo, setOpenChatInfo] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});
  const [isSent, setIsSent] = useState(false);

  const navigate = useNavigate();

  const openInfo = (chat,isSent) => {
    chat.isRead = true;
    setSelectedChat(chat);
    setIsSent(isSent);
    if (!isSent) { // if it's a received message, mark as read
        axios.put(`http://localhost:3001/chatboxes/read/${chat.id}`, {}, {
            headers: {
                accessToken: sessionStorage.getItem('accessToken')
            }
        }).then((res) => {
            setInBox(inBox.map(item => {
                if (item.id === chat.id)
                    return { ...item, isRead: true };
                return item;
            }));
            console.log('marked as read')
        });
    }
    setOpenChatInfo(true);
  }
  const closeInfo = () => {
    setSelectedChat(null);
    setIsSent(false);
    setOpenChatInfo(false);
  }

  const senderDelete = (chatId) => {
    axios.put(`http://localhost:3001/chatboxes/sent/delete/${chatId}`, {}, {
        headers: {
            accessToken: sessionStorage.getItem('accessToken')
        }
    }).then((res) => {
        console.log(res.data)
        setSentBox(sentBox.filter((chat) => {
            return chat.id != chatId;
        }))
    });
  }

  const receiverDelete = (chatId) => {
    axios.put(`http://localhost:3001/chatboxes/received/delete/${chatId}`, {}, {headers: {
        accessToken: sessionStorage.getItem('accessToken')
    }}).then((res) => {
        console.log(res.data)
        setInBox(inBox.filter((chat) => {
            return chat.id != chatId;
        }))
    });
  }

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
      <ChatInfo open = {openChatInfo} onClose = {closeInfo} chat = {selectedChat} isSent = {isSent}/>
      <div className='chatBoxContainer'> {/* This should wrap both containers */}
        <div className="sentBoxContainer">
            <h2>Chats Sent</h2>
            <div className="sentBox">
                {sentBox.map(chat => (
                    <div key={chat.id} className="chatInfo" onClick = {() => openInfo(chat, true)}>
                        <div className='chatContent'>{chat.msgContent}</div>
                        <div className='nickname'>to. {chat.receiverNickname}</div>
                        <div className='chatTime'>{chat.createdAt}</div>
                        {chat.isRead
                            ? <div className='isRead'>Read</div>
                            : <div className='notRead'>Not Read</div>}
                        <button onClick = {() => senderDelete(chat.id)}>x</button>
                    </div>
                ))}
            </div>
        </div>
        <div className='inBoxContainer'>
            <h2>Inboxes</h2>
            <div className="inBox">
                {inBox.map(chat => (
                    <div key={chat.id} className="chatInfo" onClick = {() => openInfo(chat, false)}>
                        <div className='chatContent'>{chat.msgContent}</div>
                        <div className='nickname'>from. {chat.senderNickname}</div>
                        <div className='chatTime'>{chat.createdAt}</div>
                        <button onClick = {() => receiverDelete(chat.id)}>x</button>
                    </div>
                ))}
            </div>
        </div>
      </div>
      <div>Write A Message</div>
    </div>
  );  
}