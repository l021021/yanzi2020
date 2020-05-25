// 列出所有的Location已经其下的传感器;可能需要几分钟才能收全

var WebSocketClient = require('websocket').client
var cirrusAPIendpoint = 'cirrus20.yanzi.se'

// var username = 'frank.shen@pinyuaninfo.com'
// var password = 'Ft@Sugarcube99'
var username = "653498331@qq.com";
var password = "000000";

// ################################################

// For log use only
var _Counter = 0 // message counter
var _OnlineUnitsCounter = 0
var _UnitsCounter = 0

var _Locations = []
var _Units = []
var TimeoutId = setTimeout(doReport, 20000) // wait for 1 min before exit
    // Create a web socket client initialized with the options as above
var client = new WebSocketClient()

// All Objs definition
var locationObj = {

    locationId: '123456',
    serverDid: 'EUI64-0090DAFFFF0040A9',
    accountId: '262468578',
    name: 'Beach House',
    gwdid: 'EUI64-12411261342',
    units: 0,
    Allunits: 0,
    Onlineunits: 0,
    gwOnline: false
        // "activityLevel": "medium"

}

var unitObj = {
    did: '',
    locationId: '',
    serverDid: '',
    productType: '',
    lifeCycleState: '',
    isChassis: '',
    chassisDid: '',
    nameSetByUser: '',
    type: ''

}

// Program body
client.on('connectFailed', function(error) {
    console.log('Connect Error: reconnect' + error.toString())
    beginPOLL()
})

client.on('connect', function(connection) {
    // console.log("Checking API service status with ServiceRequest.");
    sendServiceRequest()

    // Handle messages
    connection.on('message', function(message) {
        clearTimeout(TimeoutId)
        TimeoutId = setTimeout(doReport, 60000) // exit after 10 seconds idle
            // console.log('timer reset  ')

        if (message.type === 'utf8') {
            var json = JSON.parse(message.utf8Data)
            var t = new Date().getTime()
            var timestamp = new Date()
            timestamp.setTime(t)
            _Counter = _Counter + 1 // counter of all received packets

            // if (_Counter > _logLimit) {
            //     console.log("Enough Data!")
            //     console.log(_Locations.length + " locations : " + JSON.stringify(_Locations));
            //     connection.close();
            //     doReport();
            //     process.exit();
            // } //for log use only

            // Print all messages with type
            // console.log(_Counter + '# ' + timestamp.toLocaleTimeString() + ' RCVD_MSG:' + json.messageType)
            switch (json.messageType) {
                case 'ServiceResponse':
                    sendLoginRequest()
                    break
                case 'LoginResponse':
                    if (json.responseCode.name == 'success') {
                        sendPeriodicRequest() // as keepalive
                        sendGetLocationsRequest() // not mandatory
                            // sendSubscribeRequest(LocationId); //test one location
                            // sendSubscribeRequest_lifecircle(LocationId); //eventDTO
                    } else {
                        console.log(json.responseCode.name)
                        console.log("Couldn't login, check your username and passoword")
                        connection.close()
                        process.exit()
                    }
                    break
                case 'GetLocationsResponse':
                    if (json.responseCode.name == 'success') {
                        // UPDATE location IDs
                        if (json.list.length != 0) { // 收到一组新的location
                            for (var i = 0; i < json.list.length; i++) {
                                let _locationExist = false

                                for (const key in _Locations) { // already exits in Array?
                                    if (_Locations[key].locationID || (_Locations[key].locationID == json.list[i].locationAddress.locationId)) {
                                        _locationExist = true
                                    }
                                }

                                var _templocationObj
                                if (!_locationExist) {
                                    locationObj.locationId = json.list[i].locationAddress.locationId
                                    locationObj.serverDid = json.list[i].locationAddress.serverDid
                                    locationObj.accountId = json.list[i].accountId
                                    locationObj.name = json.list[i].name
                                    locationObj.gwdid = json.list[i].gwdid
                                    _templocationObj = JSON.parse(JSON.stringify(locationObj)) // deep copy
                                    _Locations.push(_templocationObj)
                                    sendGetUnitsRequest(json.list[i].locationAddress.locationId) // get units under this location
                                }
                            }
                        }
                    } else {
                        console.log(json.responseCode.name)
                        console.log("Couldn't get location")
                        connection.close()
                        process.exit()
                    };
                    // sendGetUnitsRequest(537931);
                    break
                case 'GetSamplesResponse':
                    // json.list[0].lifeCycleState.namejson.list[0].lifeCycleState.name
                    break
                case 'GetUnitsResponse':
                    if (json.responseCode.name == 'success') {
                        // console.log(JSON.stringify(json) + '\n\n');

                        var _tempunitObj

                        console.log('seeing ' + json.list.length + ' in  ' + json.locationAddress.locationId)
                        for (let index = 0; index < json.list.length; index++) { // process each response packet
                            if (json.list[index].unitTypeFixed.name == 'gateway' || json.list[index].unitAddress.did.indexOf('AP') != -1) { // console.log(json.list[index].unitAddress.did);
                                console.log('GW or AP in ' + json.locationAddress.locationId) // GW and AP are not sensor
                            } else {
                                // record all sensors
                                unitObj.did = json.list[index].unitAddress.did //
                                unitObj.locationId = json.locationAddress.locationId
                                unitObj.chassisDid = json.list[index].chassisDid
                                unitObj.productType = json.list[index].productType
                                unitObj.lifeCycleState = json.list[index].lifeCycleState.name
                                unitObj.isChassis = json.list[index].isChassis
                                unitObj.nameSetByUser = json.list[index].nameSetByUser
                                unitObj.serverDid = json.list[index].unitAddress.serverDid

                                unitObj.type = json.list[index].unitTypeFixed.name

                                _tempunitObj = JSON.parse(JSON.stringify(unitObj))
                                _Units.push(_tempunitObj)
                                _UnitsCounter++
                                console.log(_UnitsCounter + '# ' + JSON.stringify(_tempunitObj))
                                if (json.list[index].lifeCycleState.name == 'present') {
                                    _OnlineUnitsCounter++
                                }
                            };
                        }

                        // console.log(_UnitsCounter + ' Units in Location:  while ' + _OnlineUnitsCounter + ' online');
                    } else {
                        console.log("Couldn't get Units")
                    }
                    // json.list[0].lifeCycleState.name
                    break
                case 'PeriodicResponse':
                    setTimeout(sendPeriodicRequest, 60000)
                        // console.log(_Counter + '# ' + "periodic response-keepalive");
                    break
                case 'SubscribeResponse':

                case 'SubscribeData':

                default:
                    console.log('!!!! cannot understand')
                        // connection.close();
                    break
            }
        }
    })

    connection.on('error', function(error) {
        console.log('Connection Error: reconnect' + error.toString())
        beginPOLL()
    })

    connection.on('close', function() {
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
            // var nowMinusOneHour = now - 60 * 60 * 1000;
        var request = {
            messageType: 'GetLocationsRequest',
            timeSent: now
        }
        sendMessage(request)
    }

    function sendGetUnitsRequest(locationID) {
        var now = new Date().getTime()
        var request = {

            messageType: 'GetUnitsRequest',
            timeSent: now,
            locationAddress: {
                resourceType: 'LocationAddress',
                locationId: locationID
            }
        }
        console.log('sending request for ' + locationID)
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

function doReport() {
    // var output = ''
    var t = new Date().getTime()
    var timestamp = new Date()
    timestamp.setTime(t)
    console.log('Reporting：')
    console.log(timestamp.toLocaleTimeString() + '')
        // sorting
    _Locations.sort(function(a, b) {
        var x = a.gwOnline
        var y = b.gwOnline
        if (x > y) return 1
        if (x < y) return -1
        return 0
    })
    _Units.sort(function(a, b) {
        var x = a.locationId
        var y = b.locationId
        if (x > y) return 1
        if (x < y) return -1
        return 0
    })

    for (let i = 0; i < _Units.length; i++) {
        for (let j = 0; j < _Locations.length; j++) { // update to its locations
            if (_Locations[j].locationId == _Units[i].locationId) { // Location match
                _Locations[j].Allunits++
                    if (_Units[i].lifeCycleState == 'present') { // mark live gateways
                        _Locations[j].gwOnline = true // Location Online
                        _Locations[j].Onlineunits++ // mark online sensors
                    }
                if (_Units[i].isChassis == 'true') {
                    _Locations[j].units++
                } // mark physical sensors
                break // 跳出循环
            }
        }
    }

    // list each active location with sensors

    _Locations = _Locations.filter(item => item.gwOnline == 'true')
    console.table(_Locations)

    console.log('total ' + _Units.length + ' logical sensors live while ' + _OnlineUnitsCounter + ' sensors online') // sum up

    _Units = _Units.filter(item => item.gwOnline == 'true')
    console.table(_Units)


    // //list all online physical sensors
    // for (let j = 0; j < _Units.length; j++) {
    //     if (_Units[j].lifeCycleState == 'present')
    //         console.log(_Units[j].did + ' in ' + _Units[j].locationId);
    // }

    // //list all online logical  sensors
    // for (let j = 0; j < _Units.length; j++) {
    //     if (_Units[j].lifeCycleState == 'subUnit' && _Units[j].isChassis == false)
    //         console.log(_Units[j].did + ' as a ' + _Units[j].type + ' in ' + _Units[j].locationId);
    // }

    // _Units.forEach(function (x, i, a) {
    //     if (a[1].lifeCycleState == 'subUnit' && a[i].isChassis == false) console.log(_Units[key1].did + ' as a ' + _Units[key1].type + ' in ' + _Units[key1].locationId);

    // });
    // t = new Date().getTime()
    // timestamp = new Date()
    // timestamp.setTime(t)
    // console.log(timestamp.toLocaleTimeString() + 'ok!')
    // clearTimeout(TimeoutId)
    process.exit()
}

beginPOLL() c(
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