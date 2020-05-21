var child_process = require("child_process")
var loggers = []
var Converters = []


// const locationIds = ['114190', '996052', '912706'] //hw
// const locationIds = ['229349'] //fangtan	274189
// const locationIds = ['305026'] //-CHC 
const locationIds = ['952675', '402837', '268429', '732449', '328916'] //拓闻淮安


// const locationIds = ['274189', '229349'] //shenao
const startDate = '2020/05/18/00:00:00'
const endDate = '2020/05/21/00:00:00'
const EUorUU = 'Motion'
const interval = 30 //分钟

for (let lc = 0; lc < locationIds.length; lc++) {
    loggers[lc] = child_process.fork("get_data_worker_beta.js", [locationIds[lc], startDate, endDate, EUorUU])
        // console.log("child process entered")
    loggers[lc].on("exit", function() {
        Converters[lc] = child_process.fork("cal_data_worker_beta.js", [locationIds[lc], startDate, endDate, EUorUU, interval])
    })
}