module.exports = function(RED) {

    RED.nodes.registerType("contentInstance", function(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.content = config.content;
        if (node.content && (node.content === "true" || node.content === "false"))
            node.content = "payload";

        node.on('input', function(msg) {
            var content;
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
            node.send([msgHTTP, msgMQTT]);
        });
    });
}