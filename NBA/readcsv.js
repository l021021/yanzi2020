const FS = require('fs')

const csvFile = 'NBA\\NBA.csv'

const resultString = FS.readFileSync(csvFile, { encoding: 'utf8' })

let resultArray = []
var ELOObj = {
    name: '',
    round: 0,
    ELO: 1000
}

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

// const EloArray = []
var teamSet = []
// var ELOObj
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
    if ((teamSet.indexOf(resultArray[index].HomeTeam) < 0) && (resultArray[index].HomeTeam != null)) teamSet.push(resultArray[index].HomeTeam)
    // teamSet.push0(resultArray[index].HomeTeam)

    // EloArray.push(JSON.stringify(JSON.parse(data))) // resultArray[0].HomeTeam
}

// 赛程排序

resultArray.sort(function (a, b) { if (a.GameID > b.GameID) { return 1 } else { return -1 } })

// 建立新的ROUND
for (let index = 0; index < resultArray.length; index++) {
    const e = resultArray[index]
    e.Round = index
}

var TeamElos = []
function getELO(t, r) {
    for (let i = 0; i < TeamElos.length; i++) {
        if (TeamElos[i].name === t && TeamElos[i].round === r) return TeamElos[i].ELO
    }
}

function getLatestELO(t) {
    var _round = 0
    var _index = 0
    for (let i = 0; i < TeamElos.length; i++) {
        if ((TeamElos[i].name === t) && (TeamElos[i].round > _round)) {
            _round = TeamElos[i].round
            _index = i
        }
    }
    return TeamElos[_index].ELO
}

function setELO(t, r, e) {
    ELOObj.name = t
    ELOObj.round = r
    ELOObj.ELO = e

    TeamElos.push(JSON.parse(JSON.stringify(ELOObj)))
}

function printELO(t) {
    for (let i = 0; i < TeamElos.length; i++) {
        if (TeamElos[i].name === t) console.log(TeamElos[i].round + '   ' + TeamElos[i].ELO)
    }
}
// const ELOObj = { name: '', round: 0, ELO: 1000 }
console.log(JSON.stringify(teamSet))

// Write initial Elo
for (let i = 0; i < teamSet.length; i++) { // 为每队建立初始值
    // console.log(teamSet[i])
    setELO(teamSet[i], 0, 1000)
}
console.log('Initial ELO set')

for (let index = 0; index < resultArray.length; index++) { // season 过滤赛季
    const _hometeam = resultArray[index].HomeTeam
    const _awayteam = resultArray[index].AwayTeam
    const _homeWin = parseInt((resultArray[index].HOME == 'HOME') ? (resultArray[index].Result == 'W' ? 1 : 0) : (resultArray[index].Result == 'L' ? 1 : 0))
    const _round = resultArray[index].Round
    const _season = resultArray[index].Season

    // console.log(_hometeam + '  ' + _round + '  ' + _season + '  ')
    if (_season === '2016') {
        var o1 = getLatestELO(_hometeam) || 1000
        var o2 = getLatestELO(_awayteam) || 1000
        // 计算等级分
        const Ea = 1 / (1 + Math.pow(10, (o2 - o1) / 400))
        const Eb = 1 / (1 + Math.pow(10, (o1 - o2) / 400))
        const _newELO1 = parseFloat(o1) + 16 * (_homeWin - Ea)
        const _newELO2 = parseFloat(o2) + 16 * ((1 - _homeWin) - Eb)

        setELO(_hometeam, parseInt(_round), parseFloat(_newELO1))
        setELO(_awayteam, parseInt(_round), parseFloat(_newELO2))
    }
}

TeamElos.sort(function (a, b) { return a.round - b.round })
// console.log(JSON.stringify(TeamElos))
printELO('GSW')
