import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const LoginForm = ({ onSubmit }) => {
  const initialValues = {
    email: '',
    password: ''
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().required('Email cannot be empty'),
    password: Yup.string().required('You must put a password')
  });

  return (
    <Formik 
      initialValues={initialValues} 
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    >
      <Form className='loginContainer'>
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

        <button type='submit'>Login</button>
      </Form>
    </Formik>
  );
};

export default LoginForm;
