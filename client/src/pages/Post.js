import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Post.css';
import axios from 'axios';

export const Post = () => {
    let { id } = useParams()
    const [post, setPost] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({});

    const addComment = () => {
        const addedComment = {
            commenter: 'Anonymous User',
            text: newComment,
            PostId: id
        };
        axios.post('http://localhost:3001/comments', addedComment).then((res) => {
            console.log("Comment uploaded");
            setComments([...comments, addedComment]);
            setNewComment('');
        })
    }

    useEffect(() => {
        axios.get(`http://localhost:3001/posts/${id}`)
        .then((response)=>{
          setPost(response.data);
          console.log(response.data);
        });

        axios.get(`http://localhost:3001/comments/byPost/${id}`)
        .then((response)=>{
          setComments(response.data);
        });

      }, []);
    
    return (
      <div className="PostPage">
        <div className='postContainer'>
            <div>{post.postTitle}</div>
            <div className = 'postBody'>{post.postBody}</div>
            <div>{post.postCategory}</div>
            <div>{post.postAuthor}</div>
            <div>{post.numLike}</div>
        </div>
        <div className='commentsContainer'>
            {comments.map((comment, key) => (
            <div key = {key} className='commentForm'>
                <div className="comment">
                    {comment.text}
                </div>
                <div className="commenter">
                    {comment.commenter}
                </div>
            </div>
            ))}
        </div>
        <div className='newCommentContainer'>
            <input 
                type='text' 
                placeholder='comment...' 
                value = {newComment}
                autoComplete='off' 
                onChange={ (event) => { setNewComment(event.target.value) }}
            />
            <button onClick = {addComment}>Add Comment</button>
        </div>
      </div>
    );
  }