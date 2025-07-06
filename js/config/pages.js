const maxArrivalTime = 60; // in minutes

const ArrivalConfig = {
  //refreshInterval: 30000,
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
        lines: [],
        mode: 'overground',
        directionFilter: [true, ['inbound']],
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
        name: 'Finchely Road Northbound',
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
        stopId: '490001109FD',
        name: 'Finchely Road & Frognal Northbound',
        lines: [
          { line: '113', maxArrivalTime },
        ],
      },
      {
        stopId: '910GHGHI',
        name: 'Finchley Road & Frognal Overground Mildmay Westbound',
        lines: [{line: 'mildmay', maxArrivalTime}],
        mode: 'overground',
        directionFilter: [true, ['outbound']],
      },
      {
        stopId: '910GHGHI',
        name: 'Finchley Road & Frognal Overground Mildmay Eastbound',
        lines: [{line: 'mildmay', maxArrivalTime}],
        mode: 'overground',
        directionFilter: [true, ['inbound']],
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
        stopId: '9100WATRLMN1',
        name: 'Waterloo',
        lines: [{ line: 'south-western-railway', maxArrivalTime }],
        mode: 'rail',
        destinationStation: '9100RICHMND1'
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
  Richmond:{
    headline: "Richmond",
    directionKey: "Richmond",
  }
};

