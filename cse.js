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
}