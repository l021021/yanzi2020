const WebSocketClient = require('websocket').client
const cirrusAPIendpoint = 'cirrus20.yanzi.se'
var sessionId
var heartbeatFlag = 0

// var username = 'frank.shen@pinyuaninfo.com'
// var password = 'Ft@Sugarcube99'
// var username = '653498331@qq.com'
// var password = '000000'
var username = 'de1999@vip.qq.com'
var password = '23456789'
const filter = '' //filter for console

// const typeofSubs =   
const typeofSubs = ['lifecircle', 'config', 'occupancy', 'battery']

var _logLimit = 50000 // will exit when this number of messages has been logged


var _Counter = 0 // message counter
var sensorArray = []
var motionTimeStamps = []
var assetTimeStamps1;
var assetTimeStamps2;
var assetTimeStamps3 = []
var _Locations = []
var _t1 = new Date()
var _t2 = new Date()
var _t3 = new Date()
var _recordObj = {
    type: '',
    Did: '',
    timeStamp: '',
    value: ''
}

function c(data) {
    if ((data.indexOf(filter) >= 0) && (filter.length !== '')) {
        try {
            console.log(data)
        } catch (error) {
            console.log(error)
        }
    }
}

var client = new WebSocketClient()

// Program body
function startConnect() {
    client.connect('wss://' + cirrusAPIendpoint + '/cirrusAPI')
}

startConnect()

client.on('connectFailed', function(error) {
    c(' --- Connect Error: reconnect -- ' + error.toString())

    client.connect('wss://' + cirrusAPIendpoint + '/cirrusAPI')
})

client.on('connect', function(connection) {
    c(' --- Connected to cloud --- ')
    heartbeatFlag = 0
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
                c('Enough Data!')
                c(_Locations.length + ' locations : ' + JSON.stringify(_Locations))
                connection.close()
                process.exit()
            }
            // c(_Counter + '# ' + timestamp.toLocaleTimeString() + ' RCVD_MSG:' + json.messageType)
            switch (json.messageType) {
                case 'ServiceResponse':
                    sendLoginRequest()
                    break
                case 'LoginResponse':
                    if (json.responseCode.name === 'success') { // json.sessionId
                        sessionId = json.sessionId
                        setInterval(sendPeriodicRequest, 60000) // as keepalive
                        sendGetLocationsRequest() // not mandatory
                        setInterval(sendGetLocationsRequest, 60000 * 120) // resubscribe every 120 MIn
                    } else {
                        c(json.responseCode.name)
                        c("Couldn't login, check your username and passoword")
                        connection.close()
                        process.exit()
                    }
                    break
                case 'GetLocationsResponse':
                    if (json.responseCode.name === 'success') {
                        // setTimeout(sendGetLocationsRequest, 60 * 1000 * 60)
                        // UPDATE location IDs
                        if (json.list.length !== 0) {
                            for (var i = 0; i < json.list.length; i++) {
                                if (_Locations.indexOf(json.list[i].locationAddress.locationId) < 0) {
                                    _Locations[json.list[i].locationAddress.locationId] = json.list[i].name
                                        // c(json.list[i].locationAddress.locationId)
                                    sendSubscribeRequest(json.list[i].locationAddress.locationId, typeofSubs)
                                }
                            }
                        }
                    } else {
                        c(json.responseCode.name)
                        c("Couldn't get location")
                        connection.close()
                        process.exit()
                    };
                    break
                    // c(_Counter + '# ' + "periodic response-keepalive");
                case 'PeriodicResponse':
                    heartbeatFlag = 0
                        // console.log('    periodic response rcvd (%s)', heartbeatFlag)
                    break
                case 'GetSamplesResponse':
                    break
                case 'GetUnitsResponse':
                    break
                case 'SubscribeResponse':
                    // const expireTime = json.expireTime
                    // let timeOut=setTimeout(sendGetLocationsRequest, json.expireTime - now - 600000)

                    // _t1.setTime(json.expireTime)
                    // console.log(                            'Susbscribe expire in (min)： ' + (json.expireTime - t) / 60000                        ) // 100min
                    break
                case 'SubscribeData':
                    _t2.setTime(json.timeSent)
                    switch (json.list[0].resourceType) {
                        case 'SampleList':
                            switch (json.list[0].list[0].resourceType) {
                                case 'SampleMotion': // sampleMotion
                                    {
                                        _t1.setTime(json.list[0].list[0].sampleTime)
                                        _t2.setTime(json.list[0].list[0].timeLastMotion) // sensor motion-detected time
                                        _t3.setTime(json.timeSent) // packet sent

                                        // algorithm based on SampleMotion；
                                        const temp1 = sensorArray[json.list[0].dataSourceAddress.did] || 0 // json.list[0].dataSourceAddress.did
                                        var temprecordObj
                                        var motionFlag = ' ?? ' // update new value
                                        _recordObj.type = 'samplemotion'
                                        _recordObj.Did = json.list[0].dataSourceAddress.did // json.list[0].dataSourceAddress.did
                                        _recordObj.timeStamp = _t1.getTime()
                                        sensorArray[json.list[0].dataSourceAddress.did] =
                                        json.list[0].list[0].value // setup sensor array
                                        if (temp1 === json.list[0].list[0].value - 1) {
                                            // Value changed!
                                            motionFlag = ' ++ '
                                            _recordObj.value = 'in'
                                            temprecordObj = JSON.parse(JSON.stringify(_recordObj))
                                            motionTimeStamps.push(temprecordObj)
                                        } else if (temp1 === json.list[0].list[0].value) {
                                            // no change
                                            motionFlag = ' == '
                                            _recordObj.value = 'ot'
                                            temprecordObj = JSON.parse(JSON.stringify(_recordObj))
                                            motionTimeStamps.push(temprecordObj)
                                                // motionTimeStamps.push(json.list[0].dataSourceAddress.did + ',ot,' + _t1.getTime());
                                        } else {
                                            //  c("        Sensor first seen, cannot tell");
                                        }

                                        c(
                                            '   ' +
                                            _Counter +
                                            '# ' +
                                            _t3.toLocaleTimeString() +
                                            ' SampleMotion ' +
                                            json.list[0].dataSourceAddress.did +
                                            motionFlag +
                                            // _t1.toLocaleTimeString() +
                                            // ' # ' +
                                            // json.list[0].list[0].value +
                                            // ' Last: ' +
                                            // _t2.toLocaleTimeString() +
                                            ' in ' + json.locationId
                                        )
                                    }
                                    break
                                case 'SampleAsset': // sampleAsset- free occupied ismotion isnomotion
                                    {
                                        _t3.setTime(json.list[0].list[0].sampleTime)
                                        // eslint-disable-next-line no-redeclare
                                        var motionFlag = ' ? ' // update new value
                                            // eslint-disable-next-line no-redeclare
                                        var temprecordObj
                                            // var motionFlag = ' ?? '; //update new value
                                        _recordObj.type = 'sampleAsset'
                                        _recordObj.Did = json.list[0].dataSourceAddress.did
                                        _recordObj.timeStamp = _t1.getTime()
                                        c(
                                            '   ' +
                                            _Counter +
                                            '# ' +
                                            _t3.toLocaleTimeString() + ' ' +
                                            // ' SampleAsset ' +
                                            json.list[0].list[0].assetState.name +
                                            ' ' +
                                            json.list[0].dataSourceAddress.did +
                                            // ' @ ' +
                                            // _t3.toLocaleTimeString() +
                                            // '  ' +
                                            // json.list[0].list[0].assetState.name +
                                            ' in ' + json.locationId
                                        )
                                        switch (json.list[0].list[0].assetState.name) {
                                            case 'isMotion':
                                                // assetTimeStamps1 += json.list[0].dataSourceAddress.did + ',mo,' + _t3.getTime() + '\n';
                                                _recordObj.value = 'mo'
                                                temprecordObj = JSON.parse(JSON.stringify(_recordObj))
                                                    // assetTimeStamps1.push(temprecordObj)

                                                break
                                            case 'isNoMotion':
                                                // assetTimeStamps1 += json.list[0].dataSourceAddress.did + ',nm,' + _t3.getTime() + '\n';
                                                _recordObj.value = 'nm'
                                                temprecordObj = JSON.parse(JSON.stringify(_recordObj))
                                                    // assetTimeStamps1.push(temprecordObj)
                                                break
                                            case 'free':
                                                // assetTimeStamps2 += json.list[0].dataSourceAddress.did + ',fr,' + _t3.getTime() + '\n';
                                                _recordObj.value = 'fr'
                                                temprecordObj = JSON.parse(JSON.stringify(_recordObj))
                                                    // assetTimeStamps2.push(temprecordObj)
                                                break
                                            case 'occupied':
                                                // assetTimeStamps2 += json.list[0].dataSourceAddress.did + ',oc,' + _t3.getTime() + '\n';
                                                _recordObj.value = 'oc'
                                                temprecordObj = JSON.parse(JSON.stringify(_recordObj))
                                                    // assetTimeStamps2.push(temprecordObj)
                                                break
                                            case 'missingInput':
                                                // assetTimeStamps2 += json.list[0].dataSourceAddress.did + ',mi,' + _t3.getTime() + '\n';
                                                _recordObj.value = 'mi'
                                                temprecordObj = JSON.parse(JSON.stringify(_recordObj))
                                                    // assetTimeStamps2.push(temprecordObj)
                                                break
                                            default:
                                                c(
                                                    '!Assetname ' +
                                                    json.list[0].list[0].assetState.name
                                                )
                                                break
                                        }
                                    }
                                    break
                                case 'SamplePercentage': // SamplePercentage
                                    {
                                        _t3.setTime(json.list[0].list[0].sampleTime)
                                        c(
                                            '   ' +
                                            _Counter +
                                            '# ' +
                                            _t2.toLocaleTimeString() +
                                            ' SamplePercentage ' +
                                            json.list[0].dataSourceAddress.did +
                                            ' @ ' +
                                            _t3.toLocaleTimeString() +
                                            ' Occu%:' +
                                            json.list[0].list[0].value + ' in ' + json.locationId
                                        )
                                    }
                                    break
                                case 'SampleUtilization': // SampleUtilization
                                    {
                                        _t3.setTime(json.list[0].list[0].sampleTime)
                                        c(
                                            '   ' +
                                            _Counter +
                                            '# ' +
                                            _t2.toLocaleTimeString() +
                                            ' SampleUtilization ' +
                                            json.list[0].dataSourceAddress.did +
                                            // ' @ ' +
                                            // _t3.toLocaleTimeString() +
                                            ' free:' +
                                            json.list[0].list[0].free +
                                            ' occupied:' +
                                            json.list[0].list[0].occupied + ' in ' + json.locationId
                                        )
                                        assetTimeStamps3 +=
                                        _t2.toLocaleTimeString() +
                                        ' AsstUT ' +
                                        json.list[0].dataSourceAddress.did +
                                        ' free:' +
                                        json.list[0].list[0].free +
                                        ' occupied:' +
                                        json.list[0].list[0].occupied + ' in ' + json.locationId +
                                        '\n'
                                    }
                                    break
                                case 'SampleUpState':
                                    {
                                        c('   ' +
                                            _Counter +
                                            '# ' +
                                            _t2.toLocaleTimeString() +
                                            ' SampleUpState ' +
                                            json.list[0].dataSourceAddress.did +
                                            ' ' +
                                            json.list[0].list[0].deviceUpState.name + ' in ' + json.locationId
                                        )
                                        // c(JSON.stringify(json));
                                    }
                                    break
                                default:
                                    // 环境参数
                                    _t2.setTime(json.timeSent)
                                        // if json.list[0].list[0].resourceType ==
                                    c('   ' + _Counter + '# ' + _t2.toLocaleTimeString() + ' ' + json.list[0].list[0].resourceType + ' ' + json.list[0].dataSourceAddress.did + ' ' + json.list[0].list[0].value + ' in ' + json.locationId)
                                    break
                            }
                            break
                        case 'EventType':
                            {
                                switch (json.list[0].resourceType) {
                                    case 'SlotDTO':
                                        {
                                            c(
                                                '   ' +
                                                _Counter + _t2.toLocaleTimeString() +
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
                                            c(
                                                '   ' +
                                                _Counter + _t2.toLocaleTimeString() +
                                                '# EndofDTO ' +
                                                json.list[0].dataSourceAddress.did +
                                                ' ' +
                                                json.list[0].list[0].sample.assetState.name
                                            )
                                        }
                                        break
                                    default:
                                        c(' !!!!  ' + _Counter + ' Unknown eventtype: ' + json.list[0].eventType.name)
                                        break
                                }
                            }
                            break
                        case 'EventDTO':
                            {
                                // var _tempeventObj
                                switch (json.list[0].eventType.name) { // json.list[0]json.list[0].eventType.name
                                    case 'newUnAcceptedDeviceSeenByDiscovery':
                                    case 'physicalDeviceIsNowUP':
                                    case 'physicalDeviceIsNowDOWN':
                                    case 'remoteLocationGatewayIsNowDOWN':
                                    case 'remoteLocationGatewayIsNowUP':
                                    case 'unitConfigurationChanged':
                                    case 'locationChanged':
                                        //  c(json.list[0].list[0].locationAddress.serverDid + ' 2  ' + json.list[0].list[0].locationAddress.locationId)
                                        //   eventObj.did = json.list[0].list[0].locationAddress.serverDid
                                        //  eventObj.locationId = json.list[0].list[0].locationAddress.locationId
                                        try { c('   ' + _Counter + '# ' + _t2.toLocaleTimeString() + ' ' + json.list[0].eventType.name + ' ' + json.list[0].unitAddress.did + ' ' + json.list[0].eventType.name + ' in ' + json.locationId) } catch {
                                            console.log(error)
                                            console.log(JSON.stringify(json))

                                        }
                                        // json.list[0].unitAddress.did
                                        break
                                    default:
                                        c(' !!!!  ' + _Counter + ' Unknown events: ' + json.list[0].eventType.name)
                                        break
                                }
                            }
                            break
                        default:
                            c(' !!!!  ' + _Counter + 'OTHER DATA?  ' + JSON.stringify(json))
                            break
                    }
            }
        }
    })

    connection.on('error', function(error) {
        c(' --- Connection Error: reconnect in 5 sec --' + error.toString())
        setTimeout(() => {
            startConnect()
        }, 5000)
    })

    connection.on('close', function(error) {
        c('Connection closed!' + error)
    })

    function sendMessage(message) {
        if (connection.connected) {
            var json = JSON.stringify(message, null, 1)
            json.sessionId = sessionId
            connection.sendUTF(json)
        } else {
            c("sendMessage: Couldn't send message, the connection is not open")
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

    // eslint-disable-next-line camelcase
    function sendSubscribeRequest(location_ID, dataType) {
        const now = new Date().getTime()
        let request

        dataType.forEach(element => {
            request = {
                messageType: 'SubscribeRequest',
                timeSent: now,
                unitAddress: {
                    resourceType: 'UnitAddress',
                    locationId: location_ID
                },
                subscriptionType: {
                    resourceType: 'SubscriptionType',
                    name: element
                }
            }

            sendMessage(request)
        })
    }

    function sendPeriodicRequest() {
        var now = new Date().getTime()
        var request = {
            messageType: 'PeriodicRequest',
            timeSent: now
        }
        if (heartbeatFlag === 3) {
            c('    periodic request missed (%s), will reconnect', heartbeatFlag)

            connection.close()

            // heartbeatFlag = 0
            startConnect()
        }
        sendMessage(request)

        // console.log('    periodic request send (%s)', heartbeatFlag)
        heartbeatFlag++
    }
})