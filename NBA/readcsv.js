const FS = require('fs')

const csvFile = 'NBA\\NBA.csv'

const resultString = FS.readFileSync(csvFile, { encoding: 'utf8' })

let resultArray = []

// const EloDto = {
//     TeamAB: '', [
//         GameID: '',
//     ELOScore: '']
// }

resultArray = csvToObject(resultString)

function csvToObject(csvString) {
    var csvarry = csvString.split('\r\n')
    var datas = []
    var headers = csvarry[0].split(',')
    for (var i = 1; i < csvarry.length; i++) {
        var data = {}
        var temp = csvarry[i].split(',')
        for (var j = 0; j < temp.length; j++) {
            if (typeof (temp[j]) === 'string') {
                temp[j] = temp[j].replace(/["]/gi, '')
                // console.log('string')
            }
            data[headers[j]] = temp[j]
        }
        datas.push(data)
    }
    return datas
}

const EloArray = []
var teamSet = []
// teamSet.push0 = function (_stuff) {
//     if (teamSet.indexof(_stuff) < 0) teamSet.push(_stuff)
//     else console.log(_stuff)
// }
// EloArray.Latest = function (_Team) {
//     if EloArray.has({ "TEAM": _Team, "1": '0' }))
//   }
// const teamArray = new Set()

for (let index = 0; index < resultArray.length; index++) {
    // console.log(typeof (str))
    if (teamSet.indexOf(resultArray[index].HomeTeam) < 0) teamSet.push(resultArray[index].HomeTeam)
    // teamSet.push0(resultArray[index].HomeTeam)

    // EloArray.push(JSON.stringify(JSON.parse(data))) // resultArray[0].HomeTeam
}

console.log(JSON.stringify(teamSet))

// for (let index = 0; index < resultArray.length; index++) {
//     const ele = array[index]
//     // search for last ELO
//     EloArray.

// }
