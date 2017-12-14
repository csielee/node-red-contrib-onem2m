module.exports = function(RED) {
    var nc = require('./notifycenter.js');
    var resource = require('./resourceNode.js');
    RED.nodes.registerType("contentInstance", function(config) {
        RED.nodes.createNode(this, config);
        resource.createInstanceNode(this, config);
        var node = this;

        /*
        if (config.wires) {
            node.log(config.wires);
            var nextid = config.wires[0][0];
            var nextNode = RED.nodes.getNode(nextid);
            if (nextNode)
                node.log(JSON.stringify(nextNode));
            else
                nc.once('create', function createCin(id) {
                    node.log(`get create event by <${id}>`);
                    if (id == nextid) {
                        var nextNode = RED.nodes.getNode(nextid);
                        node.log(JSON.stringify(nextNode));
                    } else
                        nc.once('create', createCin);
                })
        }


        node.content = config.content;
        if (node.content && (node.content === "true" || node.content === "false"))
            node.content = "payload";*/


        node.on('input', function(msg) {
            /*var content;
            try {
                content = msg[node.content];
            } catch (error) {
                content = undefined;
            }
            
            var msgHTTP = {
                payload : "for HTTP",
                content : content
            },msgMQTT = {
                payload : "for MQTT",
                content : content
            };
            node.send([msgHTTP, msgMQTT]);*/
            var newmsg = {
                "origin" : msg,
                "url" : "",
                "ty" : node.type,
                "content" : node.getInstance(msg),
            };
            node.send(newmsg);
        });
    });
}