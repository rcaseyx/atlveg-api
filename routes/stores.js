const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const passport = require('passport');
mongoose.Promise = global.Promise;

const { Store } = require('../models');
const { localStrategy, jwtStrategy } = require('../auth');

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/', (req, res) => {
    Store.find()
      .then(stores => {
          res.json({
              stores: stores.map(store => store.serialize())
          })
      })
      .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
      });
});

router.get('/:id', (req, res) => {
    Store.findById(req.params.id)
      .then(store => res.json(store.serialize()))
      .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
      });
});

router.post('/', jwtAuth, (req, res) => {
    const requiredFields = ['name', 'location', 'about', 'image', 'alternatives'];
    for (let i=0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Store.create({
        name: req.body.name,
        location: req.body.location,
        about: req.body.about,
        image: req.body.image,
        alternatives: req.body.alternatives
    })
        .then(store => res.status(201).json(store.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

router.put('/', jwtAuth, (req, res) => {
    if (!(req.params.id === req.body.id)) {
        const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
        console.error(message);
        return res.status(400).json({ message: message });
    }

    const toUpdate = {};
    const fields = ['about','alternatives'];

    for (let i=0; i < fields.length; i++) {
        const field = fields[i];
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    }

    Store.findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true })
      .then(store => res.status(201).json(store.serialize()))
      .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});

router.delete('/:id', jwtAuth, (req, res) => {
    Store.findByIdAndRemove(req.params.id)
      .then(store => res.status(204).end())
      .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});

module.exports = router;
