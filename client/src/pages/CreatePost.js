import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreatePostForm from '../components/CreatePostForm';
import '../styles/CreatePost.css';

export const CreatePost = () => {
    const navigate = useNavigate();

    const onSubmit = (data) => {
        axios.post('http://localhost:3001/posts', data, {headers: {
            accessToken: sessionStorage.getItem('accessToken')
          }}).then((res) => {
            console.log(res.data);
            navigate('/forum');
        })
    }

    return (
      <div className="CreatePostPage">
        <h1>Create Post Page</h1>
        <CreatePostForm onSubmit={onSubmit} />
      </div>
    );
  }

