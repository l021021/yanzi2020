/* eslint-disable no-redeclare */
/* eslint-disable eol-last */
/* eslint-disable camelcase */
/* eslint-disable no-fallthrough */
/* eslint-disable eqeqeq */
// 列出所有的Location已经其下的传感器;可能需要几分钟才能收全
var WebSocketClient = require('websocket').client
const fs = require('fs')

var username = 'frank.shen@pinyuaninfo.com'
var password = 'Internetofthing'
const locationIds = []
const window_limit = 3
const reportPeriod = 3600000 * 8 * 3
// const _24Hour = 86400000
const startDate = '2019/12/31/00:00:00'
const endDate = '2020/01/01/09:59:59'
var TimeoutId = setTimeout(doReport, 300000)

for (let lc = 0; lc < locationIds.length; lc++) { }
const dataFile = fs.createWriteStream('../log/' + locationId + '_' + startDate.replace(/[/:]/gi, '_') + '_' + endDate.replace(/[/:]/gi, '_') + '.json', { encoding: 'utf8' })

dataFile.on('finish',
    function () { process.exit() })
dataFile.on('destroy',
    function () { process.exit() })
// For log use only
var _Counter = 0 // message counter
var _requestCount = 0
var _responseCount = 0
var _windowSize = 0
var _listCount = 0
var _Units = []

var cirrusAPIendpoint = 'cirrus11.yanzi.se'
var messageQueue = new Queue()

var client = new WebSocketClient()

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
var c = console.log
function Queue() {
    this.dataStore = []
    this.enqueue = enqueue
    this.dequeue = dequeue
    this.front = head
    this.back = tail
    this.toString = toString
    this.empty = empty
    this.length = this.dataStore.length
}
function enqueue(element) {
    this.dataStore.push(element)
}
function dequeue() {
    return this.dataStore.shift()
}
function head() {
    return this.dataStore[0]
}
function tail() {
    return this.dataStore[this.dataStore.length - 1]
}
function toString() {
    var retStr = ''
    for (var i = 0; i < this.dataStore.length; ++i) {
        retStr += this.dataStore[i] + '\n'
    }
    return retStr
}
function empty() {
    if (this.dataStore.length == 0) {
        return true
    } else {
        return false
    }
}

// Program body
client.on('connectFailed', function (error) {
    c('Connect Error: reconnect' + error.toString())
    start()
})

client.on('connect', function (connection) {
    // c("Checking API service status with ServiceRequest.");
    sendServiceRequest()

    // Handle messages
    connection.on('message', function (message) {
        clearTimeout(TimeoutId)
        // TimeoutId = setTimeout(doReport, 50000) // exit after 10 seconds idle
        // c('timer reset  ')

        if (message.type === 'utf8') {
            var json = JSON.parse(message.utf8Data)
            var t = new Date().getTime()
            var timestamp = new Date()
            timestamp.setTime(t)
            _Counter = _Counter + 1 // counter of all received packets

            // Print all messages with type
            // c(_Counter + '# ' + timestamp.toLocaleTimeString() + ' RCVD_MSG:' + json.messageType)
            switch (json.messageType) {
                case 'ServiceResponse':
                    sendLoginRequest()
                    break
                case 'LoginResponse':
                    if (json.responseCode.name == 'success') {
                        // sendPeriodicRequest() // as keepalive
                        // sendGetLocationsRequest() // not mandatory
                        sendGetUnitsRequest(locationId) // get units from location
                        // sendSubscribeRequest(LocationId); //test one location
                        // sendSubscribeRequest_lifecircle(LocationId); //eventDTO
                    } else {
                        c(json.responseCode.name)
                        c("Couldn't login, check your username and passoword")
                        connection.close()
                        process.exit()
                    }
                    break
                case 'GetLocationsResponse':

                    break
                case 'GetSamplesResponse':
                    if (json.responseCode.name === 'success' && json.sampleListDto.list) {
                        c('receiving ' + json.sampleListDto.list.length + ' lists for ' + json.sampleListDto.dataSourceAddress.did + ' # ' + ++_responseCount)
                        _listCount += json.sampleListDto.list.length
                        dataFile.write(JSON.stringify(json.sampleListDto.list).replace(/resourceType/g, 'DID').replace(/SampleMotion/g, json.sampleListDto.dataSourceAddress.did).replace(/SampleAsset/g, json.sampleListDto.dataSourceAddress.did))
                    } else {
                        c('empty list # ' + ++_responseCount)
                    }

                    sendMessagetoQue()// 保持消息队列,收一发一
                    if (_requestCount === _responseCount) { doReport() }
                    break
                case 'GetUnitsResponse':
                    if (json.responseCode.name == 'success') {
                        // c(JSON.stringify(json) + '\n\n');

                        var _tempunitObj

                        c('seeing ' + json.list.length + ' sensors in  ' + json.locationAddress.locationId)
                        for (let index = 0; index < json.list.length; index++) { // process each response packet
                            if (json.list[index].unitTypeFixed.name == 'gateway' || json.list[index].unitAddress.did.indexOf('AP') != -1) { // c(json.list[index].unitAddress.did);
                                // c('GW or AP in ' + json.locationAddress.locationId) // GW and AP are not sensor
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
                                // request history record
                                // if (unitObj.type === 'inputMotion' || unitObj.did.indexOf('UUID') >= 0) { sendGetSamplesRequest(unitObj.did, Date.parse(startDate), Date.parse(endDate)) }
                                if (unitObj.did.indexOf('UUID') >= 0) { sendGetSamplesRequest(unitObj.did, Date.parse(startDate), Date.parse(endDate)) }
                            };
                        }

                        // c(_UnitsCounter + ' Units in Location:  while ' + _OnlineUnitsCounter + ' online');
                    } else {
                        c("Couldn't get Units")
                    }

                    break
                case 'PeriodicResponse':
                    // setTimeout(sendPeriodicRequest, 60000)
                    // c(_Counter + '# ' + "periodic response-keepalive");
                    break
                case 'SubscribeResponse':

                case 'SubscribeData':

                default:
                    c('!!!! cannot understand')
                    // connection.close();
                    break
            }
        }
    })

    connection.on('error', function (error) {
        c('Connection Error: reconnect' + error.toString())
        start()
    })

    connection.on('close', function () {
        c('Connection closed!')
    })

    function sendGetSamplesRequest(deviceID, timeStart_mili, timeEnd_mili) {
        if (timeStart_mili > timeEnd_mili) {
            c('Wrong Date.')
            return null
        }
        if (timeEnd_mili - timeStart_mili >= reportPeriod) {
            var request = {
                messageType: 'GetSamplesRequest',
                dataSourceAddress: {
                    resourceType: 'DataSourceAddress',
                    did: deviceID,
                    locationId: locationId
                },
                timeSerieSelection: {
                    resourceType: 'TimeSerieSelection',
                    timeStart: timeStart_mili,
                    timeEnd: timeStart_mili + reportPeriod
                }
            }
            // push message in que
            c('  request : ' + request.dataSourceAddress.did + ' ' + request.timeSerieSelection.timeStart + ' #:' + ++_requestCount)
            sendMessagetoQue(request)
            sendGetSamplesRequest( // 递归
                deviceID,
                timeStart_mili + reportPeriod,
                timeEnd_mili
            )
        } else {
            var request = {
                messageType: 'GetSamplesRequest',
                dataSourceAddress: {
                    resourceType: 'DataSourceAddress',
                    did: deviceID,
                    locationId: locationId
                },
                timeSerieSelection: {
                    resourceType: 'TimeSerieSelection',
                    timeStart: timeStart_mili,
                    timeEnd: timeEnd_mili
                }
            }
            c('  request : ' + request.dataSourceAddress.did + ' ' + request.timeSerieSelection.timeStart + ' #:' + ++_requestCount)
            sendMessagetoQue(request)
        }
    }

    function sendMessagetoQue(mes) {
        // 空的mes,马上从队列发-由接收报文触发
        // 非空mes,windowsize<20,马上从队列发,-发前20个
        // 非空mes,windowSize>=20,不发,打入队列
        // 也即是说,服务器最多积压20个请求

        if (mes === undefined && messageQueue.dataStore.length > 0) {
            sendMessage(messageQueue.dequeue())
            // c('sending to queue . leaving ' + messageQueue.dataStore.length)
            c('    sending request from queue, still ' + messageQueue.dataStore.length + ' left.')
        } else if (mes !== undefined && _windowSize < window_limit) {
            messageQueue.enqueue(mes)
            _windowSize++
            sendMessage(messageQueue.dequeue())
            c('    sending request from queue, still ' + messageQueue.dataStore.length + ' left.')
            // c('sending to queue . leaving  ' + messageQueue.dataStore.length)
        } else if (mes !== undefined && _windowSize >= window_limit) {
            messageQueue.enqueue(mes)
            c('    sending request to queue, still ' + messageQueue.dataStore.length + ' left.')
        }
    }

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
        c('sending request for ' + locationID)
        sendMessage(request)
    }
})

function start() {
    client.connect('wss://' + cirrusAPIendpoint + '/cirrusAPI')
    c('Connecting to wss://' + cirrusAPIendpoint + '/cirrusAPI using username ' + username)
}

function doReport() {
    if (_requestCount > _responseCount) {
        c('Failed')
        dataFile.destroy()
        // process.exit()
    }
    var t = new Date().getTime()
    var timestamp = new Date()
    timestamp.setTime(t)
    dataFile.end()
    c('Reporting：send ' + _requestCount + ' recvd ' + _responseCount + ', covering ' + _listCount + ' lists')
    c(timestamp.toLocaleTimeString() + '')

    // process.exit()
}

start()