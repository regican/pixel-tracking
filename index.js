var express     = require('express'),
    url         = require('url'),
    uuid        = require('node-uuid'),
    cookieParser= require('cookie-parser');

var app         = express();


//pixel tracking config
var pixelConfig = {
    prefix  : 'pixel-'
}
pixelConfig.name = pixelConfig.prefix + 'name.gif';
pixelConfig.cookie = pixelConfig.prefix + 'cookie';
pixelConfig.callback = function(req){

    //do something with the query data -> req.query
    setTimeout(function(){
        console.log('... and reading', req.query);
    },3000);
    //....

    return;
}



app.use(cookieParser());

//tracking pixel requests
app.use(function(req, res, next){

    //parse the request url
    var request = url.parse(req.originalUrl, true);

    if (request.pathname == '/'+pixelConfig.name){
        console.log('pixel found', req.headers.host, req.cookies[pixelConfig.cookie]);

        //binary image
        var img = '47494638396101000100800000dbdfef00000021f90401000000002c00000000010001000002024401003b',
            headers = {
                'Content-Type': 'image/gif'
            };

        //persistent cookie
        if (typeof req.cookies[pixelConfig.cookie] == "undefined"){
            headers['Set-Cookie'] = pixelConfig.cookie + '=' + uuid.v1() + ';path=/;expires=Fri, 31 Dec 9999 23:59:59 GMT;'
        }

        //output binary image to client
        res.writeHead(200, headers);
        res.end(new Buffer(img, 'hex'), 'binary');

        //tracking callback function
        pixelConfig.callback(request);
    }

    next();
});


//app root
app.get('/', function(req, res){
    //data to track
    var trackingData = {
        u0: 'name',
        u1: 'email',
        u2: 'some-other-data'
    }

    //change data into url safe arguments
    trackingData = Object.keys(trackingData).map(function(key){
        return encodeURIComponent(key) + '=' + encodeURIComponent(trackingData[key]);
    }).join('&');

    res.send('<a href="/' + pixelConfig.name + '?' + trackingData + '" target="_blank">load pixel</a>');
    res.end();
});


app.listen(8888);
console.log('pixel-tracking server started');