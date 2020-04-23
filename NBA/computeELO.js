/* eslint-disable no-unused-vars */
const FS = require('fs')

const csvFile = 'NBA\\NBA.csv'
const k = 32

const resultString = FS.readFileSync(csvFile, { encoding: 'utf8' })
const ELOFile = FS.createWriteStream('NBA\\ELO.csv', { encoding: 'utf8' })

let resultArray = []
const ELOObj = {
    name: '',
    round: 0,
    Exp: 0,
    ELO: 1000,
    TeamRound: 1
}

resultArray = csvToObject(resultString)

function csvToObject(csvString) {
    const csletry = csvString.split('\r\n')
    const datas = []
    const headers = csletry[0].split(',')
    for (let i = 1; i < csletry.length; i++) {
        const data = {}
        const temp = csletry[i].split(',')
        for (let j = 0; j < temp.length; j++) {
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

// let teamSet = []

// for (let index = 0; index < resultArray.length; index++) {
//     // console.log(typeof (str))
//     if ((teamSet.indexOf(resultArray[index].HomeTeam) < 0) && (resultArray[index].HomeTeam != null)) teamSet.push(resultArray[index].HomeTeam)
//     // teamSet.push0(resultArray[index].HomeTeam)

//     // EloArray.push(JSON.stringify(JSON.parse(data))) // resultArray[0].HomeTeam
// }

// 赛程排序

resultArray.sort(function (a, b) { return (a._Round - b._Round) })

for (let index = 0; index < resultArray.length; index++) {
    const e = resultArray[index]
    e.Round = index + 1 // 从一开始
}

const TeamElos = []
// function getELO(t, r) {
//     for (let i = 0; i < TeamElos.length; i++) {
//         if (TeamElos[i].name === t && TeamElos[i].round === r) return TeamElos[i].ELO
//     }
// }

function getLatestELO(t) {
    let _round = 0
    let _index = -1
    for (let i = 0; i < TeamElos.length; i++) {
        if ((TeamElos[i].name === t) && (TeamElos[i].round > _round)) {
            _round = TeamElos[i].round
            _index = i
        }
    }
    if (_index === -1) { return 1000 } else { return TeamElos[_index].ELO }
}
function getLatestTeamRound(t) {
    let _round = 0
    let _index = -1
    // let _tr = 0

    for (let i = 0; i < TeamElos.length; i++) {
        if ((TeamElos[i].name === t) && (TeamElos[i].round >= _round)) {
            _round = TeamElos[i].round
            _index = i
        }
    }
    if (_index === -1) { return 0 } else { return TeamElos[_index].TeamRound }
}

function setELO(t, r, ep, e, tr) {
    ELOObj.name = t
    ELOObj.round = r
    ELOObj.Exp = ep
    ELOObj.ELO = e
    ELOObj.TeamRound = tr

    console.log(JSON.stringify(ELOObj))

    TeamElos.push(JSON.parse(JSON.stringify(ELOObj)))
}

function printELO(t) {
    for (let i = 0; i < TeamElos.length; i++) {
        if (TeamElos[i].name === t) console.log(TeamElos[i].round + '   ' + TeamElos[i].ELO)
    }
}
// let ELOObj = { name: '', round: 0, ELO: 1000 }
// console.log(JSON.stringify(teamSet))

// Write initial Elo
// for (let i = 0; i < teamSet.length; i++) { // 为每队建立初始值
//     // console.log(teamSet[i])
//     setELO(teamSet[i], 0, 1000)
// }
// console.log('Initial ELO set')

for (let index = 0; index < resultArray.length; index++) {
    const team = resultArray[index].TEAM1
    const opteam = resultArray[index].TEAM2
    const result = parseInt((resultArray[index].Result))
    const _round = resultArray[index].Round
    var _home = resultArray[index].HOME === 'HOME' ? 1 : 0

    // console.log(_home + '   ' + resultArray[index].HOME)
    if (team == null) continue
    // console.log(_hometeam + '  ' + _round + '  ' + _season + '  ')
    var o1 = getLatestELO(team) || 1000 // 初始值1000
    var o2 = getLatestELO(opteam) || 1000 // 初始值1000
    // 计算等级分
    var Ea = 1 / (1 + Math.pow(10, (o2 - o1) / 400))
    var Eb = 1 / (1 + Math.pow(10, (o1 - o2) / 400))
    var _newELO1 = parseFloat(o1) + k * (result - Ea)
    var _newELO2 = parseFloat(o2) + k * ((1 - result) - Eb)

    Ea = Ea * (_home ? 1.3 : 1 / 1.3) // 主客场对胜率的影响
    Eb = Eb * (_home ? 1 / 1.3 : 1.3)

    var _tr1 = parseInt(getLatestTeamRound(team))
    var _tr2 = parseInt(getLatestTeamRound(opteam))

    // 计算胜率

    setELO(team, parseInt(_round), Ea, parseFloat(_newELO1), _tr1 + 1)
    setELO(opteam, parseInt(_round), Eb, parseFloat(_newELO2), _tr2 + 1)

    // setELO(_awayteam, parseInt(_round), parseFloat(_newELO2))
}

TeamElos.sort(function (a, b) { return a.round - b.round })
// console.log(JSON.stringify(TeamElos))
// printELO('GSW')
ELOFile.write('Team' + ',' + 'Round' + ',' + 'teamRound' + ',' + 'EXP' + ',' + 'ELO')

for (let i5 = 0; i5 < TeamElos.length; i5++) {
    const el = TeamElos[i5]
    if (el.name != null && el.name !== '') { ELOFile.write('\n' + el.name + ',' + el.round + ',' + el.TeamRound + ',' + el.Exp + ',' + el.ELO) }
};
ELOFile.end()
