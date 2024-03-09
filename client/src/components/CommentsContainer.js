import React from 'react';

const CommentsContainer = ({ comments, authState, deleteComment }) => {
    return (
        <div className='commentsContainer'>
            {comments.map((comment, key) => (
                <div key={key} className='commentForm'>
                    <div className="comment">
                        {comment.text}
                    </div>
                    <div className="commenter">
                        {comment.commenter}
                    </div>
                    {authState.nickname === comment.commenter && 
                    <button onClick={() => deleteComment(comment.id)}>X</button>}
                </div>
            ))}
        </div>
    );
};

export default CommentsContainer;