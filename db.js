var fs = require('fs');
var util = require('util');

var host = 'https://df93ed0c-8e53-419a-b712-622398ef1b5e-bluemix.cloudant.com';
var cookies  = {};
var nano = require('nano')({
    "url": host,
    "requestDefaults" : { "proxy" : "http://proxy.emea.ibm.com:8080","timeout" : "2000" },
    log: function(id, args) {
        console.log(id, args);
    }
});

var username = 'df93ed0c-8e53-419a-b712-622398ef1b5e-bluemix';
var userpass = '6a4665a176e23f2c700edf6f3d285047ed3f1784021f8ac3de741f755c31f9ba';

var ms = null;
nano.auth(username, userpass, function (err, body, headers) {
    if (err) {
        console.log('error : ');
        console.error(err);
    }

    if (headers && headers['set-cookie']) {
        cookies['user'] = headers['set-cookie'];
    }

    console.log("it worked");
    console.log(cookies['user']);
    ms = require('nano')({
        'url': host + '/ms',
        'cookie': cookies['user'],
        "requestDefaults" : { "proxy" : "http://proxy.emea.ibm.com:8080","timeout" : "2000" },
        log: function(id, args) {
            console.log(id, args);
        }
    });
});



//{ rev: '12-150985a725ec88be471921a54ce91452' }
exports.saveFile = function(fileName, filePath, siteId){
    fs.createReadStream(filePath).pipe(
        ms.attachment.insert(siteId, fileName, null, 'image/png')
    );
}

exports.readFile = function(fileName, filePath, siteId) {
    ms.attachment.get(siteId, fileName).pipe(fs.createWriteStream(filePath));
}

exports.saveParameters = function(parameters, siteId) {
    if(parameters._rev){
        ms.insert(parameters, parameters._rev, siteId, function(err, body) {
            if (!err)
                console.log(body);
        });
    }else{
        ms.insert(parameters, function(err, body) {
            if (!err)
                console.log(body)
        })
    }
};

exports.getParameters = function(siteId) {
    ms.get('rabbit', {siteId: siteId}, function (err, body) {
        if (!err)
            console.log(body);
    });
}



//alice.destroy('rabbit', '3-66c01cdf99e84c83a9b3fe65b88db8c0', function(err, body) {
//    if (!err)
//        console.log(body);
//});