import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Post.css';
import axios from 'axios';

export const Post = () => {
    const { id } = useParams(); // Get the encoded params from the URL   TODO can I change the var name?
    const { postCategory, pid } = JSON.parse(id);
    const [post, setPost] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({});

    const addComment = () => {
        const addedComment = {
            nickname: 'Anonymous User',
            body: newComment,
            PostId: pid,
            postCategory: postCategory
        };
        axios.post('http://localhost:3001/comments', addedComment).then((res) => {
            console.log("Comment uploaded");
            setComments([...comments, addedComment]);
            setNewComment('');
        })
    }

    useEffect(() => {
        const params = encodeURIComponent(JSON.stringify({ postCategory, pid }));
        axios.get(`http://localhost:3001/posts/${params}`)
        .then((response)=>{
          setPost(response.data);
        })

        axios.get(`http://localhost:3001/comments/byPost/${params}`)
        .then((response)=>{
          setComments(response.data);
        });

      }, []);
    
    return (
      <div className="PostPage">
        <div className='postContainer'>
            <div>{post.title}</div>
            <div className = 'postBody'>{post.body}</div>
            <div>{post.postType}</div>
            <div>{post.author}</div>
            <div>{post.numLikes}</div>
        </div>
        <div className='commentsContainer'>
            {comments.map((comment, key) => (
            <div key = {key} className='commentForm'>
                <div className="comment">
                    {comment.body}
                </div>
                <div className="commenter">
                    {comment.nickname}
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