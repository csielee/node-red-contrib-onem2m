module.exports = function(RED) {
    var last_config = {};
    //var hasCreate = {};
    var count = 0;
    var AEattr = ['rn','api','apn','lbl'];
    var getAllNextNode = function(wires) {
        var newList = [];
        if (Object.prototype.toString.call(wires) == "[object Array]") {
            wires.forEach(item=>{
                var nextNode = RED.nodes.getNode(item);
                if (nextNode && nextNode.type == "CSE")
                    newList.push(nextNode);
            })
        }
        return newList;
    }
    var createResource = function(url, ty, body) {
        if (this.nextNodeList == null)
            this.nextNodeList = getAllNextNode(this.wires[0]);
        
        if (typeof url != "string")
            url = '';
        else
            url = this.rn + '/' + url;
        
        var newList = [];
        this.nextNodeList.forEach(item=>{
            newList = newList.concat(item.createResource(url, ty, body));
        })
        return newList;
    }
    var retrieveResource = function(url) {
        if (this.nextNodeList == null)
            this.nextNodeList = getAllNextNode(this.wires[0]);

        if (typeof url != "string")
            url = '';
        else
            url = this.rn + '/' + url;
        
        var newList = [];
        this.nextNodeList.forEach(item=>{
            newList = newList.concat(item.retrieveResource(url));
        })
        return newList;
    }
    var updateResource = function(url, ty, body) {
        if (this.nextNodeList == null)
            this.nextNodeList = getAllNextNode(this.wires[0]);

        if (typeof url != "string")
            url = '';
        else
            url = this.rn + '/' + url;
        
        var newList = [];
        this.nextNodeList.forEach(item=>{
            newList = newList.concat(item.updateResource(url, ty, body));
        })
        return newList;
    }
    var deleteResource = function(url) {
        if (this.nextNodeList == null)
            this.nextNodeList = getAllNextNode(this.wires[0]);

        if (typeof url != "string")
            url = '';
        else
            url = this.rn + '/' + url;
        
        var newList = [];
        this.nextNodeList.forEach(item=>{
            newList = newList.concat(item.deleteResource(url));
        })
        return newList;
    }
    RED.nodes.registerType("AE",function (config) {
        RED.nodes.createNode(this,config);
        this.rn = config.rn;
        this.hasCreate = false;
        this.nextNodeList = null;
        this.status({fill:"grey",shape:"ring",text:"wait input"});
        this.createResource = createResource;
        this.retrieveResource = retrieveResource;
        this.updateResource = updateResource;
        this.deleteResource = deleteResource;
        
        /*if (config.id != "87480ad2.7002e8") {
            var otherae = RED.nodes.getNode("87480ad2.7002e8");
            this.log(JSON.stringify(otherae));
        }*/

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
        // record create

        // update resource

        this.log("create ae by "+ count);
        /*this.cse = RED.nodes.getNode(config.cse);
        //this.log(JSON.stringify(this.cse));
        //this.cse.retrieveResource('').then(data=>this.log(JSON.stringify(data)));
        //if (this.cse)
        this.cse.createResource('', 'AE', {"m2m:ae":{
            'api' : config.appID,
            'lbl' : config.labels,
            'rn' : config.name,
            'apn' : config.appName,
            'rr' : false,
        }}).then(data=>{this.log(JSON.stringify(data)); this.info = data});*/
        this.handleError = error => {
            this.error(error);
        }

        this.on('input', function(msg) {
            if (!this.hasCreate) {
                var allRetrievePromise = this.retrieveResource('');
                allRetrievePromise.forEach(RP => {
                    RP.then((data)=>{
                        var aeinfo = data[0];
                        aeinfo = aeinfo["m2m:ae"];
                        this.log('ae has created')
                        // check is need to update
                        var info = {};
                        AEattr.forEach(item=>{
                            if (config[item] != aeinfo[item])
                                info[item] = config[item];
                        });
                        if (Object.keys(info).length > 0) {
                            info = {"m2m:ae" : info}
                            // need to update
                            this.log('need to update')
                            data[1].updateResource(data[2], "AE", info).then((data)=>{
                                var aeinfo = data[0];
                                this.hasCreate = true;
                                this.status({fill:"green",shape:"dot",text:"update success"})
                            },(data)=>{
                                var err = data[0];
                                this.log('update fail : '+err);
                                if (typeof err != "string") {
                                    throw err;
                                }
                                this.status({fill:"red",shape:"dot",text:"update fail"})
                            }).catch(this.handleError);
                        }
                        this.hasCreate = true;
                        this.status({fill:"green",shape:"dot",text:"has created"});

                        // send msg
                        this.send(msg);
                    },(data)=>{
                        var err = data[0];
                        // need to create
                        //console.log(err);
                        if (typeof err != "string") {
                            throw err;
                        }
                        this.log('need to create : '+err)
                        this.status({fill:"red",shape:"dot",text:"need to create"});
                        // set ae info
                        var info = {};
                        AEattr.forEach(item => {
                            if (config[item])
                                info[item] = config[item];
                        });
                        info['rr'] = false;
                        info = {"m2m:ae" : info}
                        data[2] = data[2].substring(0, data[2].lastIndexOf(this.rn));
                        data[1].createResource(data[2], 'AE',info).then((data)=>{
                            var aeinfo = data[0];
                            this.hasCreate = true;
                            this.status({fill:"green",shape:"dot",text:"create success"});
                            this.log(JSON.stringify(aeinfo));
                            this.send(msg)
                        },(data)=>{
                            var err = data[0];
                            this.hasCreate = false;
                            if (typeof err != "string") {
                                throw err;
                            }
                            this.status({fill:"red",shape:"dot",text:"create fail"});
                        }).catch(this.handleError);
                    }).catch(this.handleError);
                })
            } else {
                // ae has create!
                this.send(msg);
            }
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