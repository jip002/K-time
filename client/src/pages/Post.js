import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import '../styles/Post.css';
import axios from 'axios';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

export const Post = () => {
    let { id } = useParams()
    const [post, setPost] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({});
    const [userLiked, setUserLiked] = useState(false);
    const [likes, setLikes] = useState([]);
    const {authState} = useContext(AuthContext);

    const likeAPost = () => {
      axios.post(`http://localhost:3001/postlikes/${id}`, {}, {headers: {
        accessToken: sessionStorage.getItem('accessToken')
      }}).then((res) => {
        if(res.data.liked == true) { // like success
          setLikes([...likes, res.data.newLike])
          setUserLiked(true);
        }
        else if(res.data.liked == false) { // unlike success
          setLikes(likes.filter((like) => {
            return like.UserId != authState.id;
          }))
          setUserLiked(false);
        }
        else 
          console.log(res.data) // error occured
      })
    }

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

          console.log(response.data.postBody);
        });

        axios.get(`http://localhost:3001/comments/byPost/${id}`)
        .then((response)=>{
          setComments(response.data);
        });
        setNewComment('');

        //if user is not logged in, the like icon will be gray
        if(!authState.status) setUserLiked(false);
  
        axios.get(`http://localhost:3001/postlikes/${id}`).then((res) => {
          setLikes(res.data);
          console.log(res.data);
          console.log(id);
        })

      }, []);
    
    return (
      <div className="PostPage">
        <div className='postContainer'>
            <div>{post.postTitle}</div>
            <div className = 'postBody'>{post.postBody}</div>
            <div>{post.postCategory}</div>
            <div>{post.postAuthor}</div>
            {userLiked 
            ? (<ThumbUpIcon className = 'userLiked' onClick = {likeAPost}/>)
            : (<ThumbUpIcon className = 'userNotLiked' onClick = {likeAPost}/>)}
            <div>{likes.length}</div>
            
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