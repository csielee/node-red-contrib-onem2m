module.exports = function(RED) {
    var request = require('request');
    var onem2m = require('onem2m');
    var createResource = function(url, ty, body) {
        if (typeof ty === 'string')
            ty = onem2m.code.getResourceType(ty);

        var thisoption = Object.assign({},this.requestOption,{
            url : this.requestOption.url + url,
            method : 'POST',
        });
        thisoption.headers['Content-Type'] = 'application/json;ty='+ty;
        thisoption.body = body;
        return new Promise((resolve, reject) => {
            request(thisoption, (error, response, body)=>{
                if (!error) {
                    this.log(`<create>url : ${thisoption.url} ,body : ${JSON.stringify(body)}`);
                    this.status({fill:"green",shape:"dot",text:"connect"});
                    if (typeof body == "string")
                        reject([body, this, url]);
                    else
                        resolve([body, this, url])
                }
                else {
                    this.status({fill:"red",shape:"dot",text:"disconnect"});
                    reject([error, this, url])
                }
            });
        });
    }
    var retrieveResource = function(url) {
        var thisoption = Object.assign({},this.requestOption,{
            url : this.requestOption.url + url,
            method : 'GET',
        });
        return new Promise((resolve, reject) => {
            request(thisoption, (error, response, body)=>{
                if (!error) {
                    this.log(`<retrieve>url : ${thisoption.url} ,body : ${JSON.stringify(body)}`);
                    this.status({fill:"green",shape:"dot",text:"connect"});
                    if (typeof body == "string")
                        reject([body, this, url]);
                    else
                        resolve([body, this, url])
                }
                else {
                    this.status({fill:"red",shape:"dot",text:"disconnect"});
                    reject([error, this, url])
                }
            });
        });
    };
    var updateResource = function(url, ty, body) {
        if (typeof ty === 'string')
            ty = onem2m.code.getResourceType(ty);

        var thisoption = Object.assign({},this.requestOption,{
            url : this.requestOption.url + url,
            method : 'PUT',
        });
        thisoption.headers['Content-Type'] = 'application/json;ty='+ty;
        thisoption.body = body;
        return new Promise((resolve, reject) => {
            request(thisoption, (error, response, body)=>{
                if (!error) {
                    this.log(`<update>url : ${thisoption.url} ,body : ${JSON.stringify(body)}`);
                    this.status({fill:"green",shape:"dot",text:"connect"});
                    if (typeof body == "string")
                        reject([body, this, url]);
                    else
                        resolve([body, this, url])
                }
                else {
                    this.status({fill:"red",shape:"dot",text:"disconnect"});
                    reject([error, this, url])
                }
            });
        });
    };
    var deleteResource = function(url) {
        var thisoption = Object.assign({},this.requestOption,{
            url : this.requestOption.url + url,
            method : 'DELETE',
        });
        return new Promise((resolve, reject) => {
            request(thisoption, (error, response, body)=>{
                if (!error) {
                    this.log(`<delete>url : ${thisoption.url} ,body : ${JSON.stringify(body)}`);
                    this.status({fill:"green",shape:"dot",text:"connect"});
                    if (typeof body == "string")
                        reject([body, this, url]);
                    else
                        resolve([body, this, url])
                }
                else {
                    this.status({fill:"red",shape:"dot",text:"disconnect"});
                    reject([error, this, url])
                }
            });
        });
    };
    RED.nodes.registerType("CSE",function (config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.status({});
        node.requestOption = {
            //url : config.host + '/' + config.name + '/',
            url : '',
            method : 'GET',
            headers : {
                'X-M2M-Origin' : node.credentials.username+':'+node.credentials.password,
                //'X-M2M-Origin' : '',
                'Accept' : 'application/json',    
            },
            body : {},
            rejectUnauthorized: false,
            json : true,
        };
        if (config.host[config.host.length-1] != '/')
            config.host += '/';
        
        node.requestOption['url'] = config.host + config.name + '/';

        node.log("create cse");
        //requestOption['X-M2M-Origin'] = node.credentials.username+':'+node.credentials.password;
        //requestOption['url'] = config.host;
        node.createResource = createResource;
        node.retrieveResource = retrieveResource;
        node.updateResource = updateResource;
        node.deleteResource = deleteResource;

        node.on('input', function(msg) {
            node.send(msg);
        });

        node.on('close', function(done) {
            node.log('close cse');
            done();
        });
        
    },{
        credentials: {
            username: {type:"text"},
            password: {type:"password"}
        }
    });

    console.log('require ces.js in runtime!!!');
    //console.log(RED.httpNode);
}