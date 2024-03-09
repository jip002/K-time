import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ChangePWForm = ({ onSubmit }) => {
    const initialValues = {
        oldPassword: '',
        newPassword: '',
    };

    const validationSchema = Yup.object().shape({
        oldPassword: Yup.string().max(50).min(5).required('You must put your old password!'),
        newPassword: Yup.string().max(50).min(5).required('You must put new Password'),
    });

    return (
        <Formik 
            initialValues={initialValues} 
            onSubmit={onSubmit}
            validationSchema={validationSchema}
        >
            <Form className='changePasswordContainer'>
                <label>Current Password: </label>
                <Field
                    id='oldpw'
                    name='oldPassword'
                    placeholder='Put your old password here...'
                    className='changePWField'
                />
                <ErrorMessage name='oldPassword' component='span'/><br/>

                <label>New Password: </label>
                <Field
                    id='newpw'
                    name='newPassword'
                    placeholder='Put your new password here...'
                    className='changePWField'
                />
                <ErrorMessage name='newPassword' component='span'/><br/>

                <button type='submit'>Change Password</button>
            </Form>
        </Formik>
    );
};

export default ChangePWForm;