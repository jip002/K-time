import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import '../styles/Post.css';
import axios from 'axios';

export const Post = () => {
    let { id } = useParams()
    const [post, setPost] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({});
    const {authState} = useContext(AuthContext);

    const addComment = () => {
        const addedComment = {
            commenter: 'Anonymous User',
            text: newComment,
            PostId: id
        };
        console.log(addedComment);
        axios.post('http://localhost:3001/comments', addedComment, {headers: {
          accessToken: sessionStorage.getItem('accessToken')
        }}).then((res) => {
          if(res.data.error) alert(res.data.error);
          else {
            addedComment.commenter = res.data.nickname;
            addedComment.id = res.data.commentId;
            setComments([...comments, addedComment]);
            setNewComment('');
          }
        })
    };

    const deleteComment = (id) => {
      axios.delete(`http://localhost:3001/comments/${id}`, {
        headers: { accessToken: sessionStorage.getItem('accessToken')}
      }).then(()=> {
        setComments(comments.filter((comment) => {
          return comment.id != id;
        }))
      });
    };

    useEffect(() => {
        axios.get(`http://localhost:3001/posts/${id}`)
        .then((response)=>{
          setPost(response.data);
          console.log(response.data);
        });

        axios.get(`http://localhost:3001/comments/byPost/${id}`)
        .then((response)=>{
          setComments(response.data);
          //console.log(response.data);
        });

        setNewComment('');

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
                {authState.nickname === comment.commenter && 
                <button onClick={() => {deleteComment(comment.id)}}>X</button>}
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