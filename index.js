'use strict';

const express = require('express');
const simpleOauthModule = require('simple-oauth2');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const rp = require('request-promise');

const app = express();
app.set('views', './views')

app.engine('handlebars', exphbs())
app.set('view engine', 'handlebars')

app.use(cookieParser())
app.use(bodyParser())

const oauth2 = simpleOauthModule.create({
  client: {
    id: 'testApp',
    secret: 'hMwuYNz2YYSGhwRh_lX0k3QWFQv3Sv5VmBNxgNMZo92',
  },
  auth: {
    tokenHost: 'http://edu.updust.com',
    tokenPath: '/oauth/token',
    authorizePath: '/oauth/authorize',
  },
});

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'http://app0.geekernel.com/callback'
});

// Initial page redirecting to platform
app.get('/auth', (req, res) => {
  res.redirect(authorizationUri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', (req, res) => {
  const code = req.query.code;
  const options = {
    code,
  };

  oauth2.authorizationCode.getToken(options, (error, result) => {
    if (error) {
      console.error('Access Token Error', error.message);
      return res.json('Authentication failed');
    }

    console.log('The resulting token: ', result);
    const token = oauth2.accessToken.create(result);

    res.cookie('token', token)
    res.redirect('/')
  });
});

app.get('/success', (req, res) => {
  res.send('');
});

app.get('/', (req, res) => {
	var token = req.cookies['token'] && req.cookies['token'].token

	if (token) {
		// console.log(`http://localhost:3000/account?access_token=${token.access_token}`)
		rp({
			url: `http://edu.updust.com/account`,
			qs: {
				access_token: token.access_token
			},
			json: true
		}).then(function(r) {
			var username = r.username
			res.render('index', {username: username})
		}).catch(function () {
			res.render('index')
		})
	} else {
		res.render('index')
	}

});

app.listen(4000, () => {
  console.log('Express server started on port 4000');
});

