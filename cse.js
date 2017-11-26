module.exports = function(RED) {
    RED.nodes.registerType("CSE",function (config) {
        RED.nodes.createNode(this,config);
        //this.cse = config.cse;
        //this.ae = config.ae;
        this.log("create cse");
    });
}