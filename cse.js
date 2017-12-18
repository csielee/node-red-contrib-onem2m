module.exports = function(RED) {
    var request = require('request');
    var onem2m = require('onem2m');
    var resource = require('./resourceNode.js');
    var localinfo = {};

    RED.nodes.registerType("CSE",function (config) {
        RED.nodes.createNode(this,config);
        resource.createCSENode(this, localinfo, config, RED);

        var node = this;
        node.status({});

        node.on('input', function(msg) {
            if (msg.content) {
                node.log(`url : ${msg.url}, ty : ${msg.ty} , con : ${JSON.stringify(msg.content)}`)
                node.createResource(msg.url, msg.ty, msg.content)[0].then(data => {
                    node.send(data[0]);
                }).catch(error => {
                    if (typeof error != "string") {
                        node.error(error);
                    } else {
                        node.warn(error);
                    }
                })
            } else
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
    //console.log(RED.httpNode);

    RED.httpNode.use('',require('./proxyServer'));
}