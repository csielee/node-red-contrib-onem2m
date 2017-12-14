module.exports = function(RED) {
    var onem2m = require('onem2m');
    var nc = require('./notifycenter.js');
    var resource = require('./resourceNode.js');
    var localinfo = {};

    RED.nodes.registerType("container", function(config) {
        RED.nodes.createNode(this, config);
        resource.createResourceNode(this, localinfo, config, RED);

        var node = this;
        node.status({fill:"grey",shape:"ring",text:"wait input"});

        node.on('input', function(msg) {
            this.checkResource().then(data => {
                if (data)
                    this.send(msg)
                else {
                    this.error('check fail, not send msg')
                }
            }).catch(error => {
                this.error('check fail, not send msg : '+error);
            })
        });

        //setTimeout(function() {nc.emit('create', config.id)},100);
    });
}