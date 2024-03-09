import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const EditPostForm = ({ post, onSubmit }) => {
    const validationSchema = Yup.object().shape({
        postTitle: Yup.string().max(100).required('Title cannot be empty'),
        postBody: Yup.string().required('Body text cannot be empty'),
        postCategory: Yup.string().required('Category cannot be empty')
    });

    const initialValues = {
        postTitle: post.postTitle,
        postBody: post.postBody,
        postCategory: post.postCategory
    }

    return (
        <Formik 
            initialValues={initialValues} 
            onSubmit={onSubmit}
            validationSchema={validationSchema}
        >
            <Form className='formContainer'>
                <label>Title: </label><br/>
                <Field 
                    id='inputEditPostTitle' 
                    name='postTitle' 
                />
                <ErrorMessage name='postTitle' component='span'/><br/>

                <label>Body: </label><br/>
                <Field 
                    as='textarea'
                    id='inputEditPostBody' 
                    name='postBody' 
                />
                <ErrorMessage name='postBody' component='span'/><br/>

                <label>Category: </label><br/>
                <Field 
                    id='inputEditPostCategory' 
                    name='postCategory' 
                />
                <ErrorMessage name='postCategory' component='span'/><br/>

                <button type='submit'>Confirm</button>
            </Form>
        </Formik>
    );
};

export default EditPostForm;