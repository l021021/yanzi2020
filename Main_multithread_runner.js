var child_process = require("child_process")
var loggers = []
var Converters = []


// const locationIds = ['114190', '996052', '912706'] //hw
// const locationIds = ['229349'] //fangtan	274189
const locationIds = ['274189'] //shenao

const startDate = '2020/04/28/09:00:00'
const endDate = '2020/04/28/11:59:59'
const EUorUU = 'UU'
const interval = 30 //分钟

for (let lc = 0; lc < locationIds.length; lc++) {
    loggers[lc] = child_process.fork("worker_get_data.js", [locationIds[lc], startDate, endDate, EUorUU])
        // console.log("child process entered")
    loggers[lc].on("exit", function() {
        Converters[lc] = child_process.fork("worker_cal_data.js", [locationIds[lc], startDate, endDate, EUorUU, interval])
    })
}