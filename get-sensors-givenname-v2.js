// 列出所有的Location已经其下的传感器;可能需要几分钟才能收全
// let locationsToPrint = ['447223', '290596', '879448'] // can be [] to get all under account
// let locationsToPrint = ['503370'] // can be [] to get all under account
let locationsToPrint = ['229349'] // can be [] to get all under account
    // let locationsToPrint = ['797296'] // can be [] to get all under account
    // let type = 'EU' //'UU'
    // let ischasisFlag = (type === 'UU') ? false : true //false


const WebSocketClient = require('websocket').client
const cirrusAPIendpoint = 'cirrus11.yanzi.se'
var username = 'frank.shen@pinyuaninfo.com'
var password = 'Ft@Sugarcube99'

// ################################################

let _Counter = 0 // message counter
    // let _OnlineUnitsCounter = 0
    // let _UnitsCounter

const _Locations = new Map()
const units = []
let TimeoutId = setTimeout(doReport, 10000) // wait for 30 sec before exit
    // Create a web socket client initialized with the options as above
const client = new WebSocketClient()

let _onlineLocations = new Set()
const unitObj = {
    did: '',
    locationId: '',
    locationName: '',
    lifeCycleState: '',
    // productType: '',
    nameSetByUser: ''
}

// Program body
client.on('connectFailed', function(error) {
    console.log('Connect Error: reconnect' + error.toString())
    start()
})

client.on('connect', function(connection) {
    // console.log("Checking API service status with ServiceRequest.");
    sendServiceRequest()

    // Handle messages
    connection.on('message', function(message) {
        clearTimeout(TimeoutId)
        TimeoutId = setTimeout(doReport, 30000) // exit after 10 seconds idle
            // console.log('timer reset  ')

        if (message.type === 'utf8') {
            let json = JSON.parse(message.utf8Data);
            let t = new Date().getTime();
            let timestamp = new Date();
            timestamp.setTime(t)
            _Counter = _Counter + 1 // counter of all received packets
            switch (json.messageType) {
                case 'ServiceResponse':
                    sendLoginRequest()
                    break
                case 'LoginResponse':
                    setInterval(sendPeriodicRequest, 60000)
                    if (json.responseCode.name === 'success') {
                        if (locationsToPrint.length === 0) {
                            sendGetLocationsRequest() // fet all locations
                        } // not mandatory
                        else {
                            locationsToPrint.forEach(iLoc => {
                                sendGetUnitsRequest(iLoc) // get units under these location

                            });

                        }
                    } else {
                        console.log(json.responseCode.name)
                        console.log("Couldn't login, check your username and passoword")
                        connection.close()
                        process.exit()
                    }
                    break
                case 'GetLocationsResponse':
                    if (json.responseCode.name === 'success') {
                        let _templocationObj
                            // UPDATE location IDs
                        if (json.list.length !== 0) {
                            console.log(`receiving new locations ${json.list.length}`) // 收到一组新的location
                            for (let i = 0; i < json.list.length; i++) {
                                // locationObj.locationId =
                                //     json.list[i].locationAddress.locationId
                                //     // locationObj.serverDid = json.list[i].locationAddress.serverDid
                                // locationObj.accountId = json.list[i].accountId
                                // locationObj.name = json.list[i].name
                                // locationObj.gwdid = json.list[i].gwdid
                                // _templocationObj = JSON.parse(JSON.stringify(locationObj)) // deep copy
                                _Locations.set(json.list[i].locationAddress.locationId, json.list[i].name)
                                sendGetUnitsRequest(json.list[i].locationAddress.locationId) // get units under this location
                                    // }
                            }
                        }
                    } else {
                        console.log(json.responseCode.name)
                        console.log("Couldn't get location")
                        connection.close()
                        process.exit()
                    }
                    break
                case 'GetUnitsResponse':
                    if ((json.responseCode.name === 'success') && (json.list.length > 1)) {

                        // let
                        let { list: units } = json

                        let sensorMap = new Map()
                            // let assetList = new Map()

                        units.forEach(element => {
                            if (element.nameSetByUser) {
                                sensorMap.set(element.unitAddress.did, element.nameSetByUser)
                                    // nameList.set(element.chassisDid, element.unitAddress.did)
                            } else {
                                console.log(element)
                            }
                            // if (element.nameSetByUser) {
                            //     sensorList.set(element.nameSetByUser, element.chassisDid)
                            //         // nameList.set(element.chassisDid, element.unitAddress.did)
                            // }
                        });

                        // let symbols = Object.getOwnPropertySymbols(json)

                        let SortedArray = new Array(...sensorMap)
                        SortedArray.sort((a, b) => ((a[1] > b[1]) || ((a[1] == b[1]) & (a[0] > b[0]))) ? 1 : -1)

                        // console.table(...new Array(nameList).sort((a, b) => a.Key - b.Key))
                        console.log(
                                `seeing ${units.length} logical devices in  ${json.locationAddress.locationId}`)
                            // console.table(units);
                        console.table(SortedArray);

                        // let _tempunitObj
                        // for (let iList = 0; iList < units.length; iList++) {
                        //     // process each response packet while json.list[0].lifeCycleState.name==="shadow"
                        //     if (
                        //         units[iList].unitTypeFixed.name === 'gateway' ||
                        //         units[iList].unitAddress.did.indexOf('AP') !== -1
                        //     ) {
                        //         // console.log(json.list[index].unitAddress.did);
                        //         // console.log('GW or AP in ' + json.locationAddress.locationId) // GW and AP are not sensor
                        //     } else {
                        //         // record all sensors
                        //         unitObj.did = units[iList].unitAddress.did //
                        //         unitObj.locationId = json.locationAddress.locationId
                        //         if (_Locations.has(unitObj.locationId)) {
                        //             _onlineLocations.add(_Locations.get(unitObj.locationId))
                        //         }
                        //         // unitObj.chassisDid = json.list[index].chassisDid
                        //         // unitObj.productType = json.list[iList].productType
                        //         unitObj.lifeCycleState = units[iList].lifeCycleState.name
                        //         let isChassis = units[iList].isChassis
                        //         unitObj.locationName = _Locations.get(unitObj.locationId)
                        //         unitObj.nameSetByUser = units[iList].nameSetByUser
                        //             // unitObj.serverDid = json.list[index].unitAddress.serverDid

                        //         // unitObj.type = json.list[iList].unitTypeFixed.name

                        //         if (isChassis === ischasisFlag && unitObj.did.indexOf(type) >= 0) {
                        //             // console.log(unitObj.did);
                        //             // console.log(json.list[iList].nameSetByUser);

                        //             _tempunitObj = JSON.parse(JSON.stringify(unitObj))
                        //             _Units.push(_tempunitObj)
                        //             _UnitsCounter++
                        //         }
                        //         // if (json.list[iList].lifeCycleState.name === 'present') {
                        //         //     _OnlineUnitsCounter++
                        //         // }
                        //     }



                        //     // console.log(_UnitsCounter + ' Units in Location:  while ' + _OnlineUnitsCounter + ' online');
                        // }
                    }
                    // json.list[0].lifeCycleState.name
                    break
                default:
                    //   console.log('---Other message---')
                    // connection.close();
                    break
            }
        }
    })

    connection.on('error', function(error) {
        console.log('Connection Error: reconnect' + error.toString())
        start()
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
            console.log(
                "sendMessage: Couldn't send message, the connection is not open"
            )
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

function start() {
    client.connect('wss://' + cirrusAPIendpoint + '/cirrusAPI')
        // console.log("Connecting to wss://" + cirrusAPIendpoint + "/cirrusAPI using username " + username);
}

function doReport() {

    // const locationArray = Array.from(_onlineLocations)

    // // console.table(locationArray)

    // console.log(`total ${units.length} sensors configured `) // sum up

    // for (const location of locationArray) {
    //     let unitsinLocation = 0
    //     for (let index = 0; index < units.length; index++) {
    //         if (units[index].locationName === location) {
    //             unitsinLocation++

    //         }

    //     }
    //     console.log(`${location} has ${unitsinLocation} sensors`)

    // }

    // // locationsToPrint.forEach(loc => {
    // //     console.table('Assets or Sensors:')
    // //     console.table(_Units.filter((item) => item.locationId === loc))

    // // });


    process.exit()
}

start()