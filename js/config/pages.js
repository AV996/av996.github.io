const maxArrivalTime = 60; //in minutes

const ArrivalConfig = {
  //refreshInterval: 30000,
  directions: {
    Southbound: {
      linesWithStatus: ['victoria', 'jubilee'],
      '490012230S': {
        name: 'Somerton Road',
        lines: [
          { line: 'C11', maxArrivalTime: maxArrivalTime },  
          { line: '189', maxArrivalTime: maxArrivalTime }   
        ],
      },
      '490015253T':{
            name: 'Cricklewood Lane',
            lines: [
          { line: 'C11', maxArrivalTime: maxArrivalTime  },  
        ],
      },
      '910GCRKLWD': {
        name: 'Cricklewood Thameslink',
        lines: [{ line: 'thameslink', maxArrivalTime: maxArrivalTime }],
        mode: 'thameslink',
        destinationStation: '940GZZLUKSX'
      },
      '910GWHMDSTD': {
        name: 'West Hampstead Overground',
        lines: [],  // No specific lines, show all
        mode: 'overground',
        directionFilter: [true,['inbound']], //true as want 'inbound'
      },
      '940GZZLUWHP': {
        name: 'West Hampstead Tube',
        lines: [],  // No specific lines, show all
        mode: 'tube',
        directionFilter: [true,['outbound']],
      },
    },
    Northbound: {
      '490012230N': {
        name: 'Somerton Road',
        lines: [
          { line: 'C11', maxArrivalTime: maxArrivalTime },
          { line: '189', maxArrivalTime: maxArrivalTime }
        ],
      },
    },
    'Northbound WH': {
      '490001330N': {
        name: 'West Hampstead',
        lines: [
          { line: 'C11', maxArrivalTime: maxArrivalTime },
        ],
      },
      '490001038N': {
        name: 'Brondesbury',
        lines: [
          { line: '189', maxArrivalTime: maxArrivalTime },
        ],
      },
      '910GWHMPSTM': { 
        name: 'West Hampstead Thameslink',
        lines: [{ line: 'thameslink', maxArrivalTime: maxArrivalTime }],
        mode: 'thameslink',
        destinationStation: '910GCRKLWD'
      },
    },
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
};

