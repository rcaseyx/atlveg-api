require('dotenv').load();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const {PORT, DATABASE_URL, CLIENT_ORIGIN} = require('./config');

app.use(express.static('public'));
app.use(express.json());
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

mongoose.Promise = global.Promise;

const { router: usersRouter } = require('./users');
const { router: authRouter } = require('./auth');
const chainsRouter = require('./routes/chains');
const contactRouter = require('./routes/contact');
const postsRouter = require('./routes/posts');
const recipesRouter = require('./routes/recipes');
const restaurantsRouter = require('./routes/restaurants');
const reviewsRouter = require('./routes/reviews');
const storesRouter = require('./routes/stores');

app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/chains', chainsRouter);
app.use('/contact', contactRouter);
app.use('/posts', postsRouter);
app.use('/recipes', recipesRouter);
app.use('/restaurants', restaurantsRouter);
app.use('/reviews', reviewsRouter);
app.use('/stores', storesRouter);
app.use(morgan('common'));

let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, { useNewUrlParser: true }, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`App is listening on port ${port}`);
                resolve();
            })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
