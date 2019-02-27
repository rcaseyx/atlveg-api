const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const passport = require('passport');
mongoose.Promise = global.Promise;

const { Chain } = require('../models');
const { localStrategy, jwtStrategy } = require('./auth');

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/', (req, res) => {
    Chain.find()
      .then(chains => {
          res.json({
              chains: chains.map(chain => chain.serialize())
          })
      })
      .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
      });
});

router.get('/:id', (req, res) => {
    Chain.findById(req.params.id)
      .then(chain => chain.serialize())
      .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
      });
});

router.post('/', jwtAuth, (req,res) => {
    const requiredFields = ['name', 'location', 'about', 'image', 'url', 'alternatives'];
    for (let i=0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Chain.create({
        name: req.body.name,
        location: req.body.location,
        about: req.body.about,
        image: req.body.image,
        url: req.body.url,
        alternatives: req.body.alternatives
    })
        .then(chain => res.status(201).json(chain.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

router.delete('/:id', jwtAuth, (req, res) => {
    Chain.findByIdAndRemove(req.params.id)
      .then(chain => res.status(204).end())
      .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});

module.exports = router;
