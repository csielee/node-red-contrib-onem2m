module.exports = function(RED) {
    var last_config = {};
    var count = 0;
    RED.nodes.registerType("AE",function (config) {
        RED.nodes.createNode(this,config);

        count++;
        if (!last_config.hasOwnProperty(config.id)) {
            //first create
        }
        else {
            //do something
            this.log('last')
            this.log(JSON.stringify(last_config[config.id]));
            this.log('now')
            this.log(JSON.stringify(config));
        }
        last_config[config.id] = Object.assign({},config);

        this.log("create ae by "+ count);
        this.cse = RED.nodes.getNode(config.cse);
        //this.cse.retrieveResource('').then(data=>this.log(JSON.stringify(data)));
        this.cse.createResource('', 'AE', {"m2m:ae":{
            'api' : config.appID,
            'lbl' : config.labels,
            'rn' : config.name,
            'apn' : config.appName,
            'rr' : false,
        }}).then(data=>{this.log(JSON.stringify(data)); this.info = data});

        this.on('close', function(removed, done) {
            if (removed) {
                // node be deleted
            } else {
                // just restart
            }
            done();
        })
    });
}