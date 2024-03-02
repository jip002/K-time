const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const userRouter = require('./routes/Users');
const postRouter = require('./routes/Posts');
const postLikeRouter = require('./routes/PostLikes');
const commentRouter = require('./routes/Comments');
const commentLikeRouter = require('./routes/CommentLikes');
const chatRouter = require('./routes/Chats');

app.use('/posts', postRouter);
app.use('/auth', userRouter);
app.use('/comments', commentRouter);
app.use('/postlikes', postLikeRouter);
app.use('/commentlikes', commentLikeRouter);
app.use('/chats', chatRouter);

app.get('/', (req,res) => {
    res.send("Hello");
})

app.listen(3001, () => {
    console.log('server running at port 3001...');
});
