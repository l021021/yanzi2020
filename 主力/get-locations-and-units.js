// 列出所有的Location已经其下的传感器;可能需要几分钟才能收全

const WebSocketClient = require('websocket').client
const cirrusAPIendpoint = 'cirrus20.yanzi.se'

// var username = 'frank.shen@pinyuaninfo.com'
// var password = 'Ft@Sugarcube99'
// var username = "653498331@qq.com";
// var password = "000000";
const username = 'de1999@vip.qq.com'
const password = '23456789'

// ################################################

// For log use only
let _Counter = 0 // message counter
let _OnlineUnitsCounter = 0
var _UnitsCounter = 0

const _Locations = new Set()
const _Units = []
let TimeoutId = setTimeout(doReport, 20000) // wait for 1 min before exit
// Create a web socket client initialized with the options as above
const client = new WebSocketClient()

// All Objs definition
const locationObj = {
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

const unitObj = {
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
client.on('connectFailed', function (error) {
  console.log('Connect Error: reconnect' + error.toString())
  beginPOLL()
})

client.on('connect', function (connection) {
  // console.log("Checking API service status with ServiceRequest.");
  sendServiceRequest()

  // Handle messages
  connection.on('message', function (message) {
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
          setInterval(sendPeriodicRequest, 60000)
          if (json.responseCode.name === 'success') {
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
          if (json.responseCode.name === 'success') {
            let _templocationObj
            // UPDATE location IDs
            if (json.list.length !== 0) {
              console.log(`receiving new locations ${json.list.length}`) // 收到一组新的location
              for (let i = 0; i < json.list.length; i++) {
                // let _locationExist = false

                // for (const key in _Locations) { // already exits in Array?
                //     if (_Locations[key].locationID || (_Locations[key].locationID == json.list[i].locationAddress.locationId)) {
                //         _locationExist = true
                //     }
                // }

                // if (!_locationExist) {
                locationObj.locationId =
                  json.list[i].locationAddress.locationId
                locationObj.serverDid = json.list[i].locationAddress.serverDid
                locationObj.accountId = json.list[i].accountId
                locationObj.name = json.list[i].name
                locationObj.gwdid = json.list[i].gwdid
                _templocationObj = JSON.parse(JSON.stringify(locationObj)) // deep copy
                _Locations.add(_templocationObj)
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
          // sendGetUnitsRequest(537931);
          break
        // json.list[0].lifeCycleState.namejson.list[0].lifeCycleState.name
        case 'GetUnitsResponse':
          if (json.responseCode.name === 'success') {
            // console.log(JSON.stringify(json) + '\n\n');

            var _tempunitObj

            console.log(
              `seeing ${json.list.length} devices in  ${json.locationAddress.locationId}`
            )
            for (let index = 0; index < json.list.length; index++) {
              // process each response packet
              if (
                json.list[index].unitTypeFixed.name === 'gateway' ||
                json.list[index].unitAddress.did.indexOf('AP') !== -1
              ) {
                // console.log(json.list[index].unitAddress.did);
                // console.log('GW or AP in ' + json.locationAddress.locationId) // GW and AP are not sensor
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
                // console.log(_UnitsCounter + '# ' + JSON.stringify(_tempunitObj))
                if (json.list[index].lifeCycleState.name === 'present') {
                  _OnlineUnitsCounter++
                }
              }
            }

            // console.log(_UnitsCounter + ' Units in Location:  while ' + _OnlineUnitsCounter + ' online');
          } else {
            console.log("Couldn't get Units")
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

  connection.on('error', function (error) {
    console.log('Connection Error: reconnect' + error.toString())
    beginPOLL()
  })

  connection.on('close', function () {
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
  // _Locations.sort(function(a, b) {
  //     var x = a.gwOnline
  //     var y = b.gwOnline
  //     if (x > y) return 1
  //     if (x < y) return -1
  //     return 0
  // })
  // _Units.sort(function(a, b) {
  //     var x = a.locationId
  //     var y = b.locationId
  //     if (x > y) return 1
  //     if (x < y) return -1
  //     return 0
  // })

  const locationArray = Array.from(_Locations)
  for (let i = 0; i < _Units.length; i++) {
    // for (let j = 0; j < _Locations.length; j++) {
      // update to its locations

      const index = locationArray.indexOf(_Units[i].locationId)
      if (index > 0) { // 更新_locations
        // Location match
          locationArray[index].Allunits++

        if (_Units[i].lifeCycleState === 'present') {
          // mark live gateways
          locationArray[index].gwOnline = true // Location Online
          locationArray[index].Onlineunits++ // mark online sensors
        }
        if (_Units[i].isChassis === 'true') {
          locationArray[j].units++
        } // mark physical sensors
      }
  }

  // list each active location with sensors

  // _Locations = _Locations.filter(item => item.lifeCycleState == "present")

  console.table(locationArray.filter((item) => item.gwOnline === true))
  // _Locations[0].gwOnline
  console.log(
    'total ' +
      _Units.length +
      ' logical sensors live while ' +
      _OnlineUnitsCounter +
      ' sensors online'
  ) // sum up

  // _Units = _Units.filter(item => item.lifeCycleState == "present") //_Units[0].lifeCycleState
  console.table(_Units.filter((item) => item.lifeCycleState === 'present'))

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

beginPOLL()
