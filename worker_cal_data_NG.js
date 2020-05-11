//worker for multithread 
const FS = require('fs')
    //从命令行取得参数
const locationId = process.argv[2]
const startDate = process.argv[3]
const endDate = process.argv[4]
const EUorUU = process.argv[5]
var interval = process.argv[6] // 计算间隔时间(分)
    //根据命令管理读取上一工序生成的文件
var t1ToNext, PrevTot2, hourDiff, str
var t0, t1, t2, t1m, t2m = new Date()
var str
var two_D_Array, originArray, unitsArray, motionTimeStamps, resultArray = []
var recordObj = {
    // type: '',
    Did: '',
    timeStamp: '',
    value: ''
}
var timeObj = {
    ID: '',
    timeStamp: '',
    value: ''
}
var lastValue = -1
const c = console.log


const filename = '../log/' + locationId + '_' + startDate.replace(/[/:]/gi, '_') + '_' + endDate.replace(/[/:]/gi, '_') + '_' + EUorUU
str = FS.readFileSync(filename + '.json', { encoding: 'utf8' })
    // var minDiff


const CSVFile = FS.createWriteStream(filename + '_' + interval + 'M.csv', { encoding: 'utf8' })

CSVFile.on('finish', () => {
    console.log('写入已完成..')
})

//处理成标准JSON
str = str.replace(/\]\[/gi, ',') // change ][ to , which was caused by consecutive packets

originArray = JSON.parse(str) // 从文件读入的原始记录总表
c('----总motion记录数----' + originArray.length)


// 计算出一个sensor 数组unitsArray
// 建立不重复的传感器表 unitsArray

for (let i1 = 0; i1 < originArray.length; i1++) {
    if (unitsArray.indexOf(originArray[i1].DID) < 0) {
        unitsArray.push(originArray[i1].DID)
        two_D_Array[originArray[i1].DID] = [] // json:计算报告数组, 建立二维数组框架,准备存入报告数据
            // c(locationJson[i1].DID)
    }
}

c('----总的传感器数----' + unitsArray.length)

// 将不同传感器的数据分开放入数组

CSVFile.write('ID,Time,Pct\n') // CSV文件头

//将原始记录记入到二维数组中
for (let i1 = 0; i1 < originArray.length; i1++) {
    two_D_Array[originArray[i1].DID].push(JSON.parse(JSON.stringify(originArray[i1])))
}

// 计算循环 写入 motionTimeStamps 数组

for (let i1 = 0; i1 < unitsArray.length; i1++) { // 对每一个sensor做循环 i1:传感器ID循环
    c('---Now computing sensor:  ' + unitsArray[i1])

    let tempObj

    // Sorting sensor array :important

    two_D_Array[unitsArray[i1]].sort(function(a, b) { // 先按照时间排序
        if (a.sampleTime > b.sampleTime) {
            return 1
        } else {
            return -1
        };
    })

    motionTimeStamps.length = 0 // 清零
    recordObj.Did = unitsArray[i1]

    // 从motion value/free/occupy 变换到 in-ot 记录

    // asset记录
    if (two_D_Array[unitsArray[i1]][0].DID.indexOf('UU') >= 0) {
        c(' -- Calculating asset records in ' + two_D_Array[unitsArray[i1]].length + ' lists')

        // boundary:日期边界视为空,写入起始记录

        recordObj.timeStamp = Date.parse(startDate)
        recordObj.value = 'ot'
        tempObj = JSON.parse(JSON.stringify(recordObj))
        motionTimeStamps.push(tempObj)

        // 计算主体

        for (let i2 = 0; i2 < two_D_Array[unitsArray[i1]].length; i2++) { // i2:单个传感器的记录内循环
            recordObj.timeStamp = two_D_Array[unitsArray[i1]][i2].sampleTime
            if (two_D_Array[unitsArray[i1]][i2].assetState.name === 'occupied') {
                recordObj.value = 'in'
            } else if (two_D_Array[unitsArray[i1]][i2].assetState.name === 'free') {
                recordObj.value = 'ot'
            } else { // 包含 missinput等
                recordObj.value = 'ms'
                recordObj.timeStamp = (i2 === 0) ? Date.parse(startDate) : (two_D_Array[unitsArray[i1]][i2 - 1].sampleTime + 10000) // 在前一个记录后,增加一个十秒后的掉线数据

                // c('\n ms  ' + recordObj.Did + ' ' + recordObj.timeStamp + '\n')
            };
            tempObj = JSON.parse(JSON.stringify(recordObj))
            motionTimeStamps.push(tempObj)
        }

        // add boundary record - always as the last one

        recordObj.timeStamp = Date.parse(endDate)
            // recordObj.value 取原值
        tempObj = JSON.parse(JSON.stringify(recordObj))
        motionTimeStamps.push(tempObj)
    }
    // 如果是samplemotion 记录
    else if (two_D_Array[unitsArray[i1]][0].DID.indexOf('EU') >= 0) {
        c('  calculating in-ot 记录' + two_D_Array[unitsArray[i1]].length + ' lists')

        // boundary:日期边界视为空
        recordObj.timeStamp = two_D_Array[unitsArray[i1]][0].sampleTime // 第一个 samplemotion记录,无法判断,先设为ot
        recordObj.value = 'ot'
        tempObj = JSON.parse(JSON.stringify(recordObj))
        motionTimeStamps.push(tempObj)

        // 主体

        for (let i2 = 1; i2 < two_D_Array[unitsArray[i1]].length; i2++) { // from second records and so on
            lastValue = two_D_Array[unitsArray[i1]][i2 - 1].value // update previous value

            recordObj.timeStamp = two_D_Array[unitsArray[i1]][i2].sampleTime
            if (((two_D_Array[unitsArray[i1]][i2].sampleTime - two_D_Array[unitsArray[i1]][i2 - 1].sampleTime)) < 1000 * 300) { // dehole,因为时间差大于5分钟,不可靠
                if (lastValue !== two_D_Array[unitsArray[i1]][i2].value) { // Value changed!
                    recordObj.value = 'in'
                    tempObj = JSON.parse(JSON.stringify(recordObj))
                    motionTimeStamps.push(tempObj)
                } else if (lastValue === two_D_Array[unitsArray[i1]][i2].value) { // Value unchanged!
                    recordObj.value = 'ot'
                    tempObj = JSON.parse(JSON.stringify(recordObj))
                    motionTimeStamps.push(tempObj)
                } else { // do not write to recordarray
                    // c('        Sensor first seen, cannot tell')
                };
            } else {
                recordObj.value = 'ms' //
                recordObj.timeStamp = two_D_Array[unitsArray[i1]][i2 - 1].sampleTime + 10000 // 增加一个十秒后的掉线数据
                tempObj = JSON.parse(JSON.stringify(recordObj))
                motionTimeStamps.push(tempObj)
                    // c('\n MS    ' + recordObj.Did + ' ' + recordObj.timeStamp + '\n')
            }
        }
    }

    c('  COMPUTING ALL  motion records for this DID (BOUNDARY ADDED) : ' + motionTimeStamps.length)

    // for (let j = 0; j < motionTimeStamps.length; j++) { //打印原始记录
    //     t1.setTime(motionTimeStamps[j].timeStamp)
    //     // c(motionTimeStamps[j].value + '  ' + t1.toLocaleString())
    // }

    resultArray.length = 0 // 目标矩阵清零

    c('   ---Time array cleared,  processing time Array from (zero) ' + resultArray.length)

    for (let i2 = 1; i2 < motionTimeStamps.length; i2++) { // start from second record
        t1.setTime(motionTimeStamps[i2 - 1].timeStamp) // 前一个事件时间
        t1.setMilliseconds(0) // 得到整秒

        // 得到整数十分钟开始,如0,10,20,50
        t1m.setTime(motionTimeStamps[i2 - 1].timeStamp)
        t1m.setMilliseconds(0)
        t1m.setSeconds(0)
        t1m.setMinutes(interval * (Math.floor(t1.getMinutes() / interval)))

        t2.setTime(motionTimeStamps[i2].timeStamp) // 当前事件时间
        t2.setMilliseconds(0) // 得到整秒

        // 得到整数十分钟开始,如0,10,20,50
        t2m.setTime(motionTimeStamps[i2].timeStamp)
        t2m.setMilliseconds(0)
        t2m.setSeconds(0)
        t2m.setMinutes(interval * (Math.floor(t2.getMinutes() / interval)))

        timeObj.ID = motionTimeStamps[i2].Did

        // 得到十分钟差和秒数零头

        hourDiff = Math.floor((t2m - t1m) / (60 * 1000 * interval)) // 两次数据之间差几个间隔
        t1ToNext = 60 * interval - t1.getSeconds() - (t1.getMinutes() % interval) * 60 // 前面的零头秒数.例如 16:14:06, 则 = 45.54 =2754 TODO,有问题,对整点
        PrevTot2 = t2.getSeconds() + (t2.getMinutes() % interval) * 60 // 后面的零头秒数 16:14:06, 则 = 14.06=846
            // 这样, 10:01:22 in -11:23:44 ot ,应该计算01分的38秒占用,03分的44秒占用 ,02的66秒占用

        //  c('     ->' + '#1 ' + t1.toLocaleString() + '=' + t1m.toLocaleTimeString() + '+' + hourDiff + '+' + t1ToNext + 's= #2:' + t2.toLocaleString() + '-' + PrevTot2 + 's=' +
        //     t2m.toLocaleTimeString())

        if (motionTimeStamps[i2 - 1].value === 'in') { // 如果前一个是in,那么后面的时间段应该100%占用
            //     c('    before ' + i + ' was a ' + motionTimeStamps[i - 1].value)

            if (t1m >= t2m) {
                //   c('        头尾在同样的一十分钟,计算缝隙')
                t1ToNext = (t1ToNext + PrevTot2 - 60 * interval) /// 计算缝隙
                PrevTot2 = 0 // 合并计算了
            }

            t0.setTime(t1m.getTime()) // 前一十分钟

            let _RecordExist = false // 记录不存在
                // eslint-disable-next-line no-unused-vars
                // var _ExistValue = 0

            // process head
            if (resultArray.length >= 1) {
                for (let k = resultArray.length - 1; k >= Math.max(resultArray.length - 5, 0); k--) { // 检查是否存在这个分钟纪录,回溯5个记录(为了减少无谓计算)
                    if (resultArray[k].timeStamp === t0.toLocaleString()) {
                        // c(k + '        头部记录存在！增加数值' + t0.toLocaleTimeString() + '   ' + JSON.stringify(timeArray[k]))
                        _RecordExist = true
                        resultArray[k].value += t1ToNext / 600 // 增加新的占用
                    }
                }
            }
            if (!_RecordExist) { // 这一分不存在
                timeObj.timeStamp = t0.toLocaleString()
                timeObj.value = t1ToNext / 60 / interval // 10m
                var _timeObj = JSON.parse(JSON.stringify(timeObj))
                resultArray.push(_timeObj) // 增加记录
                    // c('      头部记录不存在！加入新记录：' + JSON.stringify(_timeObj))
            }
            // process middle
            let j = 1
                // c('      准备加入中部记录')
            while (j < hourDiff) {
                t0.setTime(t1m.getTime() + j * 600 * 1000) // 下一十分钟
                timeObj.timeStamp = t0.toLocaleString()
                timeObj.value = 1

                var _timeObj = JSON.parse(JSON.stringify(timeObj))
                resultArray.push(_timeObj)
                    // c('      加入中部记录：' + JSON.stringify(_timeObj))
                j++
            }

            { // tail会重复？
                t0.setTime(t2m.getTime()) // tail
                let _RecordExist = false
                    // for (const k in timeArray) { // already exits in Array?
                    //       for (let k = timeArray.length - 1; k > 0; k--) {
                if (resultArray.length >= 1) {
                    for (let k = resultArray.length - 1; k >= Math.max(resultArray.length - 5, 0); k--) { // 检查是否存在这个分钟纪录
                        if (resultArray[k].timeStamp === t0.toLocaleString()) {
                            _RecordExist = true
                                //        c(k + '     尾部记录存在！尾部数值增加  ' + JSON.stringify(timeArray[k]) + ' + ' + PrevTot2)
                            resultArray[k].value += PrevTot2 / 600
                                // c(k + '     尾部记录存在！尾部数值增加  ' + t0.toLocaleTimeString() + '   ' + JSON.stringify(timeArray[k]))
                        }
                    }
                }

                if (!_RecordExist) {
                    timeObj.timeStamp = t2m.toLocaleString()
                    timeObj.value = PrevTot2 / 60 / interval // 10m
                    var _timeObj = JSON.parse(JSON.stringify(timeObj))
                    resultArray.push(_timeObj)
                        // c('      尾部记录不存在，加入新记录：' + JSON.stringify(_timeObj))
                }
            }
        } else if ((motionTimeStamps[i2 - 1].value === 'ms')) { //  ms 记录 donothing
            // c(' \n ms skipped \n')
        } else { // 如果前一个记录是ot,后面时间缝隙全都是0
            if (t1m >= t2m) {
                // c('      头尾在相同的一十分钟,计算缝隙')
                t1ToNext = (t1ToNext + PrevTot2 - 60 * interval) /// 计算缝隙
                PrevTot2 = 0 // 计算头部即可
            };

            t0.setTime(t1m) // Previous hour sharp
            let _RecordExist = false

            if (resultArray.length >= 1) {
                for (let k = resultArray.length - 1; k >= Math.max(resultArray.length - 5, 0); k--) { // 检查是否存在这个十分钟纪录,回溯若干个记录
                    if (resultArray[k].timeStamp === t0.toLocaleString()) {
                        // c(k + '      头部记录存在！原值不变 ' + t0.toLocaleTimeString() + '   ' + JSON.stringify(timeArray[k]))
                        _RecordExist = true
                    }
                }
            }
            if (!_RecordExist) { // 这一分不存在
                timeObj.timeStamp = t0.toLocaleString()
                timeObj.value = 0

                var _timeObj = JSON.parse(JSON.stringify(timeObj))
                resultArray.push(_timeObj) // 增加记录
                    // c('      头部不存在！加入新记录 0' + JSON.stringify(_timeObj))
            }

            // process middle
            let j = 1
                // c('      准备加入中部记录：');
            while (j < hourDiff) {
                t0.setTime(t1m.getTime() + j * 60 * interval * 1000)
                timeObj.timeStamp = t0.toLocaleString()
                timeObj.value = 0

                var _timeObj = JSON.parse(JSON.stringify(timeObj))
                resultArray.push(_timeObj)
                    // c('      加入中部记录 0 ' + JSON.stringify(_timeObj))
                j++
            }
            // tail会重复？
            t0.setTime(t2m) // tail
            _RecordExist = false
                // for (const k in timeArray) { // already exits in Array?
                // for (let k = timeArray.length - 1; k > 0; k--) {
            if (resultArray.length >= 1) {
                for (let k = resultArray.length - 1; k >= Math.max(resultArray.length - 5, 0); k--) { // 检查是否存在这个分钟纪录
                    if (resultArray[k].timeStamp === t0.toLocaleString()) {
                        // c(k + '                  尾部记录存在！原值不变 ' + '   ' + JSON.stringify(timeArray[k]))
                        _RecordExist = true
                            // _ExistValue = timeArray[k].value;
                    }
                }
            }
            // do nothing
            if (!_RecordExist) {
                timeObj.timeStamp = t2m.toLocaleString()
                timeObj.value = 0
                var _timeObj = JSON.parse(JSON.stringify(timeObj))
                resultArray.push(_timeObj)
                    // c('      尾部记录不存在，加入新记录 0 ' + JSON.stringify(_timeObj))
            }
        }
    }

    // c('    timearray: sorting ')
    resultArray.sort(function(a, b) {
        if (Date.parse(a.timeStamp) > Date.parse(b.timeStamp)) {
            return 1
        } else {
            return -1
        };
    })
    c('  writing  for this sensor ' + resultArray.length)

    for (let i5 = 0; i5 < resultArray.length; i5++) {
        var e = resultArray[i5]
        CSVFile.write(unitsArray[i1] + ',' + e.timeStamp + ',' + e.value + '\n')
    };
}
// CSVFile.end()

CSVFile.end()
c('Converter exiting')
    // process.exit()