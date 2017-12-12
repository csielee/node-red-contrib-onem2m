module.exports = function(RED) {
    var onem2m = require('onem2m');
    var nc = require('./notifycenter.js');
    RED.nodes.registerType("container", function(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var propertylist = [
            "maxNrOfInstance",
            "maxByteSize"
        ];

        propertylist.forEach((element) => {
            if (config.hasOwnProperty(element)) {
                node[element] = config[element];
            }
        });

        node.log(`create container <${config.id}>`);


        //var nextNode = RED.nodes.getNode(config.wires[0][0])
        //node.log(JSON.stringify(nextNode));

        //node.log(JSON.stringify(config));
        //node.log(JSON.stringify(node));

        node.on('input', function(msg) {
            RED.comms.publish('hi i am container!!!');

            node.send(msg);
        });

        setTimeout(function() {nc.emit('create', config.id)},100);
    });
}