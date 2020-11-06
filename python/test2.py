#!/usr/bin/env python
# coding: utf-8

# In[1]:

import pandas as pd
import time
import csv

# In[2]:

data = pd.read_csv(r'C:\codebase\yanzi2020\python\space0.csv',
                   dtype={
                       'Elapsed': 'Int64'
                   }).values.tolist()

# ID	            Elapsed	   TimeStamp	 Event
# D0CF5EFFFE59F26C	1.58894E+12	2020/5/8 19:00	ot
#

# In[3]:

rawdata = {}
mid_res = {}
occ_res = {}

# In[4]:

STARTTIME = '2020-05-08 19:00:00'
start = int(time.mktime(time.strptime(STARTTIME, '%Y-%m-%d %H:%M:%S'))) * 1000
TIMESTEP = 1800000

# In[5]:

for ele in data:
    remainder = (ele[1] - start) // TIMESTEP  #这个是时间间隔的整数序数
    #     print(remainder)
    #建立各个传感器的空矩阵
    if ele[0] not in rawdata.keys():
        rawdata[ele[0]] = {}
        mid_res[ele[0]] = {}
        occ_res[ele[0]] = {}
        rawdata[ele[0]][remainder] = [[ele[1]], [ele[3]]]  #写入事件
    else:
        if remainder not in rawdata[ele[0]].keys():  #传感器已存在,序数不存在,补充该序数上的数值
            rawdata[ele[0]][remainder] = [[ele[1]], [ele[3]]]  #写入事件
        else:
            rawdata[ele[0]][remainder][0].append(
                ele[1])  #传感器已存在,序数已存在,补充该序数上的数值
            rawdata[ele[0]][remainder][1].append(ele[3])  # 事件

# '''
# rawdata =
# {
#     'did-1':{
#         t1:[[T1,T2,T3,T4...],[c1,c2,c3,c4...]],  # t1 是格子 T1 是时间戳 c1 是事件
#         t2:[[T1,T2,T3,T4...],[c1,c2,c3,c4...]],
#         ...
#         ...
#         tn:[[T1,T2,T3,T4...],[c1,c2,c3,c4...]]
#     },
#     'did-2':{
#         t1:[[T1,T2,T3,T4...],[c1,c2,c3,c4...]],
#         t2:[[T1,T2,T3,T4...],[c1,c2,c3,c4...]],
#         ...
#         ...
#         tn:[[T1,T2,T3,T4...],[c1,c2,c3,c4...]]
#     },
#     ...
#     ...
#     ...
#     'did-n':{
#         t1:[[T1,T2,T3,T4...],[c1,c2,c3,c4...]],
#         t2:[[T1,T2,T3,T4...],[c1,c2,c3,c4...]],
#         ...
#         ...
#         tn:[[T1,T2,T3,T4...],[c1,c2,c3,c4...]]
#     }
# }
# '''

# In[7]:

for uid in rawdata.keys():  # 传感器循环
    tag = 'free'
    last = None
    for gap in rawdata[uid].keys():  #就是remainder--- 序数循环
        # 一个用来记录时间，一个用来记录状态变化
        timelist = []
        datalist = []
        for i in range(len(rawdata[uid][gap][1])):  #一个格子内事件循环
            if last == None:  #
                last = rawdata[uid][gap][1][i]  #如果没有状态,则取当前事件为状态
            elif last != rawdata[uid][gap][1][i]:  #状态发生了变化
                # 当从free变为occupied时，记录状态和对应的时间
                if tag == 'free':  #从free 到 occupy
                    tag = 'occupied'
                    last = rawdata[uid][gap][1][i]  #更新当前状态
                    timelist.append(rawdata[uid][gap][0][i])  #增加时间戳
                    datalist.append('occupied')
                else:
                    last = rawdata[uid][gap][1][i]
            else:  #状态没有变化,延迟最后一个事件的时间
                timelist.pop()
                datalist.pop()
                timelist.append(rawdata[uid][gap][0][i])
                datalist.append('free')
        if (len(datalist)) == 0:  #如果没有发生时间,则标记
            timelist.append(tag)
        mid_res[uid][gap] = [timelist, datalist]
# print("res===========>",res)

# '''
# mid_res =
# {
#     'did-1':{
#         t1:[[T1,T2,T3,T4...],[free,occupied,free,occupied...]],  ===>正常格式
#         t2:[[occupied],[]],                                      ===>若整个十分钟内状态无变化，则状态list为空，时间list内为当前时段内的状态，此处表示这10分钟一直处于occupied状态
#         ...
#         ...
#         tn:[[T1],[free]]                                         ===>10分钟内只有一次状态变化
#     },
#     'did-2':{
#         t1:[[T1,T2,T3,T4...],[free,occupied,free,occupied...]],
#         t2:[[T1,T2,T3,T4...],[free,occupied,free,occupied...]],
#         ...
#         ...
#         tn:[[T1,T2,T3,T4...],[free,occupied,free,occupied...]]
#     },
#     ...
#     ...
#     ...
#     'did-n':{
#         t1:[[T1,T2,T3,T4...],[free,occupied,free,occupied...]],
#         t2:[[T1,T2,T3,T4...],[free,occupied,free,occupied...]],
#         ...
#         ...
#         tn:[[T1,T2,T3,T4...],[free,occupied,free,occupied...]]
#     }
# }
# '''

# In[ ]:

for uid in mid_res.keys():
    for gap in mid_res[uid].keys():  # 格子循环
        occupied_time = 0.0
        first_record = ''
        last_record = ''
        util = 0.0
        begin = start + gap * TIMESTEP
        end = start + (gap + 1) * TIMESTEP

        # 如果当前数据list长度为0，则代表10分钟内状态没变，直接根据状态名称获取0或100的占用值
        if len(mid_res[uid][gap][1]) == 0:
            if mid_res[uid][gap][0] == 'free':
                util = format(0.0 * 100.0, '.3f')
            elif mid_res[uid][gap][0] == 'occupied':
                util = format(1.0 * 100.0, '.3f')

        # 如果当前数据list长度为1，则代表10分钟内状态只变化过1次。若状态变化为占用，则选取变化后的时间计算。若状态变化为空闲，则选取变化前的时间进行计算。
        elif len(mid_res[uid][gap][1]) == 1:
            first_gap = mid_res[uid][gap][0][0] - begin
            last_gap = end - mid_res[uid][gap][0][0]

            if mid_res[uid][gap][1][0] == 'occupied':
                util = format(last_gap / TIMESTEP * 100.0, '.3f')
            elif mid_res[uid][gap][1][0] == 'free':
                util = format(first_gap / TIMESTEP * 100.0, '.3f')

        # 若数据长度超过1，则先选取开始到第一个数据和最后一个数据到结尾的时间。
        # 然后根据第一个以及最后一个状态决定是否删除开头及结尾的状态。
        # 处理完成后，剩下的依次计算占用时间
        # 最后根据原本开头和结尾的状态决定占用时间需不需要加上最开始选取的开头/结尾时间
        else:
            first_gap = mid_res[uid][gap][0][0] - begin
            last_gap = end - mid_res[uid][gap][0][-1]

            if mid_res[uid][gap][1][0] == 'free':
                first_record = 'free'
                del mid_res[uid][gap][0][0], mid_res[uid][gap][1][0]

            if mid_res[uid][gap][1][-1] == 'occupied':
                last_record = 'occupied'
                del mid_res[uid][gap][0][-1], mid_res[uid][gap][1][-1]

            indexList = [
                i for i in range(len(mid_res[uid][gap][1]))
                if mid_res[uid][gap][1][i] == 'occupied'
            ]

            for j in indexList:
                occupied_time += (
                    (mid_res[uid][gap][0][j + 1] - mid_res[uid][gap][0][j]) *
                    1.0)

            if first_record:
                occupied_time += first_gap

            if last_record:
                occupied_time += last_gap

            util = format(occupied_time / TIMESTEP * 100, '.3f')

        occ_res[uid][gap] = util

# In[ ]:

with open("result.csv", 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    for did in occ_res.keys():
        for gap in occ_res[did].keys():
            epoch_time = (int(gap) * TIMESTEP + start) / 1000.0
            recordTime = time.strftime("%Y-%m-%d %H:%M:%S",
                                       time.localtime(epoch_time))
            util = occ_res[did][gap]
            writer.writerow([did, recordTime, util])
    f.close()

# In[ ]:
