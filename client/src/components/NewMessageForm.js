import React from 'react';

const NewMessageForm = ({ sendMessage, setWriteMessage, newMessage, setNewMessage, receiverEmail, setReceiverEmail }) => {
    return (
        <div className='overlay'>
            <div className='newMessageContainer'>
                <label>Receiver Email:</label>
                <input
                    type='text'
                    value={receiverEmail}
                    autoComplete='off'
                    placeholder='example@gmail.com'
                    onChange={event => setReceiverEmail(event.target.value)}
                />
                <label>Message:</label>
                <input
                    type='text'
                    value={newMessage}
                    autoComplete='off'
                    placeholder='Write your message here...'
                    onChange={event => setNewMessage(event.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
                <button onClick={() => setWriteMessage(false)}>Cancel</button>
            </div>
        </div>
    );
};

export default NewMessageForm;