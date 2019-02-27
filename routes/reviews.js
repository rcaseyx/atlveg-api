const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const passport = require('passport');
mongoose.Promise = global.Promise;

const { Review } = require('../models');
const { localStrategy, jwtStrategy } = require('../auth');

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/', (req, res) => {
    Review.find()
      .then(reviews => {
          res.json({
              reviews: reviews.map(review => review.serialize())
          })
      })
      .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
      });
});

router.get('/:id', (req, res) => {
    Review.findById(req.params.id)
      .then(review => res.json(review.serialize()))
      .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
      });
});

router.post('/', jwtAuth, (req, res) => {
    const requiredFields = ['title', 'restaurant', 'image', 'text', 'rating'];
    for (let i=0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Review.create({
        title: req.body.title,
        restaurant: req.body.restaurant,
        image: req.body.image,
        text: req.body.text,
        rating: req.body.rating
    })
        .then(review => res.status(201).json(review.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

module.exports = router;
