module.exports = function(RED) {
    var request = require('request')
    var express = require('express');
    var subscriptionApp = express();
    var bodyParser = require('body-parser');
    subscriptionApp.use(bodyParser.json());
    subscriptionApp.use(bodyParser.urlencoded({ extended: false }))
    var ngrokUrl = undefined;

    RED.nodes.registerType("subscription",function (config) {
        RED.nodes.createNode(this,config);

        if (!config.url)
            return;

        request({
            url : config.url,
            method : 'POST',
            headers : {
                'X-M2M-Origin' : 'admin:admin',
                'Content-Type' : 'application/json;ty=23',    
            },
            body : {
                "m2m:sub": {
                    "rn" : this.id,
                    "nu" : ngrokUrl + '/sub/' + this.id,
                    "nct" : 2,
                }
            },
            rejectUnauthorized: false,
            json : true,
        },(error, response, body)=>{
            if (error)
                this.error(error)
            else if (typeof body == "string") {
                this.error(body)
            } else 
                this.log(JSON.stringify(body))
        })
    });
    subscriptionApp.use('/:id',(req, res)=>{
        var subNode = RED.nodes.getNode(req.params.id);
        if (subNode && subNode.type == "subscription") {
            subNode.send(req.body);
            res.write(`success send\nid = ${req.params.id}\n`)
            res.write(JSON.stringify(req.body))
        } else {
            res.write('fail send, error id');
        }

        res.end();
    })
    RED.httpNode.use('/sub',subscriptionApp);

    var ngrok = require('ngrok');
    
    request.debug = false;
    ngrok.connect(RED.settings.get('uiPort'),(err, url) => {
        if (err)
            RED.log.error('[ngrok]'+err);
        else {
            RED.log.info(`[ngrok] http:127.0.0.1:${RED.settings.get('uiPort')} -> ${url}`)
            ngrokUrl = url.replace("https","http");
        }
        request.debug = true;
    })
}