const maxArrivalTime = 60; // in minutes

const ArrivalConfig = {
  //refreshInterval: 30000,

  // Need to handle clapham junction for overground via destinationFilter 
  // becaue this api call returns the wrong destination naptan id: https://api.tfl.gov.uk/StopPoint/910GFNCHLYR/ArrivalDepartures?lineIds=mildmay
  // It return 910GCLPHMJ1 which does not work here https://api.tfl.gov.uk/StopPoint/910GFNCHLYR/DirectionTo/910GCLPHMJ1?mildmay
  // because the correct naptan id for Clapham Junction Mildmay line is 910GCLPHMJC and not 910GCLPHMJ1
  
  directions: {
    Southbound: [
      {
        linesWithStatus: ['jubilee', 'thameslink', 'mildmay', 'metropolitan', 'victoria']
      },
      {
        stopId: '490012230S',
        name: 'Somerton Road',
        lines: [
          { line: 'C11', maxArrivalTime },
          { line: '189', maxArrivalTime }
        ],
      },
      {
        stopId: '490015253T',
        name: 'Cricklewood Lane',
        lines: [
          { line: 'C11', maxArrivalTime },
        ],
      },
      {
        stopId: '910GCRKLWD',
        name: 'Cricklewood Thameslink',
        lines: [{ line: 'thameslink', maxArrivalTime }],
        mode: 'rail',
        destinationStation: '940GZZLUKSX'
      },
      {
        stopId: '910GWHMDSTD',
        name: 'West Hampstead Overground',
        lines: [{ line: 'mildmay', maxArrivalTime }],
        mode: 'overground',
        directionFilter: [true, ['inbound']],
        destinationFilter: [false, ['clapham']] 
      },
      {
        stopId: '940GZZLUWHP',
        name: 'West Hampstead Tube',
        lines: [],
        mode: 'tube',
        directionFilter: [true, ['outbound']],
      },
    ],
    Northbound: [
      {
        stopId: '490012230N',
        name: 'Somerton Road',
        lines: [
          { line: 'C11', maxArrivalTime },
          { line: '189', maxArrivalTime }
        ],
      },
    ],
    'Northbound WH': [
      {
        stopId: '490001330N',
        name: 'West Hampstead',
        lines: [
          { line: 'C11', maxArrivalTime },
        ],
      },
      {
        stopId: '490001038N',
        name: 'Brondesbury',
        lines: [
          { line: '189', maxArrivalTime },
        ],
      },
      {
        stopId: '910GWHMPSTM',
        name: 'West Hampstead Thameslink',
        lines: [{ line: 'thameslink', maxArrivalTime }],
        mode: 'rail',
        destinationStation: '910GCRKLWD'
      },
    ],
    'Brent Cross West': [
      {
        stopId: '490012230N',
        name: 'Somerton Road',
        lines: [
          { line: '189', maxArrivalTime },
        ],
      },
      {
        stopId: '490002314YY',
        name: 'Brent Cross West',
        lines: [
          { line: '189', maxArrivalTime },
        ],
        directionFilter: [true, ['outbound']],
      },
      {
        stopId: '910GBRENTX',
        name: 'Brent Cross West Thameslink Southbound',
        lines: [{ line: 'thameslink', maxArrivalTime }],
        mode: 'rail',
        destinationStation: '940GZZLUKSX'
      },
      {
        stopId: '910GBRENTX',
        name: 'Brent Cross West Thameslink Northbound',
        lines: [{ line: 'thameslink', maxArrivalTime }],
        mode: 'rail',
        destinationStation: '910GSTALBCY'
      }
    ],
    'Drayton Park': [
      {
        linesWithStatus: ['mildmay', 'victoria', 'thameslink']
      },
      {
        stopId: '910GDRYP',
        name: 'Drayton Park Southbound',
        lines: [{ line: '', maxArrivalTime }],
        mode: 'rail',
        destinationStation: '940GZZLUHAI'
      },
      {
        stopId: '910GHGHI',
        name: 'Highbury and Islington Overground Mildmay',
        lines: [{line: 'mildmay', maxArrivalTime}],
        mode: 'overground',
        directionFilter: [true, ['outbound']],
      },
      {
        stopId: '9100STPXBOX',
        name: 'St Pancras Thameslink',
        lines: [{ line: 'thameslink', maxArrivalTime }],
        mode: 'rail',
        destinationStation: '910GCRKLWD'
      },
    ],
    'Finchley Road': [
      {
        linesWithStatus: ['jubilee', 'metropolitan', 'mildmay']
      },
      {
        stopId: '490000082R',
        name: 'Finchely Road WestBound',
        lines: [
          { line: 'C11', maxArrivalTime },
        ],
      },
      {
        stopId: '490000082FK',
        name: 'Finchely Road Northbound',
        lines: [
          { line: '113', maxArrivalTime },
        ],
      },
      {
        stopId: '490001330N',
        name: 'West Hampstead',
        lines: [
          { line: 'C11', maxArrivalTime },
        ],
      },
      {
        stopId: '490001038N',
        name: 'Brondesbury',
        lines: [
          { line: '189', maxArrivalTime },
        ],
      },
      {
        stopId: '910GWHMPSTM',
        name: 'West Hampstead Thameslink',
        lines: [{ line: 'thameslink', maxArrivalTime }],
        mode: 'rail',
        destinationStation: '910GCRKLWD'
      },
      {
        stopId: '490001109FD',
        name: 'Finchely Road & Frognal Northbound',
        lines: [
          { line: '113', maxArrivalTime },
        ],
      },
      {
        stopId: '910GFNCHLYR',
        name: 'Finchley Road & Frognal Overground Mildmay Westbound',
        lines: [{line: 'mildmay', maxArrivalTime}],
        mode: 'overground',
        directionFilter: [true, ['outbound']],
      },
      {
        stopId: '910GFNCHLYR',
        name: 'Finchley Road & Frognal Overground Mildmay Eastbound',
        lines: [{line: 'mildmay', maxArrivalTime}],
        mode: 'overground',
        directionFilter: [true, ['inbound']],
         destinationFilter: [false, ['clapham']]
      },
    ],
    'Richmond': [
      {
        linesWithStatus: ['mildmay', 'jubilee', 'metropolitan', 'district']
      },
      {
        stopId: '490011931S',
        name: 'Mill Lane',
        lines: [
          { line: 'C11', maxArrivalTime },
        ],
      },
      {
        stopId: '910GWHMDSTD',
        name: 'West Hampstead Overground Mildmay Eastbound',
        lines: [{line: 'mildmay', maxArrivalTime}],
        mode: 'overground',
        directionFilter: [true, ['outbound']],
        destinationFilter:[true, ['richmond']]
      },
      {
        stopId: '490000192D',
        name: 'Richmond',
        lines: [
          { line: '65', maxArrivalTime },
          { line: '371', maxArrivalTime },
        ],
        mixSortedDepartureTimes: true
      },
      {
        stopId: '9100WATRLMN1',
        name: 'Waterloo',
        lines: [{ line: 'south-western-railway', maxArrivalTime }],
        mode: 'rail',
        destinationStation: '9100RICHMND1'
      },
    ],
    'Deutsche Schule': [
      {
        linesWithStatus: ['mildmay', 'jubilee', 'metropolitan', 'district']
      },
      {
        stopId: '490010969N',
        name: 'Sudbrook Lane',
        lines: [
          { line: '65', maxArrivalTime },
          { line: '371', maxArrivalTime },
        ],
        mixSortedDepartureTimes: true
      },
      {
        stopId: '910GRICHMND',
        name: 'Richmond Overground Mildmay Northbound',
        lines: [{line: 'mildmay', maxArrivalTime}],
        mode: 'overground',
        //directionFilter: [true, ['inbound']],
      },
      {
        stopId: '490001330N',
        name: 'West Hampstead',
        lines: [
          { line: 'C11', maxArrivalTime },
        ],
      },
      {
        stopId: '9100RICHMND1',
        name: 'Richmond South-Western Railway',
        lines: [{ line: 'south-western-railway', maxArrivalTime }],
        mode: 'rail',
        destinationStation: '9100WATRLMN1'
      },
    ]
  }
};

const PageConfigs = {
  somerton_road_southbound: {
    headline: "Somerton Road (Southbound)",
    directionKey: "Southbound",
  },
  wh_brondesbury_northbound: {
    headline: "WH and Brondesbury (Northbound)",
    directionKey: "Northbound WH",
  },
  somerton_road_northbound: {
    headline: "Somerton Road (Northbound)",
    directionKey: "Northbound",
  },  
  brent_cross_west: {
    headline: "Brent Cross West",
    directionKey: "Brent Cross West",
  },  
  drayton_park: {
    headline: "Drayton Park",
    directionKey: "Drayton Park",
  },  
  finchley_road:{
    headline: "Finchley Road",
    directionKey: "Finchley Road",
  },
  richmond:{
    headline: "Richmond",
    directionKey: "Richmond",
  },
  deutsche_schule:{
    headline: "Deutsche Schule",
    directionKey: "Deutsche Schule",
  }

};

