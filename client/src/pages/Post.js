import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Post = () => {
    let { id } = useParams()
    const [post, setPost] = useState({});

    useEffect(() => {
        axios.get(`http://localhost:3001/posts/${id}`)
        .then((response)=>{
          setPost(response.data);
          console.log(response.data);
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
            Comments section
        </div>
        <div className='commentFormContainer'>
            Create a comment
        </div>
      </div>
    );
  }