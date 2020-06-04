# -*- coding: utf-8 -*-
# coding=utf-8

import time
import json
import websocket
import datetime
# import pymysql as MySQLdb
import ssl
import sys
import re
from random import randint
import pandas as pd
# import sqlite3
# from sqlalchemy import create_engine
import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr
import logging
import csv
global tag


# 修改json文件路径
# 正确格式的处理方式
# with open('C:\\Users\Andyn\Desktop\996052_2020_04_26_00_00_00_2020_04_27_14_0_00_Motion.json', encoding='utf-8') as f:
#     rawdata = json.load(f)
#     print(len(rawdata))
#     f.close()

# 修改json文件路径
# 若json文件没按要求处理好，则用此处运行
with open('C:\\codebase\\log\\274189_2020_05_09_19_00_00_2020_05_09_21_00_00_Motion.json', encoding='utf-8') as f:
    rawdata = f.readlines()[0]
    # print('1=====================>',type(rawdata))
    # print(rawdata)
    rawdata = rawdata.replace(']', '],')
    rawdata = '[' + rawdata
    rawdata = rawdata[:-1] + ']'
    rawdata = json.loads(rawdata)
    # print(type(rawdata))
    f.close()

# print(rawdata)

motionvalues = {}
result = {}


# 修改开始时间
STARTTIME = '2020-05-09 19:00:00'
start = int(time.mktime(time.strptime(STARTTIME, '%Y-%m-%d %H:%M:%S'))) * 1000

for persensorrecord in rawdata:
    for motionrecord in persensorrecord:
        grid = (motionrecord['sampleTime'] - start) // 600000  # 十分钟偏差
        if motionrecord['DID'] not in motionvalues.keys():
            motionvalues[motionrecord['DID']] = {}  # 建立二维数组
            result[motionrecord['DID']] = {}
            motionvalues[motionrecord['DID']][grid] = [motionrecord['value']]
        else:
            if grid not in motionvalues[motionrecord['DID']].keys():
                motionvalues[motionrecord['DID']][grid] = [
                    motionrecord['value']]
            else:
                motionvalues[motionrecord['DID']][grid].append(
                    motionrecord['value'])


tag = 'free'
lastvalue = None

for uid in motionvalues.keys():
    for gap in motionvalues[uid].keys():
        count = 0
        for motionvalue in motionvalues[uid][gap]:
            if lastvalue == None:
                lastvalue = motionvalue
            elif lastvalue != motionvalue:
                if tag == 'free':
                    tag = 'occupied'
                    lastvalue = motionvalue
                else:
                    lastvalue = motionvalue
            else:
                if tag == 'occupied':
                    tag = 'free'
                    count += 1
        result[uid][gap] = count

for i in result.keys():
    temp = list(result[i].values())
    print(temp)
