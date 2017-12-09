module.exports = function(RED) {
    var request = require('request');
    var onem2m = require('onem2m');
    var requestOption = {
        //url : config.host,
        url : '',
        method : 'GET',
        headers : {
            //'X-M2M-Origin' : this.credentials.username+':'+this.credentials.password,
            'X-M2M-Origin' : '',
            'Accept' : 'application/json',    
        },
        body : {},
        rejectUnauthorized: false,
        json : true,
    }
    var createResource = function(url, ty, body) {
        if (typeof ty === 'string')
            ty = onem2m.code.getResourceType(ty);

        var thisoption = Object.assign({},requestOption,{
            url : requestOption.url + url,
            method : 'POST',
        });
        thisoption.headers['Content-Type'] = 'application/json;ty='+ty;
        thisoption.body = body;
        return new Promise((resolve, reject) => {
            request(thisoption, (error, response, body)=>{
                if (!error)
                    resolve(body)
                else
                    reject(error)
            });
        });
    }
    var retrieveResource = function(url) {
        return new Promise((resolve, reject) => {
            request(Object.assign({},requestOption,{
                url : requestOption.url + url,
                method : 'GET',
            }), (error, response, body)=>{
                if (!error)
                    resolve(body)
                else
                    reject(error)
            });
        });
    };
    RED.nodes.registerType("CSE",function (config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.log("create cse");
        requestOption['X-M2M-Origin'] = node.credentials.username+':'+node.credentials.password;
        requestOption['url'] = config.host;
        node.retrieveResource = retrieveResource;
        node.createResource = createResource;

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