/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js blueid sample code
//   ready for BBluemix
//   02/05/2016 mlu@us.ibm.com 
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// START OF CHANGE
var session = require('express-session');
var passport = require('passport'); 
var cookieParser = require('cookie-parser');
var fs = require('fs');
var https = require('https');
// END OF CHANGE

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// read settings.js
var settings = require('./settings.js');

// work around intermediate CA issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

// create a new express server
var app = express();
// CHANGE ME Uncomment the following section if running locally
 https.createServer({
     key: fs.readFileSync('key.pem'),
     cert: fs.readFileSync('cert.pem')
 }, app).listen(9443);

// START OF CHANGE
app.use(cookieParser());
app.use(session({resave: 'true', saveUninitialized: 'true' , secret: 'keyboard cat'}));
app.use(passport.initialize());
app.use(passport.session()); 

passport.serializeUser(function(user, done) {
	   done(null, user);
}); 

passport.deserializeUser(function(obj, done) {
	   done(null, obj);
});         

var OpenIDConnectStrategy = require('passport-idaas-openidconnect').IDaaSOIDCStrategy;

var Strategy = new OpenIDConnectStrategy({
                 authorizationURL : settings.authorization_url,
                 tokenURL : settings.token_url,
                 clientID : settings.client_id,
                 scope: 'openid',
                 response_type: 'code',
                 clientSecret : settings.client_secret,
                 callbackURL : settings.callback_url,
                 skipUserProfile: true,
                 issuer: settings.issuer_id}, 
         function(iss, sub, profile, accessToken, refreshToken, params, done)  {
	        process.nextTick(function() {
                profile.accessToken = accessToken;
		profile.refreshToken = refreshToken;
		done(null, profile);
	      	})
}); 

passport.use(Strategy); 

app.get('/', function(req, res) {
	res.send('<h2>Welcome</h2><br /><a href="/hello">userinfo</a><br/><a href="/logout">logout</a>'+'<br /><a href="/">home</a>');
});

app.get('/login', passport.authenticate('openidconnect', {})); 

function ensureAuthenticated(req, res, next) {
	if (!req.isAuthenticated()) {
		req.session.originalUrl = req.originalUrl;

		
		res.redirect('/login');
	} else {

		return next();
	}
}

// handle callback, if authentication succeeds redirect to
// original requested url, otherwise go to /failure

app.get('/auth/sso/callback',function(req, res, next) {
	var redirect_url = req.session.originalUrl;
	console.log("redirect url:" + redirect_url );
	passport.authenticate('openidconnect', {
		successRedirect: redirect_url,
		failureRedirect: '/failure',
	})(req,res,next);
});

// failure page

app.get('/failure', function(req, res) {
	res.send('login failed'); });

app.get('/hello', ensureAuthenticated, function(req, res) {
	var claims = req.user['_json'];
	console.log(claims);
        var html ="<p>Hello " + claims.firstName + " " + claims.lastName + ": </p>";

        html += "<pre>" + JSON.stringify(req.user, null, 4) + "</pre>";
        html += "<hr> <a href=\"/\">home</a>";
	//res.send('Hello '+ claims.given_name + ' ' + claims.family_name + ', your email is ' + claims.email + '<br /> <a href=\'/\'>home</a>');

        res.send(html);
        });


app.get('/logout', function(req,res) {
       req.session.destroy();
       req.logout();
    fs.readFile("public/slo.html", function(err,data) {
        res.writeHead(200, {'Content-Type':'text/html'});
        res.write(data);
        res.end();
     });
});


// END OF CHANGE

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
// CHANGE ME Comment out following line if running locally
// var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
// CHANGE ME Comment out following line if running locally
// app.listen(appEnv.port, function() {

// print a message when the server starts listening
//  console.log("server starting on " + appEnv.url);
// CHANGE ME  
// });
