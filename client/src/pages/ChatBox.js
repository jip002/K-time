import { useState, useEffect } from 'react';
import axios from 'axios';
import ChatInfo from '../components/ChatInfo';
import InboxContainer from '../components/InboxContainer';
import NewMessageForm from '../components/NewMessageForm';
import SentBoxContainer from '../components/SentBoxContainer';
import '../styles/ChatBox.css';

export const ChatBox = () => {
  const [sentBox, setSentBox] = useState([]);
  const [inBox, setInBox] = useState([]);
  const [selectedChat, setSelectedChat] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [openChatInfo, setOpenChatInfo] = useState(false);
  const [writeMessage, setWriteMessage] = useState(false);

  const sendMessage = () => {
    axios.post(`http://localhost:3001/chatboxes/byEmail`, {msgContent: newMessage, receiverEmail: receiverEmail}, {
        headers: {
            accessToken: sessionStorage.getItem('accessToken')
        }
    }).then((res) => {
        console.log(res.data);
        setSentBox([...sentBox, res.data]);
        setNewMessage('');
        setReceiverEmail('');
        setWriteMessage(false);
    })
  }

  const addToSentBox = (newChat) => {
    setSentBox([...sentBox, newChat]);
  };

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
      <div className = 'writeMsgBtn' onClick={() => setWriteMessage(true)}>Write A Message</div>
      <ChatInfo 
        open = {openChatInfo} 
        onClose = {closeInfo} 
        chat = {selectedChat} 
        isSent = {isSent}
        addToSentBox = {addToSentBox}/>
      <div className='chatBoxContainer'>
        <SentBoxContainer 
            sentBox={sentBox}
            openInfo={openInfo}
            senderDelete={senderDelete}
        />
        <InboxContainer 
            inBox={inBox}
            openInfo={openInfo}
            receiverDelete={receiverDelete}
        />
      </div>
      {writeMessage && 
        <NewMessageForm
            sendMessage={sendMessage}
            setWriteMessage={setWriteMessage}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            receiverEmail={receiverEmail}
            setReceiverEmail={setReceiverEmail}
        />
      }
    </div>
  );  
}