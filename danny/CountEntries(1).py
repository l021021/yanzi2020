# -*- coding: utf-8 -*-
#coding=utf-8

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

dic = {}
res = {}


# 修改开始时间
STARTTIME = '2020-04-20 00:00:00'
start = int(time.mktime(time.strptime(STARTTIME,'%Y-%m-%d %H:%M:%S'))) * 1000

for subdata in rawdata:
    for ele in subdata:
        remainder = (ele['sampleTime'] - start) // 600000 # 十分钟偏差
        if ele['DID'] not in dic.keys():
            dic[ele['DID']] = {} #建立二维数组
            res[ele['DID']] = {}
            dic[ele['DID']][remainder] = [ele['value']]
        else:
            if remainder not in dic[ele['DID']].keys():
                dic[ele['DID']][remainder] = [ele['value']]
            else:
                dic[ele['DID']][remainder].append(ele['value'])


tag = 'free'
last = None

for uid in dic.keys():
    for gap in dic[uid].keys():
        count = 0
        for item in dic[uid][gap]:
            if last == None:
                last = item
            elif last != item:
                if tag == 'free':
                    tag = 'occupied'
                    last = item
                else:
                    last = item
            else:
                if tag == 'occupied':
                    tag = 'free'
                    count += 1
        res[uid][gap] = count

for i in res.keys():
    temp = set(res[i].values())
    print(temp)