'use strict';

const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { JWT_SECRET } = require('../config');

