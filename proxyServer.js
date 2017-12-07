var express = require('express');
var request = require('request');
request.debug = true;
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/proxy', function(req, res) {
    var href = /\/proxy\/(.*)/i.exec(req.originalUrl)[1];
    var option = {
        url : href,
        method : req.method,
        headers : req.headers,
        body : req.body,
        rejectUnauthorized: false,
        json : true,
    }
    if (req.body)
        option.headers['content-length'] = JSON.stringify(req.body).length;

    if (href) {
        request(option).pipe(res);
    }
    else {
        res.write('no query url')
        res.end();
    }
});
app.listen(1889);