# node-red-contrib-onem2m

[![npm version](https://badge.fury.io/js/node-red-contrib-onem2m.svg)](https://badge.fury.io/js/node-red-contrib-onem2m)

在 Node-RED 上使用 oneM2M 協定

use onem2m protocol at Node-RED

## How install 如何安裝

### command line

請先到需要安裝該 node 的 Node-RED 資料夾

`$ cd [您安裝的位置]/.node-red`

使用 npm 安裝該 node

`$ npm install node-red-contrib-onem2m`

重新打開 node-red，即可看到安裝的 node

`$ node-red`

### use Node-RED

打開 Node-RED editor

右上角點開 Settings -> Palette -> Install

搜尋 `node-red-contrib-onem2m` 點擊 install 

## Nodes 節點

目前完成的 oneM2M 資源 node 如下

- CSE
- AE
- Container
- contentInstance
- subscription

能夠使用的 protocal

- http

## exapmle 範例

把一個 LED 放上 oneM2M CSE

藉由 subscription 去查看是否要改變 LED 狀態

## TODO

- subscription 訂閱失敗該怎麼處理
- subscription 選擇訂閱資源更視覺化
- 支持 MQTT 跟 CoAP
- 其他還沒想到
