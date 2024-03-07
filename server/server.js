const express = require('express');
const app = express();
const cors = require('cors');

const db = require('./models');

app.use(cors());
app.use(express.json());

const schoolsRouter = require('./routes/Schools');
const usersRouter = require('./routes/Users');
const postsRouter = require('./routes/Posts');
const commentsRouter = require('./routes/Comments');
const subcommentsRouter = require('./routes/Subcomments');
const postLikesRouter = require('./routes/PostLikes');
const chatboxesRouter = require('./routes/Chatboxes');

app.use('/schools', schoolsRouter);
app.use('/auth', usersRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);
app.use('/subcomments', subcommentsRouter);
app.use('/postlikes', postLikesRouter);
app.use('/chatboxes', chatboxesRouter);

db.sequelize.sync().then(() => {
    app.listen(3001, () => {
        console.log('server running at port 3001...');
    });
});