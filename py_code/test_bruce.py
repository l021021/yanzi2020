# -*- coding: utf-8 -*-
# coding=utf-8

import time
import json
import pickle
# import websocket
# import datetime
# # import pymysql as MySQLdb
# import ssl
# import sys
# import re
# # from random import randint
# # import pandas as pd
# # import sqlite3

# 修改json文件路径
# 正确格式的处理方式
with open('C:\\codebase\\yanzi2020\\py_code\\sugar-v5-2.json', 'r') as rawdata:
    data = rawdata.readline().strip(' ').replace(' ', '')
print(data)
data1 = json.JSONDecoder().decode(str(data))
# print(rawdata)
# if isinstance(rawdata, str):
#     rawdata1 = json.loads(rawdata)
# print(rawdata)
# f.close()

# 修改json文件路径
# 若json文件没按要求处理好，则用此处运行
# json_filename = ('C:\\codebase\\yanzi2020\\py_code\\sugar-v5-2.json')

# rawdata = json.loads(open(json_filename))
# jsDumps = json.dumps(rawdata)
# jsonloads = json.loads(jsDumps)


def print_list(parameter_list):
    for each_item in parameter_list:
        if isinstance(each_item, list) or isinstance(each_item, dict):
            print_list(each_item)
        else:
            print(each_item)
            print(type(each_item))


print_list(data1)

# for d1 in rawdata:
#     print(type(d1))
#     if isinstance(d1, list):
#         for d2 in d1:
#             print(type(d2))
#             if isinstance(d2, list):
#                 for d3 in d2:
#                     if isinstance(d3, list):
#                         for d4 in d3:
#                             if isinstance(d4, list):
#                                 for d5 in d4:
#                                     print(d5)
#                             else:
#                                 print(d4)
#                     else:
#                         print(d3)
#             else:
#                 print(d2)
#     else:
#         print(d1)
