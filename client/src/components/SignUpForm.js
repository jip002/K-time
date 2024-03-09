import React from 'react';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';

const SignUpForm = ({ onSubmit }) => {
    const initialValues = {
        nickname: '',
        password: '',
        email: '',
        school: '',
    };

    const validationSchema = Yup.object().shape({
        nickname: Yup.string().min(3).max(15).required('Nickname cannot be empty'),
        email: Yup.string().required('Email cannot be empty'),
        password: Yup.string().min(7).max(20).required('You must put a password'),
        school: Yup.string().required("School cannot be empty")
    });

  return (
    <Formik 
      initialValues={initialValues} 
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    >
      <Form className='signUpContainer'>
        <label>Nickname: </label><br/>
        <Field 
          id='inputNickname' 
          name='nickname' 
          placeholder='Put your nickname here...'
        />
        <ErrorMessage name='nickname' component='span'/><br/>

        <label>School Email: </label><br/>
        <Field 
          id='inputEmail' 
          name='email' 
          placeholder='Put your school email here...'
        />
        <ErrorMessage name='email' component='span'/><br/>

        <label>Password: </label><br/>
        <Field 
          id='inputPassword' 
          type='password'
          autoComplete='off'
          name='password' 
          placeholder='Put your password here...'
        />
        <ErrorMessage name='password' component='span'/><br/>

        <label>School: </label><br/>
        <Field 
          id='inputSchool' 
          name='school' 
          placeholder='Put your school name here...'
        />
        <ErrorMessage name='school' component='span'/><br/>

        <button type='submit'>Sign Up!</button>
      </Form>
    </Formik>
  );
};

export default SignUpForm;