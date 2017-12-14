module.exports = function(RED) {
    var resource = require('./resourceNode.js');
    var localinfo = {};

    var last_config = {};
    var count = 0;

    RED.nodes.registerType("AE",function (config) {
        RED.nodes.createNode(this,config);
        resource.createResourceNode(this, localinfo, config, RED);

        this.status({fill:"grey",shape:"ring",text:"wait input"});

        count++;
        if (!last_config.hasOwnProperty(config.id)) {
            //first create or restart
            // check after create
        }
        else {
            //do something
            this.log('last')
            this.log(JSON.stringify(last_config[config.id]));
            this.log('now')
            this.log(JSON.stringify(config));
            // need to delete after create
            if (last_config[config.id].name != config.name) {
                
            }
        }
        last_config[config.id] = Object.assign({},config);

        this.on('input', function(msg) {
            this.checkResource().then(data => {
                if (data) {
                    msg.url = this.rn + '/' + msg.url;
                    this.send(msg)
                }
                else {
                    this.error('check fail, not send msg')
                }
            }).catch(error => {
                this.error('check fail, not send msg : '+error);
            })
        });

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