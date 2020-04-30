/* eslint-disable camelcase */
// 获得账号下所有location的事件信息,五分钟报告一次汇总,或者在得到记录数上限时退出
//
//

var WebSocketClient = require('websocket').client
var cirrusAPIendpoint = 'cirrus20.yanzi.se'
var c = console.log <<
    << << < HEAD
    // var username = '653498331@qq.com'
    // var password = '000000'
    // const reportInter = 300000 //每隔五分钟,做一次汇总
var username = 'frank.shen@pinyuaninfo.com'
var password = 'Ft@Sugarcube99' ===
    === =
    var username = '653498331@qq.com'
var password = '000000'
const reportInter = 300000 // 每隔五分钟,做一次汇总
    // var username = "653498331@qq.com";
    // var password = "000000";
    >>>
    >>> > 6e dc5662754edaf456763429c9f62017c5bac6d8

// ################################################

// For log use only
var _Counter = 0 // message counter
var _logLimit = 5000 // will exit when this number of messages has been logged

var _Locations = []
var _Events = []
var eventsCounter = []

var _t1 = new Date()
var _t2 = new Date()
var _t3 = new Date()

var recordObj = {
    type: '',
    Did: '',
    timeStamp: '',
    value: ''
}

var sensorArray = []
var motionTimeStamps = []
var assetTimeStamps1 = []
var assetTimeStamps2 = []
    // eslint-disable-next-line no-unused-vars
var assetTimeStamps3

// Create a web socket client initialized with the options as above
var client = new WebSocketClient()
    // var TimeoutId = setTimeout(doReport, reportInter)
var eventObj = {
    timeOfEvent: 1569232419674,
    did: 'EUI64-0080E10300099999',
    name: 'discovered',
    locationId: '123456'

}

// Program body
client.on('connectFailed', function(error) {
    console.log('Connect Error: reconnect' + error.toString())
    beginPOLL()
})

client.on('connect', function(connection) {
    sendServiceRequest()

    // Handle messages
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var json = JSON.parse(message.utf8Data)
            var t = new Date().getTime()
            var timestamp = new Date()
            timestamp.setTime(t)
            _Counter++ // counter of all received packets

            if (_Counter >= _logLimit) {
                console.log('Enough Data!')
                    // console.log(_Locations.length + " locations : " + JSON.stringify(_Locations));
                connection.close()
                    // doReport()
                process.exit()
            } // for log use only
            // try {
            // Print all messages with type
            // console.log(_Counter + '# ' + timestamp.toLocaleTimeString() + ' RCVD_MSG:' + json.messageType)
            switch (json.messageType) {
                case 'ServiceResponse':
                    sendLoginRequest()
                    break
                case 'LoginResponse':
                    if (json.responseCode.name === 'success') {
                        sendPeriodicRequest() // as keepalive
                        sendGetLocationsRequest() // not mandatory
                    } else {
                        console.log(json.responseCode.name)
                        console.log("Couldn't login, check your username and passoword")
                        connection.close()
                        process.exit()
                    }
                    break
                case 'GetLocationsResponse':
                    if (json.responseCode.name === 'success') {
                        // UPDATE location IDs
                        if (json.list.length !== 0) {
                            for (var i = 0; i < json.list.length; i++) {
                                // let _locationExist = false

                                if (_Locations.indexOf(json.list[i].locationAddress.locationId) < 0) {
                                    _Locations[json.list[i].locationAddress.locationId] = json.list[i].name
                                        // sendSubscribeRequest(json.list[i].locationAddress.locationId, 'lifecircle') // subscribe eventDTO
                                        // sendSubscribeRequest_config(json.list[i].locationAddress.locationId)
                                        // sendSubscribeRequest(json.list[i].locationAddress.locationId, 'data') // subscribe data
                                    sendSubscribeRequest(json.list[i].locationAddress.locationId, 'battery') // battery


                                }
                            }
                        }
                    } else {
                        console.log(json.responseCode.name)
                        console.log("Couldn't get location")
                        connection.close()
                        process.exit()
                    };
                    break
                    // console.log(_Counter + '# ' + "periodic response-keepalive");
                case 'PeriodicResponse':
                    setTimeout(sendPeriodicRequest, 60000)
                    break
                case 'GetSamplesResponse':
                    break
                case 'GetUnitsResponse':
                    break

                case 'SubscribeResponse':
                    var now = new Date().getTime()
                        // let _t1 = new Date().getTime()
                    setTimeout(sendGetLocationsRequest, json.expireTime - now)
                        // _t1.setTime(json.expireTime)
                    console.log(
                            'Susbscribe renew in (min)： ' + (json.expireTime - now) / 60000
                        ) // 100min
                    break
                case 'SubscribeData':
                    switch (json.list[0].resourceType) {
                        case 'SampleList':
                            switch (json.list[0].list[0].resourceType) {
                                case 'SampleMotion': // sampleMotion
                                    {
                                        _t1.setTime(json.list[0].list[0].sampleTime)
                                        _t2.setTime(json.list[0].list[0].timeLastMotion) // sensor motion-detected time
                                        _t3.setTime(json.timeSent) // packet sent

                                        // algorithm based on SampleMotion；
                                        var temp1 = sensorArray[json.list[0].dataSourceAddress.did]
                                        var temprecordObj
                                        var motionFlag = ' ?? ' // update new value
                                        recordObj.type = 'samplemotion'
                                        recordObj.Did = json.list[0].dataSourceAddress.did //json.list[0].dataSourceAddress.did
                                        recordObj.timeStamp = _t1.getTime()
                                        sensorArray[json.list[0].dataSourceAddress.did] =
                                        json.list[0].list[0].value // setup sensor array
                                        if (temp1 === json.list[0].list[0].value - 1) {
                                            // Value changed!
                                            motionFlag = ' ++ '
                                            recordObj.value = 'in'
                                            temprecordObj = JSON.parse(JSON.stringify(recordObj))
                                            motionTimeStamps.push(temprecordObj)
                                        } else if (temp1 === json.list[0].list[0].value) {
                                            motionFlag = ' == '
                                            recordObj.value = 'ot'
                                            temprecordObj = JSON.parse(JSON.stringify(recordObj))
                                            motionTimeStamps.push(temprecordObj)
                                                // motionTimeStamps.push(json.list[0].dataSourceAddress.did + ',ot,' + _t1.getTime());
                                        } else {
                                            // do not record to record
                                            // console.log("        Sensor first seen, cannot tell");
                                        }

                                        console.log(
                                            '   ' +
                                            _Counter +
                                            '# ' +
                                            _t3.toLocaleTimeString() +
                                            ' SampleMotion ' +
                                            json.list[0].dataSourceAddress.did +
                                            motionFlag +
                                            _t1.toLocaleTimeString() +
                                            ' # ' +
                                            json.list[0].list[0].value +
                                            ' Last: ' +
                                            _t2.toLocaleTimeString() +
                                            ' static(s)：  ' +
                                            (json.list[0].list[0].sampleTime -
                                                json.list[0].list[0].timeLastMotion) /
                                            1000
                                        )
                                    }
                                    break
                                case 'SampleAsset': // sampleAsset- free occupied ismotion isnomotion
                                    {
                                        _t2.setTime(json.timeSent)
                                        _t3.setTime(json.list[0].list[0].sampleTime)
                                        // eslint-disable-next-line no-redeclare
                                        var motionFlag = ' ? ' // update new value
                                            // eslint-disable-next-line no-redeclare
                                        var temprecordObj
                                            // var motionFlag = ' ?? '; //update new value
                                        recordObj.type = 'sampleAsset'
                                        recordObj.Did = json.list[0].dataSourceAddress.did
                                        recordObj.timeStamp = _t1.getTime()
                                        console.log(
                                            '   ' +
                                            _Counter +
                                            '# ' +
                                            _t3.toLocaleTimeString() + ' ' +
                                            // ' SampleAsset ' +
                                            json.list[0].list[0].assetState.name +
                                            ' ' +
                                            json.list[0].dataSourceAddress.did +
                                            ' @ ' +
                                            _t3.toLocaleTimeString() +
                                            '  ' +
                                            json.list[0].list[0].assetState.name
                                        )
                                        switch (json.list[0].list[0].assetState.name) {
                                            case 'isMotion':
                                                // assetTimeStamps1 += json.list[0].dataSourceAddress.did + ',mo,' + _t3.getTime() + '\n';
                                                recordObj.value = 'mo'
                                                temprecordObj = JSON.parse(JSON.stringify(recordObj))
                                                assetTimeStamps1.push(temprecordObj)

                                                break
                                            case 'isNoMotion':
                                                // assetTimeStamps1 += json.list[0].dataSourceAddress.did + ',nm,' + _t3.getTime() + '\n';
                                                recordObj.value = 'nm'
                                                temprecordObj = JSON.parse(JSON.stringify(recordObj))
                                                assetTimeStamps1.push(temprecordObj)
                                                break
                                            case 'free':
                                                // assetTimeStamps2 += json.list[0].dataSourceAddress.did + ',fr,' + _t3.getTime() + '\n';
                                                recordObj.value = 'fr'
                                                temprecordObj = JSON.parse(JSON.stringify(recordObj))
                                                assetTimeStamps2.push(temprecordObj)
                                                break
                                            case 'occupied':
                                                // assetTimeStamps2 += json.list[0].dataSourceAddress.did + ',oc,' + _t3.getTime() + '\n';
                                                recordObj.value = 'oc'
                                                temprecordObj = JSON.parse(JSON.stringify(recordObj))
                                                assetTimeStamps2.push(temprecordObj)
                                                break
                                            case 'missingInput':
                                                // assetTimeStamps2 += json.list[0].dataSourceAddress.did + ',mi,' + _t3.getTime() + '\n';
                                                recordObj.value = 'mi'
                                                temprecordObj = JSON.parse(JSON.stringify(recordObj))
                                                assetTimeStamps2.push(temprecordObj)
                                                break
                                            default:
                                                console.log(
                                                    '!Assetname ' +
                                                    json.list[0].list[0].assetState.name
                                                )
                                                break
                                        }
                                    }
                                    break
                                case 'SamplePercentage': // SamplePercentage
                                    {
                                        _t2.setTime(json.timeSent)
                                        _t3.setTime(json.list[0].list[0].sampleTime)
                                        console.log(
                                            '   ' +
                                            _Counter +
                                            '# ' +
                                            _t2.toLocaleTimeString() +
                                            ' SamplePercentage ' +
                                            json.list[0].dataSourceAddress.did +
                                            ' @ ' +
                                            _t3.toLocaleTimeString() +
                                            ' Occu%:' +
                                            json.list[0].list[0].value
                                        )
                                    }
                                    break
                                case 'SampleUtilization': // SampleUtilization
                                    {
                                        _t2.setTime(json.timeSent)
                                        _t3.setTime(json.list[0].list[0].sampleTime)
                                        console.log(
                                            '   ' +
                                            _Counter +
                                            '# ' +
                                            _t2.toLocaleTimeString() +
                                            ' SampleUtilization ' +
                                            json.list[0].dataSourceAddress.did +
                                            ' @ ' +
                                            _t3.toLocaleTimeString() +
                                            ' free:' +
                                            json.list[0].list[0].free +
                                            ' occupied:' +
                                            json.list[0].list[0].occupied
                                        )
                                        assetTimeStamps3 +=
                                        _t2.toLocaleTimeString() +
                                        ' AsstUT ' +
                                        json.list[0].dataSourceAddress.did +
                                        ' free:' +
                                        json.list[0].list[0].free +
                                        ' occupied:' +
                                        json.list[0].list[0].occupied +
                                        '\n'
                                    }
                                    break
                                case 'SampleUpState':
                                    {
                                        _t2.setTime(json.list[0].list[0].sampleTime)
                                        console.log('   ' +
                                            _Counter +
                                            '# ' +
                                            _t2.toLocaleTimeString() +
                                            ' SampleUpState ' +
                                            json.list[0].dataSourceAddress.did +
                                            ' ' +
                                            json.list[0].list[0].deviceUpState.name
                                        )
                                        // console.log(JSON.stringify(json));
                                    }
                                    break
                                default:
                                    // 环境参数
                                    _t2.setTime(json.timeSent)
                                        // if json.list[0].list[0].resourceType ==
                                    console.log('   ' + _Counter + '# ' + _t2.toLocaleTimeString() + ' ' + json.list[0].list[0].resourceType + ' ' + json.list[0].dataSourceAddress.did + ' in ' + json.locationId + ' ' + json.list[0].list[0].percentFull || '')
                                    break
                            }

                            break
                        case 'EventType':
                            {
                                switch (json.list[0].resourceType) {
                                    case 'SlotDTO':
                                        {
                                            console.log(
                                                '   ' +
                                                _Counter +
                                                '# SlotDTO ' +
                                                json.list[0].dataSourceAddress.did +
                                                '=' +
                                                (json.list[0].list[0].maxValue +
                                                    json.list[0].list[0].minValue) /
                                                2
                                            )
                                        }
                                        break
                                    case 'SampleEndOfSlot':
                                        {
                                            console.log(
                                                '   ' +
                                                _Counter +
                                                '# EndofDTO ' +
                                                json.list[0].dataSourceAddress.did +
                                                ' ' +
                                                json.list[0].list[0].sample.assetState.name
                                            )
                                        }
                                        break

                                }
                            }
                            break
                        case 'EventDTO':
                            {
                                var _tempeventObj
                                switch (json.list[0].eventType.name) { //json.list[0]json.list[0].eventType.name
                                    case 'newUnAcceptedDeviceSeenByDiscovery':
                                    case 'physicalDeviceIsNowUP':
                                    case 'physicalDeviceIsNowDOWN':
                                    case 'remoteLocationGatewayIsNowDOWN':
                                    case 'remoteLocationGatewayIsNowUP':
                                    case 'unitConfigurationChanged':
                                    case 'locationChanged':
                                        //  console.log(json.list[0].list[0].locationAddress.serverDid + ' 2  ' + json.list[0].list[0].locationAddress.locationId)
                                        //   eventObj.did = json.list[0].list[0].locationAddress.serverDid
                                        //  eventObj.locationId = json.list[0].list[0].locationAddress.locationId
                                        console.log('   ' + _Counter + '# ' + json.locationId + ' ' + json.list[0].eventType.name)

                                        break
                                    default:
                                        console.log('   ' + _Counter + ' Unknown events: ' + json.list[0].eventType.name)
                                        break
                                }
                            }
                            break
                        default:
                            console.log('   ' + _Counter + 'OTHER DATA?  ' + JSON.stringify(json))
                            break
                    }
            }
            // } catch (error) {
            //     // console.log('Error!' + error.toString() + '-- --\n ' + JSON.stringify(json))
            // }
        }
    })

    connection.on('error', function(error) {
        console.log('Connection Error: reconnect' + error.toString())
        beginPOLL()
    })

    connection.on('close', function(error) {
        console.log('Connection closed!' + error)
    })

    function sendMessage(message) {
        if (connection.connected) {
            var json = JSON.stringify(message, null, 1)
            connection.sendUTF(json)
        } else {
            console.log("sendMessage: Couldn't send message, the connection is not open")
        }
    }

    function sendServiceRequest() {
        var request = {
            messageType: 'ServiceRequest',
            clientId: 'client-fangtang'

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
        var request = {
            messageType: 'GetLocationsRequest',
            timeSent: now
        }
        sendMessage(request)
    }

    function sendSubscribeRequest_lifecircle(location_ID) {
        var now = new Date().getTime()
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

    function sendSubscribeRequest(location_ID, dataType) {
        var now = new Date().getTime()
        var request = {
            messageType: 'SubscribeRequest',
            timeSent: now,
            unitAddress: {
                resourceType: 'UnitAddress',
                locationId: location_ID
            },
            subscriptionType: {
                resourceType: 'SubscriptionType',
                name: dataType // data   |  lifecircle  |  config | batetry|sensorData|assetData|occupancy| occupancySlots|sensorSlots| assetSlots

            }
        }

        sendMessage(request)
    }

    function sendSubscribeRequest_config(location_ID) {
        var now = new Date().getTime()
        var request = {
            messageType: 'SubscribeRequest',
            timeSent: now,
            unitAddress: {
                resourceType: 'UnitAddress',
                locationId: location_ID
            },
            subscriptionType: {
                resourceType: 'SubscriptionType',
                name: 'config' // data   |  lifecircle  |  config
            }
        }

        sendMessage(request)
    }

    function sendSubscribeRequest_data(location_ID) {
        var now = new Date().getTime()
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
    client.connect('wss://' + cirrusAPIendpoint + '/cirrusAPI')
        // console.log("Connecting to wss://" + cirrusAPIendpoint + "/cirrusAPI using username " + username);
}

// function doReport() {
//     scan_array(eventsCounter)
//     clearTimeout(TimeoutId)
//     TimeoutId = setTimeout(doReport, reportInter)
// }

beginPOLL()

function scan_array(arr) {
    c('\n Listing Stored Events: \n')
    for (var key in arr) { // 这个是关键
        // eslint-disable-next-line valid-typeof
        if (typeof(arr[key]) === 'array' || typeof(arr[key]) === 'object') { // 递归调用
            scan_array(arr[key])
        } else {
            console.log('      ' + key + ' --- ' + arr[key])
        }
    }
    c('\n                ------- \n')
}