module.exports = function(RED) {
    RED.nodes.registerType("AE",function (config) {
        RED.nodes.createNode(this,config);
        //this.cse = config.cse;
        //this.ae = config.ae;
        this.log("create ae");
    });
}