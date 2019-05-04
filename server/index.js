require('dotenv').config();
var express = require('express');
var fs = require('fs');
var logger = require('morgan');
var config = require('./config.json');

var app = express();

// constants
module.exports.r = require('rethinkdbdash')({ db: 'discordboatsclub_v4' });
const JWT_KEY = module.exports.JWT_KEY = fs.readFileSync('jwt.key').toString();
const PORT = process.env.PORT || 3001;

var client = require('./client.js');
client.login(config.token);

app.enable('trust proxy');
app.use(require('cloudflare-express').restore()); // so we can get their real ip
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));

app.use(require('express-jwt')({ secret: JWT_KEY, credentialsRequired: false }), async (req, res, next) => {
  if (!req.user) return next();
  let user = await r.table('users').get(req.user).run(); //req.user is the user id
  req.user = user; //now req.user is the user object
  next();
});

app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/bots', require('./routes/bots.js'));
app.use('/api/users', require('./routes/users.js'));

app.listen(PORT, () => console.log('[web] listening on port ' + PORT));