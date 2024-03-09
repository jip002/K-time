import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const CreatePostForm = ({ onSubmit }) => {
    const initialValues = {
        postTitle: '',
        postBody: '',
        postCategory: ''
    };

    const validationSchema = Yup.object().shape({
        postTitle: Yup.string().max(100).required('Title cannot be empty'),
        postBody: Yup.string().required('Body text cannot be empty'),
        postCategory: Yup.string().required('Category cannot be empty')
    });

    return (
        <Formik 
            initialValues={initialValues} 
            onSubmit={onSubmit}
            validationSchema={validationSchema}
        >
            <Form className='formContainer'>
                <label>Title: </label><br/>
                <Field 
                    id='inputCreatePost' 
                    name='postTitle' 
                    placeholder='Put title here...'
                    className = 'createTitle'
                />
                <ErrorMessage name='postTitle' component='span'/><br/>
                
                <label>Body: </label><br/>
                <Field 
                    as='textarea'
                    id='inputCreatePostBody' 
                    name='postBody' 
                    placeholder='Put body text here...'
                />
                <ErrorMessage name='postBody' component='span'/><br/>
                
                <label>Category: </label><br/>
                <Field 
                    id='inputCreatePostCategory' 
                    name='postCategory' 
                    placeholder='Put category here...'
                    className='createCategory'
                />
                <ErrorMessage name='postCategory' component='span'/><br/>
                
                <button type='submit'>Post</button>
            </Form>
        </Formik>
    );
}

export default CreatePostForm;