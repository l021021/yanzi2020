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

var LocationId = '229349' // 1002
var _logLimit = 500 // will exit when this number of messages has been logged

// Set up endpoint, you'll probably need to change this
var cirrusAPIendpoint = 'cirrus21.yanzi.se'
var WebSocketClient = require('websocket').client

// ##########CHANGE BELOW TO YOUR OWN DATA##########

// Set up credentials. Please DONT have your credentials in your code when running on production

// var username = "653498331@qq.com";
var username = 'frank.shen@pinyuaninfo.com'
var password = 'Internetofthing'

// Location ID and Device ID, please change this to your own, can be found in Yanzi Live
// var LocationId = '229349' //fangtang
// var LocationId = '188559' //1001

// var LocationId = '938433' //1001

// ################################################

// For log use only
var _Counter = 0 // message counter
var _Counter1 = 0 // sensor counter

// var _Locations = [];
var sensorArray = []
// 二维数组，0：传感器ID，1：motion计数，2：Nomotion计数;3:当前value
var motionTimeStamps

var _t1 = new Date()
for (var i = 0; i < 5; i++) {
    sensorArray[i] = []
}

// Create a web socket client initialized with the options as above
var client = new WebSocketClient()

client.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString())
    connection.close()
})

client.on('connect', function (connection) {
    // console.log("Checking API service status with ServiceRequest.");
    sendServiceRequest()
    // Handle messages
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            var json = JSON.parse(message.utf8Data)
            var t = new Date().getTime()
            var timestamp = new Date()
            timestamp.setTime(t)
            _Counter = _Counter + 1 // counter of all received packets

            if (_Counter > _logLimit) {
                console.log('Enough Data, I will quit now!')
                connection.close()
                var output = ''

                // sensorArray.forEach(element => {
                //     sensorArray[element].forEach(element1 => {
                //         console.log(sensorArray[element][element1]);

                //     });

                // }
                scan_array(sensorArray)

                /*    for (var i = 0; i < sensorArray.length; i++) {
                    //  const element = array[index];
                    for (var j = 0; j < sensorArray[i].length; j++) {
                        _Counter1 = _Counter1 + 1;
                        if (output == "") {
                            output = key.substring(0, 22) + ' - ' + sensorArray[i][j];
                        }
                        else {
                            // output = key +  + sensorArray[key];
                            output += "\n" + key.substring(0, 22) + ' - ' + sensorArray[i][j];
                        }
                    }

                } */
                // do some report before exit
                console.log('Total sensors: ' + _Counter1)
                console.log(output)
                process.exit()
            } // for log use only

            // Print all messages with DTO type
            // console.log(_Counter + '# ' + timestamp.toLocaleTimeString() + ' RCVD_MSG:' + json.messageType);
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
                        console.log(json.responseCode.name)
                        console.log("Couldn't login, check your username and passoword")
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

                                    var temp1 = sensorArray[3][json.list[0].dataSourceAddress.did]
                                    var motionFlag = ' ? ' // update new value
                                    sensorArray[3][json.list[0].dataSourceAddress.did] = json.list[0].list[0].value // latest value
                                    if (temp1 === (json.list[0].list[0].value - 1)) { // Value changed!
                                        console.log('motion!')
                                        motionFlag = ' + '
                                        sensorArray[1][json.list[0].dataSourceAddress.did] = sensorArray[1][json.list[0].dataSourceAddress.did] + 1

                                        motionTimeStamps = motionTimeStamps + '{"ID":' + '"' + json.list[0].dataSourceAddress.did + '","in":"' + _t1.toLocaleTimeString() + '"},'
                                    } else if (temp1 === json.list[0].list[0].value) {
                                        console.log('no motion!')
                                        motionFlag = ' - '
                                        sensorArray[2][json.list[0].dataSourceAddress.did] = sensorArray[2][json.list[0].dataSourceAddress.did] + 1

                                        motionTimeStamps = motionTimeStamps + '{"ID":' + '"' + json.list[0].dataSourceAddress.did + '","ot":"' + _t1.toLocaleTimeString() + '"},'
                                    } else {
                                        sensorArray[0][json.list[0].dataSourceAddress.did] = 1
                                        sensorArray[1][json.list[0].dataSourceAddress.did] = 0
                                        sensorArray[2][json.list[0].dataSourceAddress.did] = 0

                                        console.log('first seen! cannot tell')
                                    };

                                    break
                                case 'assetUtilization': // SampleUtilization
                                    break
                                default:
                                    console.log(_Counter + '# ' + 'Other ' + json.list[0].dataSourceAddress.variableName.name)
                            }
                            break
                        default:
                    }
                    break

                default:
                    console.log('!!!! cannot understand' + json)
                    // connection.close();
                    break
            }
        }
    })

    connection.on('error', function (error) {
        console.log('Connection Error: ' + error.toString())
    })

    connection.on('close', function (error) {
        console.log('Connection closed!')
    })

    function sendMessage(message) {
        if (connection.connected) {
            // Create the text to be sent
            var json = JSON.stringify(message, null, 1)
            //    console.log('sending' + JSON.stringify(json));
            connection.sendUTF(json)
        } else {
            console.log("sendMessage: Couldn't send message, the connection is not open")
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

    function sendGetSamplesRequest() {
        var now = new Date().getTime()
        var nowMinusOneHour = now - 60 * 60 * 1000
        var request = {
            messageType: 'GetSamplesRequest',
            dataSourceAddress: {
                resourceType: 'DataSourceAddress',
                did: deviceID,
                locationId: locationId,
                variableName: {
                    resourceType: 'VariableName',
                    name: 'temperatureC'
                }
            },
            timeSerieSelection: {
                resourceType: 'TimeSerieSelection',
                timeStart: nowMinusOneHour,
                timeEnd: now
            }
        }
        sendMessage(request)
    }

    function sendGetUnitsRequest() {
        var now = new Date().getTime()
        var nowMinusOneHour = now - 60 * 60 * 1000
        var request = {

            messageType: 'GetUnitsRequest',
            timeSent: now,
            locationAddress: {
                resourceType: 'LocationAddress',
                locationId: locationID
            }
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
    // console.log("Connecting to wss://" + cirrusAPIendpoint + "/cirrusAPI using username " + username);
}

function scan_array(arr) {
    // c('\n Listing Stored Events: \n')
    for (var key in arr) { // 这个是关键
        if (typeof (arr[key]) === 'array' || typeof (arr[key]) === 'object') { // 递归调用
            scan_array(arr[key])
        } else {
            console.log('      ' + key + ' --- ' + arr[key])
        }
    }
    console.log('\n                ------- \n')
}

beginPOLL()
