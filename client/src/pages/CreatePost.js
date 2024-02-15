import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';
import '../styles/CreatePost.css';

export const CreatePost = () => {
    const navigate = useNavigate();
    const initialValues = {
        postTitle: '',
        postBody: '',
        postCategory: ''
    }

    const onSubmit = (data) => {
        axios.post('http://localhost:3001/posts', data).then((res) => {
            console.log("Post uploaded");
            navigate('/forum');
        })
    }

    const validationSchema = Yup.object().shape({
        postTitle: Yup.string().max(100).required('Title cannot be empty'),
        postBody: Yup.string().required('Body text cannot be empty'),
        postCategory: Yup.string().required('Category cannot be empty')
    })

    return (
      <div className="CreatePostPage">
        <h1>Create Post Page</h1>
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
                placeholder='Put title here...'
                />
                <br/><ErrorMessage name ='postTitle'component = 'span'/><br/>
                <label>Body: </label><br/>
                <Field 
                as='textarea'
                id = 'inputCreatePost' 
                name='postBody' 
                placeholder='Put body text here...'
                />
                <br/><ErrorMessage name ='postBody'component = 'span'/><br/>
                <label>Category: </label><br/>
                <Field 
                id = 'inputCreatePost' 
                name='postCategory' 
                placeholder='Put category here...'
                />
                <br/><ErrorMessage name ='postCategory'component = 'span'/><br/>
                <button type = 'submit'>Post</button>
            </Form>
        </Formik>
      </div>
    );
  }

