module.exports = function(RED) {
    RED.nodes.registerType("subscription",function (config) {
        RED.nodes.createNode(this,config);
    });
}