import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ChatBox.css';
import ChatInfo from '../components/ChatInfo';

export const ChatBox = () => {
  const [sentBox, setSentBox] = useState([]);
  const [inBox, setInBox] = useState([]);
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [selectedChat, setSelectedChat] = useState({});
  const [isSent, setIsSent] = useState(false);
  const [openChatInfo, setOpenChatInfo] = useState(false);
  const [writeMessage, setWriteMessage] = useState(false);

  const addToSentBox = (newChat) => {
    setSentBox([...sentBox, newChat]);
  };

  const sendMessage = () => {
    axios.post(`http://localhost:3001/chats`, {msgContent: newMessage, receiverEmail: receiverEmail}, {
        headers: {
            accessToken: sessionStorage.getItem('accessToken')
        }
    }).then((res) => {
        setSentBox([...sentBox, res.data]);
        setNewMessage('');
        setReceiverEmail('');
        setWriteMessage(false);
    })
  }

  const openInfo = (chat,isSent) => {
    chat.isRead = true;
    setSelectedChat(chat);
    setIsSent(isSent);
    if (!isSent) { // if it's a received message, mark as read
        let chatId = chat.chatId;
        axios.get(`http://localhost:3001/chats/${chatId}`, {}, {
            headers: {
                accessToken: sessionStorage.getItem('accessToken')
            }
        }).then((res) => {
            setInBox(inBox.map(item => {
                if (item.chatId === chat.chatId)
                    return { ...item, isRead: true };
                return item;
            }));
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
    axios.delete(`http://localhost:3001/chats/sent/${chatId}`, {}, {
        headers: {
            accessToken: sessionStorage.getItem('accessToken')
        }
    }).then((res) => {
        setSentBox(sentBox.filter((chat) => {
            return chat.chatId != chatId;
        }))
    });
  }

  const receiverDelete = (chatId) => {
    axios.delete(`http://localhost:3001/chats/received/${chatId}`, {}, {headers: {
        accessToken: sessionStorage.getItem('accessToken')
    }}).then((res) => {
        setInBox(inBox.filter((chat) => {
            return chat.chatId != chatId;
        }))
    });
  }

  useEffect(() => {
    axios.get('http://localhost:3001/chats/sent', {headers: {
        accessToken: sessionStorage.getItem('accessToken')
    }}).then((res) => {
        setSentBox(res.data);
    });

    axios.get('http://localhost:3001/chats/received', {headers: {
        accessToken: sessionStorage.getItem('accessToken')
    }}).then((res) => {
        setInBox(res.data);
    });

  }, []);

  return (
    <div className="ChatBox">
      <h1>ChatBox</h1>
      <div className = 'writeMsgBtn' onClick={() => setWriteMessage(true)}>Write A Message</div>
      <ChatInfo 
        open = {openChatInfo} 
        onClose = {closeInfo} 
        chat = {selectedChat} 
        isSent = {isSent}
        addToSentBox = {addToSentBox}/>
      <div className='chatBoxContainer'> {/* This should wrap both containers */}
        <div className="sentBoxContainer">
            <h2>Chats Sent</h2>
            <div className="sentBox">
                {sentBox.map(chat => (
                    <div key={chat.chatId} className="chatInfo" onClick = {() => openInfo(chat, true)}>
                        <div className='chatContent'>{chat.msgContent}</div>
                        <div className='nickname'>to. {chat.receiverNickname}</div>
                        <div className='chatTime'>{chat.date}</div>
                        <button onClick = {() => senderDelete(chat.chatId)}>x</button>
                    </div>
                ))}
            </div>
        </div>
        <div className='inBoxContainer'>
            <h2>Inboxes</h2>
            <div className="inBox">
                {inBox.map(chat => (
                    <div key={chat.chatId} className="chatInfo" onClick = {() => openInfo(chat, false)}>
                        <div className='chatContent'>{chat.msgContent}</div>
                        <div className='nickname'>from. {chat.senderNickname}</div>
                        <div className='chatTime'>{chat.date}</div>
                        {chat.isRead
                            ? <div className='isRead'>Read</div>
                            : <div className='notRead'>Not Read</div>}
                        <button onClick = {() => receiverDelete(chat.chatId)}>x</button>
                    </div>
                ))}
            </div>
        </div>
      </div>
      {writeMessage && 
      <div className='overlay'>
        <div className='newMessageContainer'>
            <label>Recever Email</label>
            <input
                type='text' 
                value = {receiverEmail}
                autoComplete='off' 
                placeholder='example@gamil.com'
                onChange={event => setReceiverEmail(event.target.value)}
            />
            <label>Message</label>
            <input
                type='text' 
                value = {newMessage}
                autoComplete='off' 
                placeholder='write your message here..'
                onChange={event => setNewMessage(event.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
            <button onClick={() => setWriteMessage(false)}>Cancel</button>
        </div>
      </div>}
    </div>
  );  
}