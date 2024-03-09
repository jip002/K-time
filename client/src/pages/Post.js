import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import '../styles/Post.css';
import axios from 'axios';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

export const Post = () => {
    let { id } = useParams();
    const { postCategory, pid } = JSON.parse(id);
    const [post, setPost] = useState({});
    const navigate = useNavigate();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({});
    const {authState} = useContext(AuthContext);
    const [onEdit, setOnEdit] = useState(false);
    const [likes, setLikes] = useState([]);
    const [userLiked, setUserLiked] = useState(false);
    const [numLikes, setNumLikes] = useState();

    const likeAPost = () => {
      const params = encodeURIComponent(JSON.stringify({ postCategory, pid }));
      axios.put(`http://localhost:3001/postlikes/${params}`, {}, {headers: {
        accessToken: sessionStorage.getItem('accessToken')
      }}).then((res) => {
        if (res.data.isliked === true) { // unlike success
          setLikes(likes.filter((like) => {
            return like != authState.id;
          }))
          setNumLikes(prevNumLikes => prevNumLikes - 1);
          setUserLiked(false);
        }
        else if(res.data.isliked === false) { // like success
          setLikes([...likes, res.data.uid])
          setUserLiked(true);
          setNumLikes(prevNumLikes => prevNumLikes + 1);
        }
        else {
          console.log(res.data);
        }
      })
    }

    const addComment = () => {
        const addedComment = {
            nickname: authState.nickname,
            body: newComment,
            PostId: pid,
            postCategory: postCategory
        };
        axios.post('http://localhost:3001/comments', addedComment, {headers: {
          accessToken: sessionStorage.getItem('accessToken')
        }}).then((res) => {
          if(res.data.error) alert(res.data.error);
          else {
            addedComment.nickname = res.data.nickname;
            addedComment.commentId = res.data.commentId;
            setComments([...comments, addedComment]);
            setNewComment('');
          }
        })
    };

    // TODO need to test
    const deletePost = () => {
      const params = encodeURIComponent(JSON.stringify({ postCategory, pid }));
      axios.delete(`http://localhost:3001/posts/${params}`, {headers: {
        accessToken: sessionStorage.getItem('accessToken')
      }}).then((res) => {
        navigate('/forum');
      })
    }

    const editPost = (isEdit) => {
      setOnEdit(isEdit);
    }

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
          setUserLiked(response.data.likers.includes(authState.id));
          setNumLikes(response.data.numLikes);
        })

        axios.get(`http://localhost:3001/comments/byPost/${id}`)
        .then((response)=>{
          setComments(response.data);
        });

        setNewComment('');

      }, []);

    const initialValues = {
        postTitle: post.title,
        postBody: post.body,
        postCategory: post.postCategory
    }

    const onSubmit = (data) => {
      const params = encodeURIComponent(JSON.stringify({ postCategory, pid }));
        axios.put(`http://localhost:3001/posts/${params}`, data, {headers: {
            accessToken: sessionStorage.getItem('accessToken')
          }}).then((res) => {
            setOnEdit(false);
            setPost(res.data);
        })
    }

    const validationSchema = Yup.object().shape({
        postTitle: Yup.string().max(100).required('Title cannot be empty'),
        postBody: Yup.string().required('Body text cannot be empty'),
        postCategory: Yup.string().required('Category cannot be empty')
    })
  
    return (
      <div className="PostPage">
        { !onEdit 
          ? <div className='postContainer'>
              <div>{post.title}</div>
              <div className = 'postBody'>{post.body}</div>
              <div>{post.postCategory}</div>
              <div>{post.author}</div>
              {userLiked 
              ? (<ThumbUpIcon className = 'userLiked' onClick = {likeAPost}/>)
              : (<ThumbUpIcon className = 'userNotLiked' onClick = {likeAPost}/>)}
              <div>{numLikes}</div>
              {authState.nickname === post.author && 
                <>
                  <button onClick = {() => editPost(true)}>Edit</button>
                  <button onClick = {() => {deletePost()}}>Delete Post</button>
                </>
              }
            </div>
          : <div className = 'editPostContainer'>
              <Formik 
                initialValues={initialValues} 
                onSubmit = {onSubmit}
                validationSchema = {validationSchema}
              >
                <Form className = 'formContainer'>
                    <label>Title: </label><br/>
                    <Field 
                        id = 'inputCreatePost' 
                        name='title' 
                    />
                    <br/><ErrorMessage name ='title'component = 'span'/><br/>
                    <label>Body: </label><br/>
                    <Field 
                        as='textarea'
                        id = 'inputCreatePost' 
                        name='body' 
                    />
                    <br/><ErrorMessage name ='body'component = 'span'/><br/>
                    <label>Category: </label><br/>
                    <Field 
                        id = 'inputCreatePost' 
                        name='postCategory' 
                    />
                    <br/><ErrorMessage name ='postCategory'component = 'span'/><br/>
                    <button type='submit'>Confirm</button>
                </Form>
              </Formik>
              <button onClick = {() => editPost(false)}>cancel</button>
            </div>
        }
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