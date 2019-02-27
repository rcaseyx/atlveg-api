const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const passport = require('passport');
mongoose.Promise = global.Promise;

const { Restaurant } = require('../models');
const { localStrategy, jwtStrategy } = require('../auth');

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/', (req, res) => {
    Restaurant.find()
      .then(restaurants => {
          res.json({
              restaurants: restaurants.map(restaurant => restaurant.serialize())
          })
      })
      .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
      });
});

router.get('/:id', (req, res) => {
    Restaurant.findById(req.params.id)
      .then(restaurant => res.json(restaurant.serialize()))
      .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
      });
});

router.get('/filters', (req, res) => {
    let query = {};

    if (req.query.category) {
        query[category] = req.query.category;
    }

    Restaurant.find(query)
      .then(restaurants => {
          res.json({
              restaurants: restaurants.map(restaurant => restaurant.serialize())
          })
      })
      .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
      });
});

router.post('/', jwtAuth, (req, res) => {
    const requiredFields = ['name', 'location', 'about', 'image', 'url', 'category', 'favorite'];
    for (let i=0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Restaurant.create({
        name: req.body.name,
        location: req.body.location,
        about: req.body.about,
        image: req.body.image,
        url: req.body.url,
        category: req.body.category,
        favorite: req.body.favorite
    })
        .then(restaurant => res.status(201).json(restaurant.serialize()))
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
    const fields = ['about', 'url', 'favorite'];

    for (let i=0; i < fields.length; i++) {
        const field = fields[i];
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    }

    Restaurant.findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true })
      .then(restaurant => res.status(201).json(restaurant.serialize()))
      .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});

router.delete('/:id', jwtAuth, (req, res) => {
    Restaurant.findByIdAndRemove(req.params.id)
      .then(restaurant => res.status(204).end())
      .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});

module.exports = router;
