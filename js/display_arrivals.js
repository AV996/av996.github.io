const maxArrivalTime =  3600

const config = {
  refreshInterval: 30000,  // 30 seconds in ms
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
        mode: 'national-rail',
      },
      '910GWHMDSTD': {
        name: 'West Hampstead Overground',
        lines: [],  // No specific lines, show all
        mode: 'overground',
        directionFilter: 'inbound',
      },
      '940GZZLUWHP': {
        name: 'West Hampstead Tube',
        lines: [],  // No specific lines, show all
        mode: 'tube',
        directionFilter: 'outbound',
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
        mode: 'national-rail',
      },
    },
  },
};

// fetchArrivals.js
async function fetchArrivals(stopId, options = {}) {
  // options: { lines: [], mode, directionFilter, maxTimeSeconds }

  const url = `https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch arrivals');
  let data = await res.json();

  // Filter by mode/direction if given (e.g. for Overground trains)
  if (options.directionFilter) {
    data = data.filter(
      arr => arr.direction && arr.direction.toLowerCase() === options.directionFilter.toLowerCase()
    );
  }

  // Filter by lines if provided
  if (options.lines && options.lines.length > 0) {
    data = data.filter(arr => options.lines.includes(arr.lineName));
  }

  // Filter by max time (seconds)
  if (options.maxTimeSeconds) {
    data = data.filter(arr => arr.timeToStation <= options.maxTimeSeconds);
  }

  // Sort ascending by timeToStation
  data.sort((a, b) => a.timeToStation - b.timeToStation);

  return data;
}

async function fetchNationalRailArrivals(stopId, lineId, direction = '') {
  const url = `https://api.tfl.gov.uk/StopPoint/${stopId}/ArrivalDepartures?lineIds=${lineId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch National Rail arrivals');
  const data = await res.json();

  const excludedTerms = ['albans', 'luton', 'bedford'];

  return data
    .filter(dep => {
      if (direction === 'Southbound') {
        const dest = (dep.destinationName || '').toLowerCase();
        return !excludedTerms.some(term => dest.includes(term));
      }
      if (direction.includes('Northbound')) {
        const dest = (dep.destinationName || '').toLowerCase();
        return excludedTerms.some(term => dest.includes(term));
      }
      return true;
    })
    .map(dep => {
      const depTime = new Date(dep.estimatedTimeOfDeparture || dep.scheduledTimeOfDeparture);
      const minutes = Math.round((depTime - new Date()) / 60000);

      return {
        destinationName: dep.destinationName,
        timeToStation: minutes * 60,
        departureTime: depTime,
        platform: dep.platformName,
        lineName: lineId,
        cause: dep.cause,
        departureStatus: dep.departureStatus,
      };
    }).sort((a, b) => a.timeToStation - b.timeToStation);
}

async function fetchLineStatuses(lineIds) {
  const url = `https://api.tfl.gov.uk/Line/${lineIds.join(',')}/Status`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch line status');
  return await res.json();
}

function getStorageKey(type, id) {
  return `details-open-${type}-${id}`;
}

function restoreDetailsState(detailsEl, key) {
  const saved = localStorage.getItem(key);
  if (saved === null) {
    // First time: open all
    detailsEl.open = true;
  } else {
    detailsEl.open = saved === 'true';
  }
}

function saveDetailsState(detailsEl, key) {
  detailsEl.addEventListener('toggle', () => {
    localStorage.setItem(key, detailsEl.open);
  });
}

async function buildUI(directionToRender) {
  const container = document.getElementById('arrivals');
  container.innerHTML = '';

  const stops = config.directions[directionToRender];
  if (!stops) {
    container.textContent = `No configuration found for direction: ${directionToRender}`;
    return;
  }

  // Fetch and display line statuses at the top
if (stops.linesWithStatus?.length > 0) {
  const statusData = await fetchLineStatuses(stops.linesWithStatus);

  statusData.forEach(status => {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'line-status';

    const lineName = document.createElement('h2');
    lineName.textContent = `${status.name} Line: `;
    //statusDiv.appendChild(lineName);

    status.lineStatuses.forEach(s => {
      //const statusMsg = document.createElement('div');
      //statusMsg.textContent = `${s.statusSeverityDescription}${s.reason ? ' – ' + s.reason : ''}`;
      lineName.textContent += `${s.statusSeverityDescription}${s.reason ? ' – ' + s.reason : ''}`;
      //statusDiv.appendChild(statusMsg);
    });
    statusDiv.appendChild(lineName);

    container.appendChild(statusDiv);
  });
}

  const directionContainer = document.createElement('div');
  directionContainer.className = 'direction-container';

  const directionTitle = document.createElement('h1');
  directionTitle.textContent = directionToRender;
  directionContainer.appendChild(directionTitle);

  for (const [stopId, stopInfo] of Object.entries(stops)) {
    if (stopId == 'linesWithStatus'){
      continue
    }
    const stopDetails = document.createElement('details');
    const stopKey = getStorageKey('stop', stopId);
    restoreDetailsState(stopDetails, stopKey);
    saveDetailsState(stopDetails, stopKey);

    const stopSummary = document.createElement('summary');
    stopSummary.textContent = stopInfo.name;
    stopSummary.classList.add('stop-summary'); // style it as needed
    stopDetails.appendChild(stopSummary);

    let arrivals;
    try {
      const linesForFetch = stopInfo.lines.length > 0
        ? stopInfo.lines.map(l => l.line)
        : [];

        if (stopInfo.mode === 'national-rail') {
    arrivals = [];
    for (const lineId of linesForFetch) {
      const lineArrivals = await fetchNationalRailArrivals(stopId, lineId, directionToRender);
      arrivals.push(...lineArrivals);
    }
    } else {

      arrivals = await fetchArrivals(stopId, {
        lines: linesForFetch,
        mode: stopInfo.mode,
        directionFilter: stopInfo.directionFilter,
        maxTimeSeconds: maxArrivalTime,
      });
    } }
    catch (e) {
      const errDiv = document.createElement('div');
      errDiv.textContent = `Failed to load arrivals for ${stopInfo.name}`;
      stopDetails.appendChild(errDiv);
      directionContainer.appendChild(stopDetails);
      continue;
    }

    const linesToShow = stopInfo.lines.length > 0
      ? stopInfo.lines
      : [...new Set(arrivals.map(a => a.lineName))].map(line => ({ line, maxArrivalTime: maxArrivalTime }));

    const lineGroup = document.createElement('div');
    lineGroup.className = 'line-group'; // add margin/padding via CSS

    for (const { line, maxArrivalTime } of linesToShow) {
      const lineDetails = document.createElement('details');
      const lineKey = getStorageKey('line', `${stopId}-${line}`);
      restoreDetailsState(lineDetails, lineKey);
      saveDetailsState(lineDetails, lineKey);

      const lineSummary = document.createElement('summary');
      lineSummary.textContent = `Line ${line}`;
      lineDetails.appendChild(lineSummary);

      const lineArrivals = arrivals.filter(a => a.lineName === line && a.timeToStation <= maxArrivalTime);

      if (lineArrivals.length === 0) {
        const noData = document.createElement('div');
        noData.className = 'no-arrivals';
        noData.textContent = 'No upcoming arrivals.';
        lineDetails.appendChild(noData);
      } else {
        lineArrivals.forEach(arrival => {
          const arrivalDiv = document.createElement('div');
          arrivalDiv.className = 'arrival';
          arrivalDiv.innerHTML = `
            <strong>To ${arrival.destinationName}</strong><br>
            Arriving in <strong>${Math.round(arrival.timeToStation / 60)} min</strong>`;
          if (arrival.departureTime) {
                arrivalDiv.innerHTML += ` at ${arrival.departureTime.toLocaleTimeString('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})}`;
            };
            if (arrival.expectedArrival) {
                arrivalDiv.innerHTML += ` at ${new Date(arrival.expectedArrival).toLocaleTimeString('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})}`;
}
            lineDetails.appendChild(arrivalDiv);
        });
      }

      lineGroup.appendChild(lineDetails);
    }

    stopDetails.appendChild(lineGroup);
    directionContainer.appendChild(stopDetails);
  }

  container.appendChild(directionContainer);
}

//buildUI();
//setInterval(buildUI, config.refreshInterval);