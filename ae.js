module.exports = function(RED) {
    RED.nodes.registerType("AE",function (config) {
        RED.nodes.createNode(this,config);

        this.log("create ae");
        this.cse = RED.nodes.getNode(config.cse);
        //this.cse.retrieveResource('').then(data=>this.log(JSON.stringify(data)));
        this.cse.createResource('', 'AE', {"m2m:ae":{
            'api' : config.name,
            'rr' : false,
        }}).then(data=>{this.log(JSON.stringify(data)); this.info = data});

    });
}