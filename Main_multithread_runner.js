var child_process = require("child_process")
var workers = []


const locationIds = ['114190', '996052', '912706']
const startDate = '2020/04/29/00:00:00'
const endDate = '2020/04/29/14:59:59'
const EUorUU = 'Motion'

for (let lc = 0; lc < locationIds.length; lc++) {
    workers[lc] = child_process.fork("worker_get_data.js", [locationIds[lc], startDate, endDate, EUorUU])
    console.log("child process entered")
    workers[lc].on("exit", function() {
        console.log("child process exit")

    })
}