const express = require('express');
const app = express();
const cors = require('cors');

const db = require('./models');

app.use(cors());
app.use(express.json());

const schoolsRouter = require('./routes/Schools');
const userRouter = require('./routes/Users');
const postRouter = require('./routes/Posts');
const commentRouter = require('./routes/Comments');
const subcommentRouter = require('./routes/Subcomments');

app.use('/schools', schoolsRouter);
app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);
app.use('/subcomments', subcommentRouter);

app.get('/', (req,res) => {
    res.send("Hello World");
})

db.sequelize.sync().then(() => {
    app.listen(3001, () => {
        console.log('server running at port 3001...');
    });
});