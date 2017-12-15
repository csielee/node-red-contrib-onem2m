const request = require('request');
const onem2m = require('onem2m');
request.debug = true;

const resourceParent = {
    "AE" : ["CSE"],
    "container" : ["CSE", "AE"],
}

const resourceAttr = {
    "AE" : ['rn','api','apn','lbl','rr'],
    "container" : ['rn'],
    "contentInstance" : ['lbl']
}

module.exports = {
    createInstanceNode : (node, config) => {
        if (!node.id) {
            console.log('createInstance need to use a node-red node')
            return;
        }
        if (node.type != "contentInstance") {
            node.warn(`${node.type} can not create Instance`)
            return;    
        }
        node.tyShortName = onem2m.name.exchange(node.type, 'ResourceTypes');

        node.getInstance = (msg) => {
            var instance = {};
            instance["m2m:"+node.tyShortName] = {
                'lbl' : config.lbl,
                'cnf' : 'application/json',
            }
            if (config.content == "true")
                instance["m2m:"+node.tyShortName]["con"] = JSON.stringify(msg);
            else {
                if (!msg[config.content]) {
                    node.warn(`msg no ${config.content} property`)
                    msg[config.content] = `create by ${node.id} node`;
                }
                
                instance["m2m:"+node.tyShortName]["con"] = JSON.stringify(msg[config.content]);  
            }
            return instance;          
        }

        node.log(`create ${node.type} <${node.id}>`);
    },
    createResourceNode : (node, localinfo, config, RED) => {
        if (!node.id) {
            console.log('createResourceNode need to use a node-red node')
            return;
        }
        if (node.type == "CSE") {
            node.warn(`${node.type} can not create resource node`)
            return;    
        }
        if (typeof localinfo != "object") {
            node.warn(`${localinfo} can not use to store local info`);
            return;
        }

        node.rn = config.rn;
        if (!node.rn)
            node.rn = node.id;

        if (!localinfo[node.id])
            localinfo[node.id] = {};
        
        node.prevNodeList = localinfo[node.id].prevNodeList;
        node.needCheckNodeList = [];
        if (!node.prevNodeList)
            node.prevNodeList = localinfo[node.id].prevNodeList = [];
        if (node.prevNodeList.length > 0) {
            this.prevNodeList.forEach(id=>{
                var prevNode = RED.nodes.getNode(id);
                if (prevNode && prevNode.needCheckNodeList && prevNode.needCheckNodeList.indexOf(id) == -1)
                        prevNode.needCheckNodeList.push(id);

            })
        }
        //node.nextNodeList = node.wires[0];
        node.nextNodeList = [];

        node.handleError = error => {
            //this.needCreateNodeList.push(id);
            node.error(error);
        }

        node.hasGetAllNextNode = false;
        node.getAllNextNode = () => {
            var nextNodeList = [];

            node.wires[0].forEach(id => {
                var nextNode = RED.nodes.getNode(id);
                if (nextNode && resourceParent[node.type].indexOf(nextNode.type) != -1) {
                    nextNodeList.push(nextNode);
                    if (!node.hasGetAllNextNode) { 
                        if (nextNode.prevNodeList && nextNode.prevNodeList.indexOf(node.id) == -1)
                            nextNode.prevNodeList.push(node.id);
                        node.nextNodeList.push(nextNode.id);
                    }
                }
            });
            node.hasGetAllNextNode = true;
            return nextNodeList;
        }

        node.createResource = function(url, ty, body) {
            
            if (typeof url != "string")
                url = '';
            else
                url = this.rn + '/' + url;
            
            var newList = [];
            node.getAllNextNode(this.wires[0]).forEach(item=>{
                newList = newList.concat(item.createResource(url, ty, body));
            })
            return newList;
        }
        node.retrieveResource = function(url) {
    
            if (typeof url != "string")
                url = '';
            else
                url = this.rn + '/' + url;
            
            var newList = [];
            node.getAllNextNode(this.wires[0]).forEach(item=>{
                newList = newList.concat(item.retrieveResource(url));
            })
            return newList;
        }
        node.updateResource = function(url, ty, body) {
    
            if (typeof url != "string")
                url = '';
            else
                url = this.rn + '/' + url;
            
            var newList = [];
            node.getAllNextNode(this.wires[0]).forEach(item=>{
                newList = newList.concat(item.updateResource(url, ty, body));
            })
            return newList;
        }
        node.deleteResource = function(url) {
    
            if (typeof url != "string")
                url = '';
            else
                url = this.rn + '/' + url;
            
            var newList = [];
            node.getAllNextNode(this.wires[0]).forEach(item=>{
                newList = newList.concat(item.deleteResource(url));
            })
            return newList;
        };

        node.hasChecked = false;
        node.tyShortName = onem2m.name.exchange(node.type, 'ResourceTypes');
        node.checkResource = async function() {
            var nodeList = [];
            var checked = true;
            // detect new wire
            if (!localinfo[node.id].wires)
                localinfo[node.id].wires = node.wires.slice();
            else {
                node.wires[0].forEach(id=>{
                    // has new wires
                    if (localinfo[node.id].wires[0].indexOf(id) == -1) {
                        node.needCheckNodeList.push(id);
                        var nextNode = RED.nodes.getNode(id);
                        if (nextNode.prevNodeList && nextNode.prevNodeList.indexOf(node.id) == -1)
                            nextNode.prevNodeList.push(node.id);
                    } else {

                    }
                })    
            }


            if(!node.hasChecked) {
                node.hasChecked = true;
                nodeList = node.getAllNextNode();
            } else if (node.needCheckNodeList.length > 0) {
                node.needCheckNodeList.forEach(id=>{
                    var nextNode = RED.nodes.getNode(id);
                    if (nextNode)
                        nodeList.push(nextNode);
                })
            }
            node.needCheckNodeList = [];


            if (nodeList.length > 0) {
                // check all next node
                for (var index in nodeList) {
                    try {
                        checked = await nodeList[index].checkResource();    
                    } catch (error) {
                        //throw error;
                        checked = false;
                    }
                    if (!checked)
                        break;
                }

                if (!checked)
                    return false;

                for (var index in nodeList) {
                    var nextNode = nodeList[index];
                    var arr = nextNode.retrieveResource(this.rn) 
                    for (var index in arr) {
                        try {
                            var data = await arr[index];
                            // retrive success
                            node.status({fill:"green",shape:"dot",text:"has created"});
                            var aeinfo = data[0];
                            aeinfo = aeinfo[("m2m:"+node.tyShortName)];
                            node.log(node.tyShortName+' has created')
                            // check is need to update
                            var info = {};
                            resourceAttr[node.type].forEach(item=>{
                                if (config[item] != aeinfo[item])
                                    info[item] = config[item];
                            });
                            if (Object.keys(info).length > 0) {
                                var tmp = {};
                                tmp[("m2m:"+node.tyShortName)] = info;
                                info = tmp;
                                // need to update
                                this.log('need to update')
                                try {
                                    var result = await data[1].updateResource(data[2], node.type, info)[0];
                                    // update success
                                    node.status({fill:"green",shape:"dot",text:"update success"})
                                } catch (error) {
                                    // update fail
                                    if (typeof error[0] != "string")
                                        node.error(error[0])
                                    else {
                                        node.warn(error[0])
                                        node.needCheckNodeList.push(nextNode.id);
                                        node.status({fill:"red",shape:"dot",text:"update fail"})
                                        checked = false;
                                    }
                                }
                            }
                            
                        } catch (error) {
                            // retrive fail
                            if (typeof error[0] != "string") {
                                node.error(error[0])
                                checked = false;
                            }
                            else {
                                node.warn(error[0]);
                                var data = error;
                                // need to create
                                node.status({fill:"red",shape:"dot",text:"need to create"});
                            
                                // set ae info
                                var info = {};
                                resourceAttr[node.type].forEach(item => {
                                    if (config[item] != undefined || config[item] != null)
                                        info[item] = config[item];
                                });
                                var tmp = {};
                                tmp[("m2m:"+node.tyShortName)] = info;
                                info = tmp;
                                data[2] = data[2].substring(0, data[2].lastIndexOf(node.rn));
                                try {
                                    var result = await data[1].createResource(data[2], node.type, info)[0];
                                    node.status({fill:"green",shape:"dot",text:"create success"});
                                    node.log(JSON.stringify(result[0]));
                                } catch (error) {
                                    checked = false;
                                    if (typeof error[0] != "string")
                                        node.error(error[0])
                                    else {
                                        node.warn(error[0])
                                        node.needCheckNodeList.push(nextNode.id);
                                        this.status({fill:"red",shape:"dot",text:"create fail"});
                                    }
                                }
    
                            }
                            
                        }

                    } // retrieve finish

                }
            }

            return checked;
        }

        node.log(`create ${node.type} <${node.id}>`);
    },
    createCSENode : (node, localinfo, config, RED) => {
        if (!node.id) {
            console.log('createCSENode need to use a node-red node')
            return;
        }
        if (node.type != "CSE") {
            node.warn(`${node.type} can not create cse node`)
            return;    
        }
        if (typeof localinfo != "object") {
            node.warn(`${localinfo} can not use to store local info`);
            return;
        }
        node.requestOption = {
            url : '',
            method : 'GET',
            headers : {
                'X-M2M-Origin' : node.credentials.username+':'+node.credentials.password,
                'Accept' : 'application/json',    
            },
            body : {},
            rejectUnauthorized: false,
            json : true,
        };
        if (config.host[config.host.length-1] != '/')
            config.host += '/';
        
        node.requestOption['url'] = config.host + config.name + '/';

        if (!localinfo[node.id])
            localinfo[node.id] = {};

        node.prevNodeList = localinfo[node.id].prevNodeList;
        if (!node.prevNodeList)
            node.prevNodeList = [];
        
        node.createResource = function(url, ty, body) {
            if (typeof ty === 'string')
                ty = onem2m.code.getResourceType(ty);
    
            var thisoption = Object.assign({},this.requestOption,{
                url : this.requestOption.url + url,
                method : 'POST',
            });
            thisoption.headers['Content-Type'] = 'application/json;ty='+ty;
            thisoption.body = body;
            return [new Promise((resolve, reject) => {
                request(thisoption, (error, response, body)=>{
                    if (!error) {
                        this.log(`<create>url : ${thisoption.url} ,body : ${JSON.stringify(body)}`);
                        this.status({fill:"green",shape:"dot",text:"connect"});
                        if (typeof body == "string")
                            reject([body, this, url]);
                        else
                            resolve([body, this, url])
                    }
                    else {
                        this.status({fill:"red",shape:"dot",text:"disconnect"});
                        reject([error, this, url])
                    }
                });
            })];
        }
        node.retrieveResource = function(url) {
            var thisoption = Object.assign({},this.requestOption,{
                url : this.requestOption.url + url,
                method : 'GET',
            });
            return [new Promise((resolve, reject) => {
                request(thisoption, (error, response, body)=>{
                    if (!error) {
                        this.log(`<retrieve>url : ${thisoption.url} ,body : ${JSON.stringify(body)}`);
                        this.status({fill:"green",shape:"dot",text:"connect"});
                        if (typeof body == "string")
                            reject([body, this, url]);
                        else
                            resolve([body, this, url])
                    }
                    else {
                        this.status({fill:"red",shape:"dot",text:"disconnect"});
                        reject([error, this, url])
                    }
                });
            })];
        };
        node.updateResource = function(url, ty, body) {
            if (typeof ty === 'string')
                ty = onem2m.code.getResourceType(ty);
    
            var thisoption = Object.assign({},this.requestOption,{
                url : this.requestOption.url + url,
                method : 'PUT',
            });
            thisoption.headers['Content-Type'] = 'application/json;ty='+ty;
            thisoption.body = body;
            return [new Promise((resolve, reject) => {
                request(thisoption, (error, response, body)=>{
                    if (!error) {
                        this.log(`<update>url : ${thisoption.url} ,body : ${JSON.stringify(body)}`);
                        this.status({fill:"green",shape:"dot",text:"connect"});
                        if (typeof body == "string")
                            reject([body, this, url]);
                        else
                            resolve([body, this, url])
                    }
                    else {
                        this.status({fill:"red",shape:"dot",text:"disconnect"});
                        reject([error, this, url])
                    }
                });
            })];
        };
        node.deleteResource = function(url) {
            var thisoption = Object.assign({},this.requestOption,{
                url : this.requestOption.url + url,
                method : 'DELETE',
            });
            return [new Promise((resolve, reject) => {
                request(thisoption, (error, response, body)=>{
                    if (!error) {
                        this.log(`<delete>url : ${thisoption.url} ,body : ${JSON.stringify(body)}`);
                        this.status({fill:"green",shape:"dot",text:"connect"});
                        if (typeof body == "string")
                            reject([body, this, url]);
                        else
                            resolve([body, this, url])
                    }
                    else {
                        this.status({fill:"red",shape:"dot",text:"disconnect"});
                        reject([error, this, url])
                    }
                });
            })];
        };
        node.checkResource = async function() {
            var result = await true;
            node.log('be check : '+result)
            return result;
        }

        node.log(`create ${node.type} <${node.id}>`);
    }
};