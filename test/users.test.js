'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_MONGODB_URI } = require('../config'); //('../config');

const User = require('../models/user');

const expect = chai.expect;

chai.use(chaiHttp);

describe.only('Noteful API - Users', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const fullname = 'Example User';

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    // noop
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('/api/users', function () {
    describe.only('POST', function () {
      it('Should create a new user', function () {
        const testUser = { username, password, fullname };

        let res;
        return chai.request(app).post('/api/users').send(testUser)
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'username', 'fullname');

            expect(res.body.id).to.exist;
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.fullname).to.equal(testUser.fullname);

            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user._id.toString()).to.equal(res.body.id);
            expect(user.fullname).to.equal(testUser.fullname);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });
      it('Should reject users with missing username', function () {
        const testUser = { password, fullname };
        //let res;

        return chai.request(app).post('/api/users').send(testUser)
          .catch(err => err.response)
          .then(res => {
            console.log(res.body.location);
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body.message).to.eq('Missing \'username\' in request body');
            expect(res.body).to.have.keys('message', 'error');
            expect(res.body.error).be.empty;
          });
      });

      /**
       * COMPLETE ALL THE FOLLOWING TESTS
       */
      it('Should reject users with missing password', 
        function () {
          const testUser = { username, fullname };
          //let res;

          return chai.request(app).post('/api/users').send(testUser)
            .catch(err => err.response)
            .then(res => {
              console.log(res.body.location);
              expect(res).to.have.status(422);
              expect(res).to.be.json;
              expect(res.body).to.be.an('object');
              expect(res.body.message).to.eq('Missing \'password\' in request body');
              expect(res.body).to.have.keys('message', 'error');
              expect(res.body.error).be.empty;
            });
        });

      it('Should reject users with non-string username', function () {
        const testUser = { username: 1234, password, fullname };
        return chai.request(app).post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            console.log(res.body);
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body.message).to.eq('Field: \'username\' must be type String');
            expect(res.body).to.have.keys('message', 'error');
            expect(res.body.error).be.empty;

          });
      });

      it('Should reject users with non-string password', function () {
        const testUser = { username, password: 123, fullname };
        return chai.request(app).post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            console.log(res.body);
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body.message).to.eq('Field: \'password\' must be type String');
            expect(res.body).to.have.keys('message', 'error');
            expect(res.body.error).be.empty;

          });
      }
      );
      it('Should reject users with non-trimmed username', function () {
        const testUser = { username: ' username ', password, fullname };
        return chai.request(app).post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            console.log(res.body);
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body.message).to.eq('Field: \'username\' cannot start or end with whitespace');
            expect(res.body).to.have.keys('message', 'error');
            expect(res.body.error).be.empty;

          });
      });
      it('Should reject users with non-trimmed password', function () {
        const testUser = { username, password: ' password ', fullname };
        return chai.request(app).post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            console.log(res.body);
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body.message).to.eq('Field: \'password\' cannot start or end with whitespace');
            expect(res.body).to.have.keys('message', 'error');
            expect(res.body.error).be.empty;
          });
      });
      it('Should reject users with empty username', function () {
        const testUser = { username: '', password, fullname };
        return chai.request(app).post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            console.log(res.body);
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body.message).to.eq('Field: \'username\' must be at least 1 characters long');
            expect(res.body).to.have.keys('message', 'error');
            expect(res.body.error).be.empty;
          });
      });
      it('Should reject users with password less than 8 characters', function () {
        const testUser = { username, password: '', fullname };
        return chai.request(app).post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            console.log(res.body);
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body.message).to.eq('Field: \'password\' must be at least 8 characters long');
            expect(res.body).to.have.keys('message', 'error');
            expect(res.body.error).be.empty;
          });
      });
      it('Should reject users with password greater than 72 characters', function () {
        const testUser = { username, password: 'Loremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididunlaboreetdoloremagnaaliqua', fullname };
        console.log(testUser);
        return chai.request(app).post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            console.log(res.body);
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body.message).to.eq('Field: \'password\' must be at most 72 characters long');
            expect(res.body).to.have.keys('message', 'error');
            expect(res.body.error).be.empty;
          });
      });
      it.only('Should reject users with duplicate username', function () {
        const testUser = { username, password, fullname };
        return User.create({username, password, fullname})
          .then(() => 
            chai.request(app).post('/api/users')
              .send(testUser)
          )
          .catch(err => err.response)
          .then(res => {
            console.log(res.body);
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body.message).to.eq('The username already exists');
            expect(res.body).to.have.keys('message', 'error');
            expect(res.body.error).be.empty;
          });
      });
      it('Should trim fullname');
    });

    describe('GET', function () {
      it('Should return an empty array initially', function () {
        return chai.request(app).get('/api/users')
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.length(0);
          });
      });
      it('Should return an array of users', function () {
        const testUser0 = {
          username: `${username}`,
          password: `${password}`,
          fullname: ` ${fullname} `
        };
        const testUser1 = {
          username: `${username}1`,
          password: `${password}1`,
          fullname: `${fullname}1`
        };
        const testUser2 = {
          username: `${username}2`,
          password: `${password}2`,
          fullname: `${fullname}2`
        };

        /**
         * CREATE THE REQUEST AND MAKE ASSERTIONS
         */
      });
    });
  });
});