module.exports = function(RED) {
    var request = require('request')
    var express = require('express');
    var subscriptionApp = express();
    var bodyParser = require('body-parser');
    subscriptionApp.use(bodyParser.json());
    subscriptionApp.use(bodyParser.urlencoded({ extended: false }))
    var ngrokUrl = undefined;
    RED.settings.set('ngrokUrl', ngrokUrl);
    function getNgrokURL() {
        return new Promise((resolve, reject) => {
            var timeOutCount = 0;
            var loop = () => setTimeout(()=>{
                timeOutCount++;
                if (RED.settings.get('ngrokUrl') !== undefined) {
                    resolve(RED.settings.get('ngrokUrl'))
                } else {
                    if (timeOutCount > 20)
                        reject("ngrok url timeout");
                    else
                        loop();
                }
            }, 100);
            loop();
        })
    }

    RED.nodes.registerType("subscription",function (config) {
        RED.nodes.createNode(this,config);

        if (!config.url)
            return;

        this.hasCreate = false;

        getNgrokURL().then(url=>{
            this.log('get ngrok url : '+url)
            request({
                url : config.url,
                method : 'POST',
                headers : {
                    'X-M2M-Origin' : 'admin:admin',
                    'Accept' : 'application/json',
                    'Content-Type' : 'application/json;ty=23',    
                },
                body : {
                    "m2m:sub": {
                        "rn" : this.id,
                        "nu" : url + '/sub/' + this.id,
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
                } else {
                    this.log('create sub : ' + JSON.stringify(body))
                    this.hasCreate = true;
                }
            })
        }).catch(error => this.error(error))

        this.on('close', function(done) {
            this.log('close sub')
            if (this.hasCreate) {
                // need to delete sub
                request({
                    url : config.url + '/' + this.id,
                    method : 'DELETE',
                    headers : {
                        'X-M2M-Origin' : 'admin:admin',
                        'Accept' : 'application/json',
                        'Content-Type' : 'application/json;ty=23',    
                    },
                    body : {},
                    rejectUnauthorized: false,
                    json : true,
                },(error, response, body)=>{
                    if (error)
                        this.error(error)
                    else if (typeof body == "string") {
                        this.error(body)
                    } else {
                        this.log('delete sub : ' + JSON.stringify(body))
                        //this.hasCreate = true;
                    }
                    done();
                })
            } else 
                done();
        });
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
            RED.settings.set('ngrokUrl', ngrokUrl);
        }
        request.debug = true;
    })
}