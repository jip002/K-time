const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const userRouter = require('./routes/Users');
const postRouter = require('./routes/Posts');
const commentRouter = require('./routes/Comments');

app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);

app.get('/', (req,res) => {
    res.send("Hello World");
})

app.listen(3001, () => {
    console.log('server running at port 3001...');
});
