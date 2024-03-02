import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import '../styles/ChangePW.css';

export const ChangePW = () => {
    const navigate = useNavigate();
    const initialValues = {
        oldPassword: '',
        newPassword: ''
    }

    const onSubmit = (data) => {
        axios.put('http://localhost:3001/auth/pw', data, {
            headers: {
              accessToken: sessionStorage.getItem('accessToken')
            }
          }).then((res) => {
            console.log(res.data);
            navigate('/profile/1');
          })
    }

    const validationSchema = Yup.object().shape({
        oldPassword: Yup.string().max(50).min(5).required('You must put your old password!'),
        newPassword: Yup.string().max(50).min(5).required('You must put new Password')
    })

    return (
      <div className="ChangePW">
        <h1>Change Password</h1>
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
        >
            <Form className='changePasswordContainer'>
                <label>Current Password: </label>
                <Field
                    id = 'oldpw'
                    name = 'oldPassword'
                    placeholder = 'put your old password here...'
                />
                <br/><ErrorMessage name ='oldPassword'component = 'span'/><br/>
                <label>New Password: </label>
                <Field
                    id = 'newpw'
                    name = 'newPassword'
                    placeholder = 'put your new password here...'
                /><br/>
                <br/><ErrorMessage name ='newPassword'component = 'span'/><br/>
                <button type='submit'>Change Password</button>
            </Form>
        </Formik>
      </div>
    );
}