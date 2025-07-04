const maxArrivalTime = 60; // in minutes

const ArrivalConfig = {
  //refreshInterval: 30000,
  directions: {
    Southbound: [
      {
        linesWithStatus: ['victoria', 'jubilee']
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
        linesWithStatus: ['victoria']
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
        name: 'Highbury and Islington Overground Milmay',
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
};

