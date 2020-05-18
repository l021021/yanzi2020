/* 数据转换通用模块*/

const FS = require('fs')

var filename = 'C:\\codebase\\log\\4U_2019_12_31_00_00_00_2020_01_01_09_59_59' // 历史记录文件
const startDate = '2019/12/31/00:00:00' // 开始时间
const endDate = '2020/01/01/09:59:59' // 结束时间
var interval = 30 // 间隔时间(分)
const c = console.log

var records2D = [] //以DID为组织的二维数组
var originalRecords = [] //原始记录数组
var unitsSet = new Set() //临时set
var unitsArray = [] //传感器ID数组
var t1s = new Date()
var t2s = new Date()
var t1m = new Date()
var t2m = new Date()

var t0 = new Date()
var timeArray = []
var recordObj = {
    // type: '',
    Did: '',
    timeStamp: '',
    value: ''
}
var _temprecObj = {
    ID: '',
    timeStamp: '',
    value: ''
}
var recordsofSensor = []

// var minDiff
var t1ToNextinterval, prevInterval2t2, intervalDiff

var _lastValue = -1

var str = FS.readFileSync(filename + '.json', { encoding: 'utf8' })
const CSVFile = FS.createWriteStream(filename + '_' + interval + 'M.csv', { encoding: 'utf8' })

// 读取文件发生错误事件
CSVFile.on('error', (err) => {
    console.log('发生异常:', err)
})

CSVFile.on('open', (fd) => {
    console.log('文件已打开:', fd)
})

CSVFile.on('finish', () => {
    console.log('写入已完成..')
})

CSVFile.on('close', () => {
    console.log('文件已关闭！')
})

str = str.replace(/\]\[/gi, ',') // change ][ to , which was caused by consecutive packets

originalRecords = JSON.parse(str) // 从文件读入的原始记录总表
c(' --- 总motion记录数' + originalRecords.length)

// 从原始数据计算出一个sensor set

for (let i1 = 0; i1 < originalRecords.length; i1++) {
    unitsSet.add(originalRecords[i1].DID)
}

unitsSet.forEach(element => {
        records2D[element] = []

    })
    // for (let i1 = 0; i1 < originalRecords.length; i1++) {
    //     if (unitsArray.indexOf(originalRecords[i1].DID) < 0) {
    //         unitsArray.push(originalRecords[i1].DID)
    //         json[originalRecords[i1].DID] = [] // json:计算报告数组, 建立二维数组框架,准备存入报告数据
    //         c(originalRecords[i1].DID)
    //     }
    // }

c(' --- 总的传感器数: ' + unitsSet.size)

// 将不同传感器的数据分开放入数组

CSVFile.write('ID,Time,Pct\n') // CSV文件头
for (let iDID = 0; iDID < originalRecords.length; iDID++) {
    records2D[originalRecords[iDID].DID].push(JSON.parse(JSON.stringify(originalRecords[iDID])))
}

// 计算循环 写入 motionTimeStamps 数组
unitsArray = Array.from(unitsSet)

for (let i1 = 0; i1 < unitsArray.length; i1++) { // 对每一个sensor做循环 i1:传感器ID循环
    c(' --- computing sensor ' + unitsArray[i1])


    var temprecordObj

    c(' --- Sorting sensor array ')

    records2D[unitsArray[i1]].sort(function(a, b) { // 先按照时间排序
        if (a.sampleTime > b.sampleTime) {
            return 1
        } else {
            return -1
        };
    })

    c(' --- Finished sorting sensor array ')

    recordsofSensor.length = 0 // 清零
    recordObj.Did = unitsArray[i1]

    // 从motion value/free/occupy 变换到 in-ot 记录

    if (records2D[unitsArray[i1]][0].DID.indexOf('UU') >= 0) { // asset记录
        c(' ---  calculating io-ot records: ' + records2D[unitsArray[i1]].length + ' lists')

        // boundary:日期起始边界先视为FREE

        recordObj.timeStamp = Date.parse(startDate)
        recordObj.value = 'ot'
        temprecordObj = JSON.parse(JSON.stringify(recordObj))
        recordsofSensor.push(temprecordObj)

        // 主体

        for (let iRec = 0; iRec < records2D[unitsArray[i1]].length; iRec++) { // irec:单个传感器的记录内循环
            recordObj.timeStamp = records2D[unitsArray[i1]][iRec].sampleTime
            if (records2D[unitsArray[i1]][iRec].assetState.name === 'occupied') {
                recordObj.value = 'in'
            } else if (records2D[unitsArray[i1]][iRec].assetState.name === 'free') {
                recordObj.value = 'ot'
            } else { // 包含 missinput等.处理异常
                recordObj.value = 'ms'
                recordObj.timeStamp = (iRec === 0) ? (Date.parse(startDate) + 10000) : (records2D[unitsArray[i1]][iRec - 1].sampleTime + 10000) // 在前一个记录后,增加一个十秒后的掉线数据

                c(' --- Miss Input  ' + recordObj.Did + ' ' + recordObj.timeStamp)
            };
            temprecordObj = JSON.parse(JSON.stringify(recordObj))
            recordsofSensor.push(temprecordObj)
        }

        // add boundary record - always as the last one

        recordObj.timeStamp = Date.parse(endDate)
            // recordObj.value 取原值
        temprecordObj = JSON.parse(JSON.stringify(recordObj))
        recordsofSensor.push(temprecordObj)
    } else if (records2D[unitsArray[i1]][0].DID.indexOf('EU') >= 0) { // samplemotio 记录
        c('  calculating in-ot 记录' + records2D[unitsArray[i1]].length + ' lists')

        // boundary:日期边界视为空
        recordObj.timeStamp = records2D[unitsArray[i1]][0].sampleTime // 第一个 samplemotion记录,无法判断,先设为ot
        recordObj.value = 'ot'
        temprecordObj = JSON.parse(JSON.stringify(recordObj))
        recordsofSensor.push(temprecordObj)

        // 主体

        for (let iRec = 1; iRec < records2D[unitsArray[i1]].length; iRec++) { // from second records and so on
            _lastValue = records2D[unitsArray[i1]][iRec - 1].value // update previous value

            recordObj.timeStamp = records2D[unitsArray[i1]][iRec].sampleTime
            if (((records2D[unitsArray[i1]][iRec].sampleTime - records2D[unitsArray[i1]][iRec - 1].sampleTime)) < 1000 * 300) { // dehole,因为时间差大于5分钟,不可靠
                if (_lastValue !== records2D[unitsArray[i1]][iRec].value) { // Value changed!
                    recordObj.value = 'in'
                    temprecordObj = JSON.parse(JSON.stringify(recordObj))
                    recordsofSensor.push(temprecordObj)
                } else if (_lastValue === records2D[unitsArray[i1]][iRec].value) { // Value unchanged!
                    recordObj.value = 'ot'
                    temprecordObj = JSON.parse(JSON.stringify(recordObj))
                    recordsofSensor.push(temprecordObj)
                } else { // do not write to recordarray
                    c('        Sensor first seen, cannot tell')
                };
            } else { //空缺数据处理
                recordObj.value = 'ms' //
                recordObj.timeStamp = records2D[unitsArray[i1]][iRec - 1].sampleTime + 10000 // 增加一个十秒后的掉线数据
                temprecordObj = JSON.parse(JSON.stringify(recordObj))
                recordsofSensor.push(temprecordObj)
                c(' -- Miss Input    ' + recordObj.Did + ' ' + recordObj.timeStamp)
            }
        }
    }

    c('  --- Coputing motion records for this DID (BOUNDARY ADDED) : ' + recordsofSensor.length)

    // for (let j = 0; j < motionTimeStamps.length; j++) { //打印原始记录
    //     t1.setTime(motionTimeStamps[j].timeStamp)
    //     // c(motionTimeStamps[j].value + '  ' + t1.toLocaleString())
    // }

    timeArray.length = 0 // 目标矩阵清零

    for (let iRec = 1; iRec < recordsofSensor.length; iRec++) { // start from second record
        t1s.setTime(recordsofSensor[iRec - 1].timeStamp) // 前一个事件时间
        t1s.setMilliseconds(0) // 得到整秒

        t1m.setTime(recordsofSensor[iRec - 1].timeStamp) // t1m：前一个事件的整格子数
        t1m.setMilliseconds(0)
        t1m.setSeconds(0)
        t1m.setMinutes(interval * (Math.floor(t1s.getMinutes() / interval))) // 得到整格子开始,如0,20,40.或0,30,60

        t2s.setTime(recordsofSensor[iRec].timeStamp) // 当前事件时间
        t2s.setMilliseconds(0) // 得到整秒
        t2m.setTime(recordsofSensor[iRec].timeStamp)
        t2m.setMilliseconds(0)
        t2m.setSeconds(0)
        t2m.setMinutes(interval * (Math.floor(t2s.getMinutes() / interval)))

        _temprecObj.ID = recordsofSensor[iRec].Did

        // 得到十分钟差和秒数零头
        /// Iwashere
        intervalDiff = Math.floor((t2m - t1m) / (interval * 60 * 1000)) // 两次数据之间整格子差
        t1toNextinterval = 60 * interval - t1s.getSeconds() - (t1s.getMinutes() % interval) * 60 // 前面的零头秒数.例如 16:14:06, 则 = 45.54 =2754 TODO,有问题,对整点
        prevInterval2t2 = t2s.getSeconds() + (t2s.getMinutes() % interval) * 60 // 后面的零头秒数 16:14:06, 则 = 14.06=846
            // 这样, 10:01:22 in -11:23:44 ot ,应该计算01分的38秒占用,03分的44秒占用 ,02的66秒占用

        c('     ->' + '#1 ' + t1s.toLocaleTimeString() + '=' + t1m.toLocaleTimeString() + '+' + intervalDiff + '+' + t1ToNextinterval + 's= #2:' + t2s.toLocaleString() + '-' + prevInterval2t2 + 's=' +
            t2m.toLocaleTimeString())

        if (recordsofSensor[iRec - 1].value === 'in') { // 如果前一个是in,那么后面的时间段应该100%占用
            //     c('    before ' + i + ' was a ' + motionTimeStamps[i - 1].value)

            if (t1m >= t2m) {
                //   c('        头尾在同样的一十分钟,计算缝隙')
                t1ToNextinterval = (t1ToNextinterval + prevInterval2t2 - 60 * interval) /// 计算缝隙
                prevInterval2t2 = 0 // 合并计算了
            }

            t0.setTime(t1m.getTime()) // 前一十分钟

            let _RecordExist = false // 记录不存在
                // eslint-disable-next-line no-unused-vars
                // var _ExistValue = 0

            // process head
            if (timeArray.length >= 1) {
                for (let k = timeArray.length - 1; k >= Math.max(timeArray.length - 5, 0); k--) { // 检查是否存在这个分钟纪录,回溯5个记录(为了减少无谓计算)
                    if (timeArray[k].timeStamp === t0.toLocaleString()) {
                        c(k + '        头部记录存在！增加数值' + t0.toLocaleTimeString() + '   ' + JSON.stringify(timeArray[k]))
                        _RecordExist = true
                        timeArray[k].value += t1ToNextinterval / 600 // 增加新的占用
                    }
                }
            }
            if (!_RecordExist) { // 这一分不存在
                _temprecObj.timeStamp = t0.toLocaleString()
                _temprecObj.value = t1ToNextinterval / 60 / interval // 10m
                var _temprecObj = JSON.parse(JSON.stringify(_temprecObj))
                timeArray.push(_temprecObj) // 增加记录
                c('      头部记录不存在！加入新记录：' + JSON.stringify(_temprecObj))
            }
            // process middle
            let j = 1
            c('      准备加入中部记录')
            while (j < intervalDiff) {
                t0.setTime(t1m.getTime() + j * 600 * 1000) // 下一十分钟
                _temprecObj.timeStamp = t0.toLocaleString()
                _temprecObj.value = 1

                var _temprecObj = JSON.parse(JSON.stringify(_temprecObj))
                timeArray.push(_temprecObj)
                c('      加入中部记录：' + JSON.stringify(_temprecObj))
                j++
            }

            { // tail会重复？
                t0.setTime(t2m.getTime()) // tail
                let _RecordExist = false
                    // for (const k in timeArray) { // already exits in Array?
                    //       for (let k = timeArray.length - 1; k > 0; k--) {
                if (timeArray.length >= 1) {
                    for (let k = timeArray.length - 1; k >= Math.max(timeArray.length - 5, 0); k--) { // 检查是否存在这个分钟纪录
                        if (timeArray[k].timeStamp === t0.toLocaleString()) {
                            _RecordExist = true
                                //        c(k + '     尾部记录存在！尾部数值增加  ' + JSON.stringify(timeArray[k]) + ' + ' + PrevTot2)
                            timeArray[k].value += prevInterval2t2 / 600
                            c(k + '     尾部记录存在！尾部数值增加  ' + t0.toLocaleTimeString() + '   ' + JSON.stringify(timeArray[k]))
                        }
                    }
                }

                if (!_RecordExist) {
                    _temprecObj.timeStamp = t2m.toLocaleString()
                    _temprecObj.value = prevInterval2t2 / 60 / interval // 10m
                    var _temprecObj = JSON.parse(JSON.stringify(_temprecObj))
                    timeArray.push(_temprecObj)
                    c('      尾部记录不存在，加入新记录：' + JSON.stringify(_temprecObj))
                }
            }
        } else if ((recordsofSensor[iRec - 1].value === 'ms')) { //  ms 记录 donothing
            c(' \n ms skipped \n')
        } else { // 如果前一个记录是ot,后面时间缝隙全都是0
            if (t1m >= t2m) {
                c('      头尾在相同的一十分钟,计算缝隙')
                t1ToNextinterval = (t1ToNextinterval + prevInterval2t2 - 60 * interval) /// 计算缝隙
                prevInterval2t2 = 0 // 计算头部即可
            };

            t0.setTime(t1m) // Previous hour sharp
            let _RecordExist = false

            if (timeArray.length >= 1) {
                for (let k = timeArray.length - 1; k >= Math.max(timeArray.length - 5, 0); k--) { // 检查是否存在这个十分钟纪录,回溯若干个记录
                    if (timeArray[k].timeStamp === t0.toLocaleString()) {
                        c(k + '      头部记录存在！原值不变 ' + t0.toLocaleTimeString() + '   ' + JSON.stringify(timeArray[k]))
                        _RecordExist = true
                    }
                }
            }
            if (!_RecordExist) { // 这一分不存在
                _temprecObj.timeStamp = t0.toLocaleString()
                _temprecObj.value = 0

                var _temprecObj = JSON.parse(JSON.stringify(_temprecObj))
                timeArray.push(_temprecObj) // 增加记录
                c('      头部不存在！加入新记录 0' + JSON.stringify(_temprecObj))
            }

            // process middle
            let j = 1
                // c('      准备加入中部记录：');
            while (j < intervalDiff) {
                t0.setTime(t1m.getTime() + j * 60 * interval * 1000)
                _temprecObj.timeStamp = t0.toLocaleString()
                _temprecObj.value = 0

                var _temprecObj = JSON.parse(JSON.stringify(_temprecObj))
                timeArray.push(_temprecObj)
                c('      加入中部记录 0 ' + JSON.stringify(_temprecObj))
                j++
            }
            // tail会重复？
            t0.setTime(t2m) // tail
            _RecordExist = false
                // for (const k in timeArray) { // already exits in Array?
                // for (let k = timeArray.length - 1; k > 0; k--) {
            if (timeArray.length >= 1) {
                for (let k = timeArray.length - 1; k >= Math.max(timeArray.length - 5, 0); k--) { // 检查是否存在这个分钟纪录
                    if (timeArray[k].timeStamp === t0.toLocaleString()) {
                        c(k + '                  尾部记录存在！原值不变 ' + '   ' + JSON.stringify(timeArray[k]))
                        _RecordExist = true
                            // _ExistValue = timeArray[k].value;
                    }
                }
            }
            // do nothing
            if (!_RecordExist) {
                _temprecObj.timeStamp = t2m.toLocaleString()
                _temprecObj.value = 0
                var _temprecObj = JSON.parse(JSON.stringify(_temprecObj))
                timeArray.push(_temprecObj)
                c('      尾部记录不存在，加入新记录 0 ' + JSON.stringify(_temprecObj))
            }
        }
    }

    c('    timearray: sorting ')
    timeArray.sort(function(a, b) {
        if (Date.parse(a.timeStamp) > Date.parse(b.timeStamp)) {
            return 1
        } else {
            return -1
        };
    })
    c('  writing  for this sensor ' + timeArray.length)

    for (let i5 = 0; i5 < timeArray.length; i5++) {
        var e = timeArray[i5]
        CSVFile.write(unitsArray[i1] + ',' + e.timeStamp + ',' + e.value + '\n')
    };
}
// CSVFile.end()

CSVFile.end()
    // process.exit()