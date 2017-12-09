module.exports = function(RED) {
    RED.nodes.registerType("container", function(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var onem2m = require('onem2m');
        var propertylist = [
            "maxNrOfInstance",
            "maxByteSize"
        ];

        propertylist.forEach((element) => {
            if (config.hasOwnProperty(element)) {
                node[element] = config[element];
            }
        });

        //node.log(JSON.stringify(config));
        //node.log(JSON.stringify(node));

        node.on('input', function(msg) {
            RED.comms.publish('hi i am container!!!');

            node.send(msg);
        });
    });
}