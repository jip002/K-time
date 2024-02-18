import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import '../styles/Post.css';
import axios from 'axios';

export const Post = () => {
    let { id } = useParams();
    const { postCategory, pid } = JSON.parse(id);
    const [post, setPost] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({});
    const {authState} = useContext(AuthContext);

    const addComment = () => {
        const addedComment = {
            nickname: authState.nickname,
            body: newComment,
            PostId: pid,
            postCategory: postCategory
        };
        // console.log(addedComment);
        // console.log(authState.nickname);
        axios.post('http://localhost:3001/comments', addedComment, {headers: {
          accessToken: sessionStorage.getItem('accessToken')
        }}).then((res) => {
          if(res.data.error) alert(res.data.error);
          else {
            addedComment.commenter = res.data;
            setComments([...comments, addedComment]);
            setNewComment('');
            console.log(res.data);
          }
        })
    };

    const deleteComment = (category, id) => {
      const params = encodeURIComponent(JSON.stringify({ category, id }));
      axios.delete(`http://localhost:3001/comments/${params}`, {
        headers: { accessToken: sessionStorage.getItem('accessToken')}
      }).then(()=> {
        setComments(comments.filter((comment) => {
          return comment.commentId != id;
        }))
      });
    };

    useEffect(() => {
        const params = encodeURIComponent(JSON.stringify({ postCategory, pid }));
        axios.get(`http://localhost:3001/posts/${params}`)
        .then((response)=>{
          setPost(response.data);
        })

        axios.get(`http://localhost:3001/comments/byPost/${id}`)
        .then((response)=>{
          setComments(response.data);
        });

        setNewComment('');

      }, []);
    
    return (
      <div className="PostPage">
        <div className='postContainer'>
            <div>{post.title}</div>
            <div className = 'postBody'>{post.body}</div>
            <div>{post.postCategory}</div>
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
                {authState.nickname === comment.nickname && 
                <button onClick={() => {deleteComment(comment.postCategory, comment.commentId)}}>X</button>}
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