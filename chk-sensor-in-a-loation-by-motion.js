/* eslint-disable handle-callback-err */
/* eslint-disable no-undef */
/* eslint-disable camelcase */
/* 这个是传感器测试工具，测试网关下所有传感器的motion状态是否正常，测试过程如下：

        保持传感器没人状态至少10分钟；
        启动程序；保持无人状态；
        30分钟后触发所有传感器；
        保持无人状态；
        10分钟后，再次触发传感器；
        保持无人状态；
        保持约20分钟的无人；
        根据传感器数量估计——logLimit取值；
        大约是传感器数量X70；
        */

// var username = "653498331@qq.com";
var username = 'frank.shen@pinyuaninfo.com'
var password = 'Internetofthing'

// var LocationId = '229349' //fangtang
// var LocationId = '188559' //1001
// var LocationId = '88252' //1002
// var LocationId = '60358' //1003
// var LocationId = '938433' //1004
// var LocationId = '83561' //1005
var LocationId = '194130' //dfocus


// var LocationId = '521209' //wafer-shanghai
// var LocationId = '74365' // kerry 静安
// var LocationId = '797296' // leino

var _logLimit = 1000 // will exit when this number of messages has been logged

// Set up endpoint, you'll probably need to change this
var cirrusAPIendpoint = 'cirrus11.yanzi.se'
var WebSocketClient = require('websocket').client

// ##########CHANGE BELOW TO YOUR OWN DATA##########

// Set up credentials. Please DONT have your credentials in your code when running on production

// ################################################

// For log use only
var _Counter = 0 // message counter

var sensorCounterMap = new Map()
var sensorMotionMap = new Map()
var sensorNoMotionMap = new Map()

// Create a web socket client initialized with the options as above
var client = new WebSocketClient()
const c = console.log

client.on('connectFailed', function(error) {
    c('Connect Error: ' + error.toString())
    connection.close()
    beginPOLL()
})

client.on('connect', function(connection) {
    // c("Checking API service status with ServiceRequest.");
    sendServiceRequest()
        // Handle messages
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var json = JSON.parse(message.utf8Data)
            var t = new Date().getTime()
            var timestamp = new Date()
            timestamp.setTime(t)
                //        c(timestamp.toLocaleTimeString());

            _Counter = _Counter + 1 // counter of all received packets

            if (_Counter > _logLimit) {
                c('Enough Data, I will quit now!')
                c(timestamp.toLocaleTimeString())
                connection.close()

                // do some report before exit
                c('Total sensors detected ' + sensorCounterMap.size)

                sensorCounterMap.forEach(function(value, key, map) {
                    c('key:%s,value:%s', key, value)
                })

                c('\n\nSensors and Motion data counter: ')
                sensorMotionMap.forEach(function(value, key, map) {
                    c('key:%s,total:%s', key, value)
                })
                c('\n\nSensors and noMotion data counter:')
                sensorNoMotionMap.forEach(function(value, key, map) {
                    c('key:%s,total:%s', key, value)
                })
                process.exit()
            } // for log use only

            // Print all messages with DTO type
            // c(_Counter + '# ' + timestamp.toLocaleTimeString() + ' RCVD_MSG:' + json.messageType);
            switch (json.messageType) {
                case 'ServiceResponse':
                    sendLoginRequest()
                    break
                case 'LoginResponse':
                    if (json.responseCode.name === 'success') {
                        sendPeriodicRequest() // as keepalive
                        sendSubscribeRequest(LocationId) // test
                        sendSubscribeRequest_lifecircle(LocationId) // eventDTO
                    } else {
                        c(json.responseCode.name)
                        c("Couldn't login, check your username and passoword")
                        connection.close()
                        process.exit()
                    }
                    break
                case 'PeriodicResponse':
                    setTimeout(sendPeriodicRequest, 60000)
                    break
                case 'SubscribeResponse':
                    var now = new Date().getTime()
                    setTimeout(sendGetLocationsRequest, json.expireTime - now)
                    break

                case 'SubscribeData':
                    switch (json.list[0].resourceType) {
                        case 'SampleList':
                            // Sensor DATA
                            switch (json.list[0].dataSourceAddress.variableName.name) {
                                case 'motion': // sampleMotion
                                    var temp1 = sensorCounterMap.get(json.list[0].dataSourceAddress.did)
                                    sensorCounterMap.set(json.list[0].dataSourceAddress.did, json.list[0].list[0].value)
                                    if (temp1 === (json.list[0].list[0].value - 1)) { // Value changed!
                                        c(timestamp.toLocaleTimeString() + ' ' + _Counter + '# ' + 'Motion!')
                                        sensorMotionMap.set(json.list[0].dataSourceAddress.did, sensorMotionMap.get(json.list[0].dataSourceAddress.did) + 1)
                                            //     motionTimeStamps = motionTimeStamps + '{"ID":' + '"' + json.list[0].dataSourceAddress.did + '","in":"' + _t1.toLocaleTimeString() + '"},';
                                    } else if (temp1 === json.list[0].list[0].value) {
                                        c(timestamp.toLocaleTimeString() + ' ' + _Counter + '# ' + 'No motion!')
                                        sensorNoMotionMap.set(json.list[0].dataSourceAddress.did, sensorNoMotionMap.get(json.list[0].dataSourceAddress.did) + 1)
                                    } else {
                                        sensorMotionMap.set(json.list[0].dataSourceAddress.did, 0)
                                        sensorNoMotionMap.set(json.list[0].dataSourceAddress.did, 0)
                                        c(timestamp.toLocaleTimeString() + ' ' + _Counter + '# ' + 'Sensor first seen')
                                    };

                                    break
                                case 'assetUtilization': // SampleUtilization
                                    break
                                default:
                                    c(timestamp.toLocaleTimeString() + ' ' + _Counter + '# ' + json.list[0].dataSourceAddress.variableName.name)
                            }
                            break
                        default:
                    }
                    break

                default:
                    c('!!!! cannot understand' + json)
                        // connection.close();
                    break
            }
        }
    })

    connection.on('error', function(error) {
        c('Connection Error: ' + error.toString())
        beginPOLL()
            // process.exit();
    })

    connection.on('close', function(error) {
        c('Connection closed!')
        beginPOLL()
        process.exit()
    })

    function sendMessage(message) {
        if (connection.connected) {
            // Create the text to be sent
            var json = JSON.stringify(message, null, 1)
                //    c('sending' + JSON.stringify(json));
            connection.sendUTF(json)
        } else {
            c("sendMessage: Couldn't send message, the connection is not open")
        }
    }

    function sendServiceRequest() {
        var request = {
            messageType: 'ServiceRequest'
        }
        sendMessage(request)
    }

    function sendLoginRequest() {
        var request = {
            messageType: 'LoginRequest',
            username: username,
            password: password
        }
        sendMessage(request)
    }

    function sendGetLocationsRequest() {
        var now = new Date().getTime()
            // var nowMinusOneHour = now - 60 * 60 * 1000;
        var request = {
            messageType: 'GetLocationsRequest',
            timeSent: now
        }
        sendMessage(request)
    }

    function sendSubscribeRequest(location_ID) {
        var now = new Date().getTime()
            //   var nowMinusOneHour = now - 60 * 60 * 1000;
        var request = {
            messageType: 'SubscribeRequest',
            timeSent: now,
            unitAddress: {
                resourceType: 'UnitAddress',
                locationId: location_ID
            },
            subscriptionType: {
                resourceType: 'SubscriptionType',
                name: 'data' // data   |  lifecircle  |  config
            }
        }

        sendMessage(request)
    }

    function sendSubscribeRequest_lifecircle(location_ID) {
        var now = new Date().getTime()
            //   var nowMinusOneHour = now - 60 * 60 * 1000;
        var request = {
            messageType: 'SubscribeRequest',
            timeSent: now,
            unitAddress: {
                resourceType: 'UnitAddress',
                locationId: location_ID
            },
            subscriptionType: {
                resourceType: 'SubscriptionType',
                name: 'lifecircle' // data   |  lifecircle  |  config
            }
        }

        sendMessage(request)
    }

    function sendPeriodicRequest() {
        var now = new Date().getTime()
        var request = {
            messageType: 'PeriodicRequest',
            timeSent: now
        }
        sendMessage(request)
    }
})

function beginPOLL() {
    if (!username) {
        console.error('The username has to be set')
        return
    }
    if (!password) {
        console.error('The password has to be set')
        return
    }
    client.connect('wss://' + cirrusAPIendpoint + '/cirrusAPI')
        // c("Connecting to wss://" + cirrusAPIendpoint + "/cirrusAPI using username " + username);
}

beginPOLL()