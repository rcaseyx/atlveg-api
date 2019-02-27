const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const passport = require('passport');
mongoose.Promise = global.Promise;

const { Post } = require('../models');
const { localStrategy, jwtStrategy } = require('../auth');

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/', (req, res) => {
    Post.find()
      .then(posts => {
          res.json({
              posts: posts.map(post => post.serialize())
          })
      })
      .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
      });
});

router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
      .then(post => res.json(post.serialize()))
      .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
      });
});

router.post('/', jwtAuth, (req, res) => {
    const requiredFields = ['title', 'text', 'author'];
    for (let i=0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Post.create({
        title: req.body.title,
        text: req.body.text,
        author: req.body.author
    })
        .then(post => res.status(201).json(post.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

router.put('/:id', jwtAuth, (req, res) => {
    if (!(req.params.id === req.body.id)) {
        const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
        console.error(message);
        return res.status(400).json({ message: message });
    }

    const toUpdate = {};
    const fields = ['title', 'image', 'text'];

    for (let i=0; i < fields.length; i++) {
        const field = fields[i];
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    }

    Post.findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true })
      .then(post => res.status(201).json(post.serialize()))
      .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});

router.delete('/:id', jwtAuth, (req, res) => {
    Post.findByIdAndRemove(req.params.id)
      .then(post => res.status(204).end())
      .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});
