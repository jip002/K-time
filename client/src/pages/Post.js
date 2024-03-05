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

    const deletePost = () => {
      axios.delete(`http://localhost:3001/posts/${id}`, {headers: {
        accessToken: sessionStorage.getItem('accessToken')
      }}).then((res) => {
        console.log(res.data);
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
        console.log(addedComment);
        axios.post('http://localhost:3001/comments', addedComment, {headers: {
          accessToken: sessionStorage.getItem('accessToken')
        }}).then((res) => {
          if(res.data.error) alert(res.data.error);
          else {
            addedComment.commenter = res.data.nickname;
            addedComment.id = res.data.commentId;
            console.log(addedComment)
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
      console.log("#")
      console.log(authState.nickname);
      console.log("#")
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
    

    const initialValues = {
        postTitle: post.postTitle,
        postBody: post.postBody,
        postCategory: post.postCategory
    }

    const onSubmit = (data) => {
        axios.put(`http://localhost:3001/posts/${id}`, data, {headers: {
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
              <div>{post.postTitle}</div>
              <div className = 'postBody'>{post.postBody}</div>
              <div>{post.postCategory}</div>
              <div>{post.postAuthor}</div>
              {userLiked 
              ? (<ThumbUpIcon className = 'userLiked' onClick = {likeAPost}/>)
              : (<ThumbUpIcon className = 'userNotLiked' onClick = {likeAPost}/>)}
              <div>{likes.length}</div>
              {authState.nickname === post.postAuthor && 
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
                        name='postTitle' 
                    />
                    <br/><ErrorMessage name ='postTitle'component = 'span'/><br/>
                    <label>Body: </label><br/>
                    <Field 
                        as='textarea'
                        id = 'inputCreatePost' 
                        name='postBody' 
                    />
                    <br/><ErrorMessage name ='postBody'component = 'span'/><br/>
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