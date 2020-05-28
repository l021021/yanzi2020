/*
var GeoJSON = require('geojson')
var FS = require('fs')

let jsonData = JSON.parse(FS.readFileSync('.//json//geojson.json', 'utf8'))

console.log(jsonData)

*/

const UUID = require('uuid-js')

let propertiesObj = {
    "type": "poi.device.sensor", // Required (see 2.1)
    "name": "Presidential bedroom moisture sensor 4",
    "parent": "181a32b8-1fb0-402e-9d96-5011e4bdc6a5", // Optional
    "typeprops": {
        "productType": "00414CDA", // Yanzi product type number
    },
    "custom": {
        "key": "value"
    }
}


class geojson {
    constructor(name = null, properties) {
        this.type = 'FeatureCollection'
        this.name = name
        this.properties = properties
        this.features = new Set()

    }

    addFeature(feature) {
        this.features.add(feature)
    }
}




class feature {
    constructor(geometry, properties) {
        this.type = 'Feature'
        this.id = UUID.create().toString()
        this.geometry = geometry
        this.properties = properties
    }

}
class geometry {
    constructor(type, coordinates) {
        this.type = type
        this.coordinates = coordinates
    }
}


let polygonA = new geometry("Polygon", [
    [17.94680470513721, 59.40193851043981],
    [17.946804493361245, 59.40193914824366],
    [17.946803893329335, 59.40193972316544],
    [17.94680294033748, 59.40194016333993],
    [17.94680177556966, 59.401940423851364],
    [17.946800504913853, 59.40194047775028],
    [17.94679926955404, 59.40194031605353],
    [17.946798193026208, 59.40193996571057],
    [17.94679739886633, 59.401939444687706],
    [17.94679699296239, 59.40193883383331],
    [17.94679699296239, 59.401938178063155],
    [17.94679739886633, 59.40193756720876],
    [17.946798193026208, 59.40193705516905],
    [17.94679926955404, 59.401936695842934],
    [17.946800504913853, 59.40193653414619],
    [17.94680177556966, 59.4019365880451],
    [17.94680294033748, 59.40193685753969],
    [17.946803893329335, 59.40193729771418],
    [17.946804493361245, 59.401937863652805],
    [17.94680470513721, 59.40193851043981],
    [17.94680470513721, 59.40193851043981]
])

let feature_floor = new feature(polygonA, { "type": "area.floor" })

let geojsonA = new geojson()
geojsonA.addFeature(feature_floor)

console.log(geojsonA)
    /*
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

    */