// the array to be sorted
var list = ['Delta', 'alpha', 'CHARLIE', 'bravo']

// temporary array holds objects with position and sort-value
var mapped = list.map(function (el, i) {
    return { index: i, value: el.toLowerCase() }
})

// sorting the mapped array containing the reduced values
mapped.sort(function (a, b) {
    if (a.value > b.value) {
        return 1
    }
    if (a.value < b.value) {
        return -1
    }
    return 0
})

// container for the resulting order
var result = mapped.map(function (el) {
    return list[el.index]
})

function scan_array(arr) {
    // c('\n Listing Stored Events: \n')
    for (var key in arr) { // 这个是关键
        if (typeof (arr[key]) === 'array' || typeof (arr[key]) === 'object') { // 递归调用
            scan_array(arr[key])
        } else {
            console.log('      ' + key + ' --- ' + arr[key])
        }
    }
    console.log('\n                ------- \n')
}
scan_array(result)
