import React, { useState } from 'react';

const NewComment = ({ addComment }) => {
    const [newComment, setNewComment] = useState("");

    const handleInputChange = (event) => {
        setNewComment(event.target.value);
    };

    const handleAddComment = () => {
        addComment(newComment);
        setNewComment("");
    };

    return (
        <div className='newCommentContainer'>
            <input 
                type='text' 
                placeholder='comment...' 
                value={newComment}
                autoComplete='off' 
                onChange={event => handleInputChange(event)}
            />
            <button onClick={handleAddComment}>Add Comment</button>
        </div>
    );
};

export default NewComment;