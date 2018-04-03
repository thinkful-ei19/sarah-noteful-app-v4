'use strict';
const express = require('express');

const User = require('../models/user');

const router = express.Router();

//POST endpoint for User
router.post('/users', (req, res, next) => {

  const { fullname, username, password } = req.body;

  const newUser = { fullname, username, password };

  // /***** Never trust users - validate input *****/
  // if (!name) {
  //   const err = new Error('Missing `name` in request body');
  //   err.status = 400;
  //   return next(err);
  // }

  User.create(newUser)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The user name already exists');
        err.status = 400;
      }
      next(err);
    });

});
module.exports = router;
