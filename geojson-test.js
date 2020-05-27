var GeoJSON = require('geojson')
var FS = require('fs')

let jsonData = JSON.parse(FS.readFileSync('.//json//geojson.json', 'utf8'))

console.log(jsonData)

var singleobject = [{
        type: "area.floor",
        name: "Sugarcube",
        polygon: [
            [
                [121.502596847712,
                    31.267734758402
                ],
                [121.502910330891,
                    31.267734758402
                ],
                [121.502910330891,
                    31.26763114949
                ],
                [121.502596847712,
                    31.26763114949
                ],
                [121.502596847712,
                    31.267734758402
                ]
            ]

        ]
    }, {
        type: "area.section",
        name: "Openplan",
        polygon: [
            [
                [121.502853333949,
                    31.267670520877
                ],
                [121.502910330891,
                    31.267670520877
                ],
                [121.502910330891,
                    31.26763114949
                ],
                [121.502853333949,
                    31.26763114949
                ],
                [121.502853333949,
                    31.267670520877
                ]
            ]
        ]
    }, {
        type: "area.room",
        name: "Sugar1",
        polygon: [
            [
                [121.502596847712,
                    31.267734758402
                ],
                [121.502910330891,
                    31.267734758402
                ],
                [121.502910330891,
                    31.26763114949
                ],
                [121.502596847712,
                    31.26763114949
                ],
                [121.502596847712,
                    31.267734758402
                ]
            ]

        ]
    }

]


var data = [
    { name: 'Location A', category: 'Store', street: 'Market', lat: 39.984, lng: -75.343, id: "5b3eb346-e2ee-4cf4-a5e5-a0cbdc2030ef" },
    { name: 'Location B', category: 'House', street: 'Broad', lat: 39.284, lng: -75.833, id: "5b3eb346-e2ee-4cf4-a5e5-a0cbdc2030ef" },
    { name: 'Location C', category: 'Office', street: 'South', lat: 39.123, lng: -74.534, id: "5b3eb346-e2ee-4cf4-a5e5-a0cbdc2030ef" }
];
var data2 = [{
        x: 0.5,
        y: 102.0,
        prop0: 'value0'
    },
    {
        line: [
            [102.0, 0.0],
            [103.0, 1.0],
            [104.0, 0.0],
            [105.0, 1.0]
        ],
        prop0: 'value0',
        prop1: 0.0
    },
    {
        polygon: [
            [
                [100.0, 0.0],
                [101.0, 0.0],
                [101.0, 1.0],
                [100.0, 1.0],
                [100.0, 0.0]
            ]
        ],
        prop0: 'value0',
        prop1: { "this": "that" }
    }
];
var myjson = GeoJSON.parse(data2, { Point: ['lat', 'lng'] });
var myjson1 = GeoJSON.parse(data2, { 'Point': ['x', 'y'], 'LineString': 'line', 'Polygon': 'polygon' });

var myjson3 = GeoJSON.parse(singleobject, { 'Point': ['x', 'y'], 'LineString': 'line', 'Polygon': 'polygon' });
console.log(JSON.stringify(myjson) + '\n')
console.log(JSON.stringify(myjson1) + '\n')
console.log(JSON.stringify(myjson3) + '\n')