const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const passport = require('passport');
mongoose.Promise = global.Promise;

const { Recipe } = require('../models');
const { localStrategy, jwtStrategy } = require('./auth');

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/', (req, res) => {
    Recipe.find()
      .then(recipes => {
          res.json({
              recipes: recipes.map(recipe => recipe.serialize());
          })
      })
      .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
      });
});

router.get('/:id', (req, res) => {
    Recipe.findById(req.params.id)
      .then(recipe => res.json(recipe.serialize()))
      .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
      });
});

router.post('/', jwtAuth, (req, res) => {
    const requiredFields = ['title', 'image', 'about', 'ingredients', 'instructions'];
    for (let i=0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Recipe.create({
        title: req.body.title,
        about: req.body.about,
        image: req.body.image,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions
    })
        .then(movie => res.status(201).json(restaurant.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

router.delete('/:id', jwtAuth, (req, res) => {
    Recipe.findByIdAndRemove(req.params.id)
      .then(chain => res.status(204).end())
      .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});

module.exports = router;
