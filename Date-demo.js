// This is a test for Date

var myDate = new Date() // freezed at that moment
console.log(myDate) // Tue Nov 12 2019 11:48:51 GMT+0800 (GMT+08:00)
console.log(JSON.parse(JSON.stringify(myDate.toJSON()))) // Tue Nov 12 2019 11:48:51 GMT+0800 (GMT+08:00)

console.log(Date.parse('2019/01/01')) // to  mili
console.log(myDate.toLocaleDateString()) // 2019-11-12
console.log(myDate.toLocaleTimeString()) // 12:01:11
console.log(myDate.toLocaleString()) // 12:01:11

// setTimeout(function() { console.log(myDate.toLocaleTimeString()) }, 10000)
console.log(myDate.getDate()) // 12
console.log(myDate.getTime()) // 1573531087679
console.log(Date.now()) // 1573531087679
console.log(myDate.toDateString()) // Tue Nov 12 2019
console.log(Date.parse(myDate.getFullYear() + '/' + myDate.getMonth() + '/' + myDate.getDate())) // to Mili
myDate.setTime(1571531647736)
myDate.setMinutes(0)
myDate.setSeconds(0)
myDate.setMilliseconds(0)

// string to dater

myDate.setTime(Date.parse('2019/01/01/02:00:00'))

console.log(myDate.toLocaleString('Zh-cn', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })) // get the even clock 8:00:00

console.log(Date.parse('2019/11/12/' + '10:00:00'))
