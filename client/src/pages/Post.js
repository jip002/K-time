import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

export const Post = () => {
    let { id } = useParams()
    const [post, setPost] = useState({});
    const [comments, setComments] = useState([]);

    const initialValues = {
        commenter: '',
        text: '',
        PostId: 0
    }

    const onSubmit = (data) => {
        axios.post('http://localhost:3001/comments', data).then((res) => {
            console.log("Comment uploaded");
        })
    }

    const validationSchema = Yup.object().shape({
        text: Yup.string().max(300).required('Comment cannot be empty'),
    })

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
            <div>{post.postBody}</div>
            <div>{post.postCategory}</div>
            <div>{post.postAuthor}</div>
            <div>{post.numLike}</div>
        </div>
        <div className='commentContainer'>
            {comments.map(comment => (
            <div key={comment.id} className="comment">
                {comment.text}
                <div key={comment.id} className="commenter">
                {comment.commenter}
                </div>
            </div>
            ))}
        </div>
        <div className='commentFormikContainer'>
            <Formik>
            <Form className = 'commentFormContainer'>
                <label>Create a comment</label><br/>
                <Field 
                id = 'inputCreateCommenet' 
                name='commentText' 
                placeholder='comment...'
                />
                <br/><ErrorMessage name ='commentText'component = 'span'/><br/>
                <button type = 'submit'>Post Comment</button>
            </Form>
        </Formik>
        </div>
      </div>
    );
  }