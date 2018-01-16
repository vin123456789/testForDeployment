var express = require('express');
// START OF CHANGE
var session = require('express-session');
var passport = require('passport');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var fs = require('fs');
var http = require('http');
var https = require('https');
var multer = require('multer');
const uuidV1 = require('uuid/v1');



var index = require('./routes/index');
var main = require('./routes/main');
var login = require('./routes/login');

var gen = require('./gulpfile');

var cfenv = require('cfenv');

// read settings.js
var settings = require('./settings.js');
var db = require('./db.js');

// work around intermediate CA issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

var app = express();

// CHANGE ME Uncomment the following section if running locally


//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
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
        addCACert: true,
        CACertPathList: [ '/oidc_w3id_staging.cer' ],
        issuer: settings.issuer_id},
    function(iss, sub, profile, accessToken, refreshToken, params, done)  {
        process.nextTick(function() {
            profile.accessToken = accessToken;
            profile.refreshToken = refreshToken;
            done(null, profile);
        })
    });

passport.use(Strategy);



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



app.get('/logout', function(req,res) {
    req.session.destroy();
    req.logout();
    res.redirect('/login');
});

app.get('/user', ensureAuthenticated, function(req,res) {
    var claims = req.user['_json'];
    console.log(claims);
    var data ='{"firstName":"' + decodeURI(claims.firstName) + '", "lastName":"' + decodeURI(claims.lastName) + '"}';
    res.writeHead(200, {'Content-Type':'application/json'});
    res.write(data);
    res.end();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public



app.use('/index', index);
//app.use('/main', ensureAuthenticated, main);
app.use('/main', main);
//app.use('/login', login);


//Generate site code
app.post('/save', function(req, res, next) {

    if (req.body) {
        var data = req.body;
        if(data.siteId == null){
            data.siteId = uuidV1();
        }
        console.log("Save site: "+data.siteId);
        db.saveParameters(data, data.siteId);
        //save images
        var banners = data.home.banners;
        banners.forEach(function(item,index){
            if(item.image){
                db.saveFile(item.image, './public/uploaded/'+item.image, data.siteId);
            }
        });
        req.write(data);
        req.end();
    }
});

//Generate site code
app.post('/load', function(req, res, next) {
    var key = req.query.key;
    if (key) {

        var data = req.body;
        if(data.siteId == null){
            data.siteId = uuidV1();
        }
        console.log("Save site: "+data.siteId);
        var data = db.getParameters(siteId);
        if(data.userId == ""){
            var banners = data.home.banners;
            banners.forEach(function(item,index){
                if(item.image){
                    db.readFile(item.image, './public/uploaded/'+siteId+'/'+itme.image, siteId);
                }
            });
        }
        //save images
        var banners = data.home.banners;
        banners.forEach(function(item,index){
            if(item.image){
                saveFile(item.image, 'public/uploaded/'+siteId+'/'+itme.image, siteId);
            }
        });
        req.write(data);
        req.end();
    }
});

//Generate site code
app.post('/generate', function(req, res, next) {
    var key = uuidV1()
    console.log("Generate site: "+key);
    if (req.body) {
        sendToGenerator(key, req.body);
    }
});

function sendParametersToGenerator(key, data) {

    var parametersText = JSON.stringify(data);

    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': parametersText.length
    };

    var options = {
        host: 'localhost',//远端服务器域名
        port: 3001,//远端服务器端口号
        method: 'POST',
        path: '/parameters?key='+key,//上传服务路径
        headers: headers
    };

    var req=http.request(options,function(res){
        res.setEncoding('utf-8');

        var responseString = '';

        res.on('data', function(data) {
            responseString += data;
        });

        res.on('end', function() {
            var resultObject = JSON.parse(responseString);
            console.log('-----resBody-----',resultObject);
        });

        req.on('error', function(e) {
            // TODO: handle error.
            console.log('-----error-------',e);
        });
    });
    req.write(parametersText);
    req.end();
};

//Send uploaded files and parameters to Generator service
function sendToGenerator(key, parameters) {
    var boundaryKey = '---------------------------' + new Date().getTime();
    var options = {
        host: 'localhost',
        port: 3001,
        method: 'POST',
        path: '/files?key='+key,
        headers: {
            'Content-Type': 'multipart/form-data; boundary=' + boundaryKey,
            'Connection': 'keep-alive'
        }
    };
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('body: ' + chunk);
        });
        res.on('end', function () {
            //Send parameters after all files are sent
            sendParametersToGenerator(key, parameters);
            console.log('res end.');
        });
    });

    //Send all files in upload directory
    fs.readdir('./public/uploaded', function(err, fileNames) {
        if (fileNames.length>0) {
            writeFileToRequest(fileNames, req, 0, boundaryKey);
        }
    });
};

//Write files to the stream
function writeFileToRequest(fileNames, req, index, boundaryKey){
    console.log("Write file: " +fileNames[index]);
    req.write('--' + boundaryKey + '\r\n' +
        'Content-Disposition: form-data; name="file"; filename="'+fileNames[index]+'"\r\n' +
        'Content-Type: image/jpeg\r\n\r\n'
    );
    var fileStream = fs.createReadStream('./public/uploaded/'+fileNames[index], {bufferSize: 1024 * 1024});
    fileStream.pipe(req, {end: false});
    fileStream.on('end', function () {
        if(index<(fileNames.length-1)) {
            req.write('\r\n');
            writeFileToRequest(fileNames, req, (index+1), boundaryKey);
        }else {
            req.end('\r\n--' + boundaryKey + '--');
            console.log("Write file end: " +fileNames[index]);
        }
    });

}

//Accept file that upload by user
var uploadSingle = multer({dest:'public/uploaded'});
app.post('/upload-single', uploadSingle.single('file'), function(req,res,next){
    var file=req.file;

    name=file.originalname;
    nameArray=name.split('');
    var nameMime=[];
    l=nameArray.pop();
    nameMime.unshift(l);
    while(nameArray.length!=0&&l!='.'){
        l=nameArray.pop();
        nameMime.unshift(l);
    }
    Mime=nameMime.join('');
    console.log(Mime);
    var newName = uuidV1();

    res.send(newName+Mime);

    fs.renameSync('./public/uploaded/'+file.filename,'./public/uploaded/'+newName+Mime);
})

var uploadMultiple = multer({dest:'public/uploaded'});
app.post('/upload-multiple', uploadMultiple.array('file',30), function(req,res,next){
    var files = req.files
    var names = "";
    files.forEach(function(file,index) {
        name = file.originalname;
        nameArray = name.split('');
        var nameMime = [];
        l = nameArray.pop();
        nameMime.unshift(l);
        while (nameArray.length != 0 && l != '.') {
            l = nameArray.pop();
            nameMime.unshift(l);
        }
        Mime = nameMime.join('');
        console.log(Mime);
        var newName = uuidV1();
        names = names + '\n' + newName + Mime
        fs.renameSync('./public/uploaded/' + file.filename, './public/uploaded/' + newName + Mime);
    })
    res.send(names);
})




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
