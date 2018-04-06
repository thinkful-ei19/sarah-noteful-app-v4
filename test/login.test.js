'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_MONGODB_URI, JWT_SECRET } = require('../config');

const User = require('../models/user');

// const seedUsers = require('../seed/users');

const expect = chai.expect;
chai.use(chaiHttp);

describe.only('Tests for Noteful login API', function() {
  let token;
  const fullname = 'Example User';
  const username = 'exampleUser';
  const password = 'examplePass';

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return User.hashPassword(password)
      .then(digest => User.create({
        username,
        password: digest,
        fullname
      }));
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('Noteful /api/login', function() {
    it('Should return a valid token', function () {
      return chai.request(app).post('/api/login').send({username, password})
        .then(res => {
          console.log(res.body);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body.authToken).to.be.a('string');
          const payload = jwt.verify(res.body.authToken, JWT_SECRET);
          console.log(payload);
          expect(payload.user).to.not.have.property('password');
          expect(payload.user).to.have.keys( 'id', 'username', 'fullname');
          expect(payload.user.username).to.deep.equal(username);
          expect(payload.user.fullname).to.deep.equal(fullname);
        });  
    });
  });
});