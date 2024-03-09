import React from 'react';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const PostContainer = ({ post, userLiked, likeAPost, authState, editPost, deletePost, likes }) => {
    return (
        <div className='postContainer'>
            <div>{post.postTitle}</div>
            <div className='postBody'>{post.postBody}</div>
            <div>{post.postCategory}</div>
            <div>{post.postAuthor}</div>
            {userLiked 
                ? (<ThumbUpIcon className='userLiked' onClick={likeAPost}/>)
                : (<ThumbUpIcon className='userNotLiked' onClick={likeAPost}/>)
            }
            <div>{likes.length || 0}</div>
            {authState.nickname === post.postAuthor && 
                <>
                    <button onClick={() => editPost(true)}>Edit</button>
                    <button onClick={deletePost}>Delete Post</button>
                </>
            }
        </div>
    );
};

export default PostContainer;