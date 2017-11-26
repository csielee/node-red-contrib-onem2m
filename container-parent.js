module.exports = function(RED) {
    RED.nodes.registerType("container-parent",function (config) {
        RED.nodes.createNode(this,config);
        /*const { URL } = require('url');
        this.host = n.host;
        this.port = n.port;
        this.url = new URL("http://" + this.host + ":" + this.port);*/
        this.cse = config.cse;
        this.ae = config.ae;
        this.log("\ncse : "+this.cse+"\nae : "+this.ae);
    });
}