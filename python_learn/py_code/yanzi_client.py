# -*- coding: utf-8 -*-
# coding=utf-8
"""
@author: yunshanan
"""

import time
import json
import pprint
import websocket
# import datetime
import ssl

# The cirrus host to connect to:
cirrusHost = "cirrus20.yanzi.se"

# Change the username and password to the Yanzi credentials:
username = 'frank.shen@pinyuaninfo.com'
password = 'Ft@Sugarcube99'
locationID = "229349"
pattern = '%Y-%m-%d %H:%M:%S'
start = '2020-11-01 00:00:00'
end = '2020-11-01 23:00:00'
heartbeatFlag = 0


def onMessage(ws, message):
    response = json.loads(message)
    # print(response)

    if response["messageType"] == "ServiceResponse":
        print("onMessage: Got ServiceResponse, sending login request")
        # We got a service response, let’s try to login:
        sendLoginRequest()
    elif response["messageType"] == "LoginResponse":
        # print("onMessage: Got LoginResponse, sending get samples request")
        # We successfully logged in, let’s get the samples for the sensor unit
        # sendSubscribeRequest(locationID, datatype=['occupancy'])
        sendGetUnitsRequest(locationID)
    elif response["messageType"] == "PeriodicResponse":
        # heartbeatFlag = 0
        # print(_Counter, '# ', "periodic response-keepalive")
        sendPeriodicRequest()
    elif response["messageType"] == "SubscribeData":
        print('  Subscription     :', response)
        # print("onMessage: Got SubscribeData")
    elif response["messageType"] == "GetUnitsResponse":
        # print(response)
        unitslist = response['list']
        for unit in unitslist:
            pprint.pprint(unit['unitAddress']['did'],
                          unit['unitTypeFixed']['name'])
        # if (json.responseCode.name == 'success') {
        #                 // c(JSON.stringify(json) + '\n\n');

        #                 var _tempunitObj

        #                 c('Seeing ' + json.list.length + ' (logical or physical) sensors in  ' + json.locationAddress.locationId)
        #                 for (let index = 0; index < json.list.length; index++) { // process each response packet
        #                     if (json.list[index].unitTypeFixed.name == 'gateway' || json.list[index].unitTypeFixed.name == 'remoteGateway' || json.list[index].unitAddress.did.indexOf('AP') != -1) { // c(json.list[index].unitAddress.did);
        #                         // c('GW or AP in ' + json.locationAddress.locationId) // GW and AP are not sensor
        #                     } else {
        #                         // record all sensors
        #                         unitObj.did = json.list[index].unitAddress.did //
        #                         unitObj.locationId = json.locationAddress.locationId
        #                         unitObj.chassisDid = json.list[index].chassisDid
        #                         unitObj.productType = json.list[index].productType
        #                         unitObj.lifeCycleState = json.list[index].lifeCycleState.name
        #                         unitObj.isChassis = json.list[index].isChassis
        #                         unitObj.nameSetByUser = json.list[index].nameSetByUser
        #                         unitObj.serverDid = json.list[index].unitAddress.serverDid

        #                         unitObj.type = json.list[index].unitTypeFixed.name

        #                         _tempunitObj = JSON.parse(JSON.stringify(unitObj))
        #                             // c(unitObj.type)
        #                             // c(unitObj.lifeCycleState)
        #                             // c(unitObj.did)
        #                             // c('\n')

        #                         _Units.push(_tempunitObj)
        #                             // request history record
        #                         if (((unitObj.type === 'physicalOrChassis') && EUorUU === 'EU') || ((unitObj.type === 'inputMotion') && EUorUU === 'Motion') || ((EUorUU === 'UU') && (unitObj.did.indexOf('UU') >= 0)) || ((EUorUU === 'Temp') && (unitObj.did.indexOf('Temp') >= 0))) { sendGetSamplesRequest(unitObj.did, Date.parse(startDate), Date.parse(endDate)) } // 请求何种数据?
        #                     };
        #                 }

        #                 // c(_UnitsCounter + ' Units in Location:  while ' + _OnlineUnitsCounter + ' online');
        #             } else {
        #                 c("Couldn't get Units")
        #             }
    # elif response["messageType"] == "PeriodicResponse":
    #     print("OnError")
    elif response["messageType"] == "GetSamplesResponse":
        print("OnError")


def onError(ws, error):
    print("OnError", error)


def onClose(ws):
    print("onClose")


def onOpen(ws):
    print("onOpen: sending service request")
    sendServiceRequest()


def sendMessage(message):
    if not ws.sock.connected:
        print("sendMessage: Could not send cirrus message, socket not open")
    else:
        message['timeSent'] = int(time.time() * 1000)
        msg = json.dumps(message)
        ws.send(msg)


def sendServiceRequest():
    request = {
        "messageType": "ServiceRequest",
        "version": "1.6.4",
        "clientId": "123456"
    }
    sendMessage(request)


def sendSubscribeRequest(location_id, datatype):
    for type in datatype:
        request = {
            "messageType": "SubscribeRequest",
            "timeSent": int(time.time() * 1000),
            "unitAddress": {
                "resourceType": "UnitAddress",
                "locationId": location_id
            },
            "subscriptionType": {
                "resourceType": "SubscriptionType",
                "name": type  #
            }
        }
        sendMessage(request)
        print('      ', request)


def sendPeriodicRequest():
    request = {
        "messageType": "PeriodicRequest",
        "timeSent": int(time.time() * 1000)
    }
    if heartbeatFlag == 3:
        print('    periodic request missed (%s), will reconnect',
              heartbeatFlag)
    else:
        print(' ---  periodic request send ' + heartbeatFlag)
        heartbeatFlag += 1

    sendMessage(request)


def sendGetUnitsRequest(locationID):
    request = {
        "messageType": 'GetUnitsRequest',
        "timeSent": int(time.time() * 1000),
        "locationAddress": {
            "resourceType": 'LocationAddress',
            "locationId": locationID
        }
    }
    print('sending getunits request for ' + locationID)
    sendMessage(request)


def sendLoginRequest():
    request = {
        "messageType": "LoginRequest",
        "username": username,
        "password": password
    }
    sendMessage(request)


def sendGetSamplesRequest(UnitDid, LocationId, start, end):
    # Create sample request to request the last 24 hour samples
    request = {
        "messageType": "GetSamplesRequest",
        "dataSourceAddress": {
            "resourceType": "DataSourceAddress",
            "did": UnitDid,
            "locationId": LocationId
        },
        "timeSerieSelection": {
            "resourceType": "TimeSerieSelection",
            #"numberOfSamplesBeforeStart": 3,
            "timeStart": int(
                (time.mktime(time.strptime(start, pattern))) * 1000),
            # "timeStart" : int((time.time() - (60 * 3600)) * 1000), # 24 hours
            "timeEnd": int((time.mktime(time.strptime(end, pattern))) * 1000),
            # "timeEnd" : int((time.time() - (0 * 3600)) * 1000)
        }
    }

    sendMessage(request)


if __name__ == "__main__":
    print("Connecting to ", cirrusHost, "with user ", username)
    ws = websocket.WebSocketApp("wss://" + cirrusHost + "/cirrusAPI",
                                on_message=onMessage,
                                on_error=onError,
                                on_close=onClose,
                                on_open=onOpen,
                                keep_running=True)
    # ws.on_open = onOpen

    ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})
