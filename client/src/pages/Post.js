import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import CommentsContainer from '../components/CommentsContainer';
import NewComment from '../components/NewComment'; 
import EditPostForm from '../components/EditPostForm';
import PostContainer from '../components/PostContainer';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import '../styles/Post.css';
import axios from 'axios';

export const Post = () => {
    let { id } = useParams()
    const navigate = useNavigate();
    const [post, setPost] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({});
    const [onEdit, setOnEdit] = useState(false);
    const [userLiked, setUserLiked] = useState(false);
    const [likes, setLikes] = useState([]);
    const {authState} = useContext(AuthContext);

    const likeAPost = () => {
      axios.post(`http://localhost:3001/postlikes/${id}`, {}, {headers: {
        accessToken: sessionStorage.getItem('accessToken')
      }}).then((res) => {
        if(res.data.liked == true) { // like success
          console.log('like success');
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
          console.log(res.data)
      })
    }

    const deletePost = () => {
      axios.delete(`http://localhost:3001/posts/${id}`, {headers: {
        accessToken: sessionStorage.getItem('accessToken')
      }}).then((res) => {
        navigate('/forum');
      })
    }

    const editPost = (isEdit) => {
      setOnEdit(isEdit);
    }

    const addComment = () => {
        const addedComment = {
            commenter: 'Anonymous User',
            text: newComment,
            PostId: id
        };
        
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
        })

      }, []);

    const onSubmit = (data) => {
        axios.put(`http://localhost:3001/posts/${id}`, data, {headers: {
            accessToken: sessionStorage.getItem('accessToken')
          }}).then((res) => {
            setOnEdit(false);
            setPost(res.data);
        })
    }

    return (
      <div className="PostPage">
        { !onEdit 
          ? <PostContainer 
                post={post} 
                userLiked={userLiked} 
                likeAPost={likeAPost} 
                authState={authState} 
                editPost={editPost} 
                deletePost={deletePost} 
                likes={likes}
            />
          : <EditPostForm 
                post = {post}
                onSubmit={onSubmit} 
            />
        }

        <CommentsContainer 
            comments={comments} 
            authState={authState} 
            deleteComment={deleteComment}
        />

        <div className='newCommentContainer'>
            <input 
                type='text' 
                placeholder='comment...' 
                value = {newComment}
                autoComplete='off' 
                onChange={ (event) => { setNewComment(event.target.value) }}
                className = 'newCommentField'
            />
            <button onClick = {addComment}>Add Comment</button>
        </div>
      </div>
    );
  }