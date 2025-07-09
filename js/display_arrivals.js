document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const pageKey = params.get("page");

  if (!pageKey || !PageConfigs[pageKey]) {
    document.getElementById("headline").textContent = "Invalid or missing page.";
    return;
  }

  const { headline, directionKey } = PageConfigs[pageKey];
  const stops = ArrivalConfig.directions[directionKey];

  if (!stops) {
    document.getElementById("headline").textContent = "Invalid direction config.";
    return;
  }

  document.getElementById("headline").textContent = headline;

  // Show loading state under headline
  const container = document.getElementById("arrivals-container");
  container.innerHTML = '<div style="text-align: left; padding: 10px 0; color: #666;">Loading...</div>';

  await renderArrivalStops(stops);

  if (ArrivalConfig.refreshInterval) {
    setInterval(async () => {
      await renderArrivalStops(stops);
    }, ArrivalConfig.refreshInterval);
  }
});

async function renderArrivalStops(stopConfigs) {
  const container = document.getElementById("arrivals-container");

  // Collect all API calls to execute in parallel
  const apiCalls = [];
  const callMetadata = [];

  // Handle line status calls
  const statusEntry = stopConfigs.find(entry => entry.linesWithStatus);
  if (statusEntry && statusEntry.linesWithStatus) {
    apiCalls.push(fetchLineStatuses(statusEntry.linesWithStatus));
    callMetadata.push({ type: 'lineStatus', lines: statusEntry.linesWithStatus });
  }

  // Handle arrival calls for each stop
  for (const stop of stopConfigs) {
    if (stop.linesWithStatus) {
      continue;
    }

    const stopId = stop.stopId;
    const mode = stop.mode || "bus";

    if (!stop.lines || stop.lines.length === 0) {
      // Single call for all arrivals at this stop
      apiCalls.push(fetchArrivals(stopId, mode));
      callMetadata.push({ 
        type: 'arrivals', 
        stopId, 
        stop, 
        mode,
        lines: null
      });
    } else if (mode === 'rail') {
      // National rail still needs separate calls per line due to different API structure
      for (const lineConfig of stop.lines) {
        apiCalls.push(fetchNationalRailArrivals(stopId, stop));
        callMetadata.push({ 
          type: 'nationalRail', 
          stopId, 
          stop, 
          mode,
          lineConfig 
        });
      }
    } else if (mode === 'overground') {
        for (const lineConfig of stop.lines) {
          apiCalls.push(fetchOvergroundArrivals(stopId, stop, lineConfig));
          callMetadata.push({ 
            type: 'overground', 
            stopId, 
            stop, 
            mode,
            lineConfig 
          });
        }
      } else {
      // Single call for all lines at this stop using comma-separated list
      const lineNames = stop.lines.map(l => l.line);
      apiCalls.push(fetchArrivals(stopId, mode, lineNames));
      callMetadata.push({ 
        type: 'arrivals', 
        stopId, 
        stop, 
        mode,
        lines: stop.lines
      });
    }
  }

  // Execute all API calls in parallel
  const results = await Promise.all(apiCalls);

  // Clear loading state before rendering
  container.innerHTML = "";

  // Process line status results
  const lineStatusResults = results.filter((_, index) => callMetadata[index].type === 'lineStatus');
  if (lineStatusResults.length > 0) {
    await renderLineStatusResults(lineStatusResults[0], callMetadata.find(m => m.type === 'lineStatus').lines);
  }

  // Process arrival results and render stops in original order
  let resultIndex = 0;
  for (const stop of stopConfigs) {
    if (stop.linesWithStatus) {
      continue;
    }

    // Find the corresponding result(s) for this stop
    const stopResults = [];
    while (resultIndex < results.length && resultIndex < callMetadata.length) {
      const metadata = callMetadata[resultIndex];
      if (metadata.type === 'lineStatus') {
        resultIndex++;
        continue;
      }
      
      if (metadata.stopId === stop.stopId) {
        stopResults.push({
          arrivals: results[resultIndex],
          metadata: metadata
        });
        resultIndex++;
        break;
      }
    }

    renderSingleStop(container, stop, stopResults);
  }
}

function renderSingleStop(container, stop, stopResults) {
  const stopId = stop.stopId;
  const div = document.createElement("div");
  div.className = "stop-block";

  const stopName = stop.name || "Unnamed Stop";
  const title = document.createElement("h2");
  title.textContent = stopName;
  div.appendChild(title);

  const ul = document.createElement("ul");
  div.appendChild(ul);

  try {
    if (stopResults.length === 0) {
      const errorLi = document.createElement("li");
      errorLi.textContent = "No arrivals data available.";
      errorLi.style.color = "#dc3545";
      ul.appendChild(errorLi);
    } else if (stop.mixSortedDepartureTimes) {
      // Combine all arrivals and sort them together
      const allArrivals = [];
      stopResults.forEach(result => {
        if (result.arrivals && result.arrivals.length > 0) {
          result.arrivals.forEach(arrival => {
            // Attach line config info to individual arrivals for filtering
            if (result.metadata.lines) {
              const matchingLineConfig = result.metadata.lines.find(l => 
                l.line.toLowerCase() === arrival.lineName.toLowerCase()
              );
              if (matchingLineConfig) {
                arrival.lineConfig = matchingLineConfig;
              }
            }
            allArrivals.push(arrival);
          });
        }
      });
      renderArrivalsToList(ul, allArrivals, stop, null);
    } else {
      // Render each result group
      stopResults.forEach(result => {
        // if (result.metadata.type === 'nationalRail') {
        //   // National rail - render with line config
        //   renderArrivalsToList(ul, result.arrivals, stop.directionFilter, result.metadata.lineConfig);
        // } else 
        if (result.metadata.lines) {
          // Multiple lines - render each line separately
          result.metadata.lines.forEach(lineConfig => {
            const lineArrivals = result.arrivals.filter(a => 
              a.lineName.toLowerCase() === lineConfig.line.toLowerCase()
            );
            renderArrivalsToList(ul, lineArrivals, stop, lineConfig);
          });
        } else {
          // Single call for all arrivals
          renderArrivalsToList(ul, result.arrivals, stop, result.metadata.lineConfig);
        }
      });
    }
  } catch (error) {
    console.error(`Error rendering stop ${stopName}:`, error);
    const errorLi = document.createElement("li");
    errorLi.textContent = "Error loading arrivals.";
    errorLi.style.color = "#dc3545";
    ul.appendChild(errorLi);
  }
  
  container.appendChild(div);
}

async function fetchArrivals(stopId, mode = "bus", lines = null) {
  let url = `https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals`;
  
  // Add line filter to URL if lines are specified
  if (lines) {
    const lineParams = Array.isArray(lines) ? lines.join(',') : lines;
      url += `?lineIds=${encodeURIComponent(lineParams)}`;
  }
  
  try {
    // Add timeout for mobile networks
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const arrivals = await res.json();
    return arrivals;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error(`Request timeout for ${stopId}`);
    } else {
    console.error(`Failed to fetch arrivals for ${stopId}`, err);
    }
    return [];
  }
}

async function fetchOvergroundArrivals(stopId, stopConfig, lineConfig) {
  const line = lineConfig.line;
  if (!line) {
    console.warn(`Missing line for overground stopId ${stopId}`);
    return [];
  }

  const url = `https://api.tfl.gov.uk/StopPoint/${stopId}/ArrivalDepartures?lineIds=${line}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 sec timeout
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const departures = await res.json();

    const now = new Date();

    const promises = departures.map(async (d) => {
      const expected = new Date(d.estimatedTimeOfDeparture);
      const secondsToArrival = Math.floor((expected - now) / 1000);

      let directionData = null;
      if(stopConfig.directionFilter){
        const direction_url = `https://api.tfl.gov.uk/StopPoint/${stopId}/DirectionTo/${d.destinationNaptanId}?${line}`;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 sec timeout
          const res = await fetch(direction_url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!res.ok) {
            //throw new Error(`HTTP error ${res.status}`);
            // do not throw because this gives the wrong destination naptan id: https://api.tfl.gov.uk/StopPoint/910GFNCHLYR/ArrivalDepartures?lineIds=mildmay
            // it return 910GCLPHMJ1 which does not work here https://api.tfl.gov.uk/StopPoint/910GFNCHLYR/DirectionTo/910GCLPHMJ1?mildmay
            // because the correct naptan id for Clapham Juncion Mildmay line is 910GCLPHMJC and not 910GCLPHMJ1
            console.error(`Failed to fetch direction data for ${stopId}: ${res.status}`);
            directionData = 'direction not found';
          } else {
            directionData = await res.json();
          }
        } catch (e) {
          if (e.name === 'AbortError') {
            console.error("Overground direction request timeout");
          } else {
            console.error("Failed to fetch Overground direction:", e);
          }
        }
      }
      return {
        destinationName: d.destinationName,
        timeToStation: secondsToArrival,
        expectedArrivalTime: expected,
        platform: d.platformName || "N/A",
        lineName: line,
        departureStatus: d.departureStatus || "",
        direction: directionData || d.direction || "", // fallback to d.direction if direction API fails
      };
    });

    const arrivals = await Promise.all(promises);
    return arrivals.filter(Boolean);
  } catch (e) {
    if (e.name === 'AbortError') {
      console.error("Overground request timeout");
    } else {
      console.error("Failed to fetch Overground arrivals:", e);
    }
    return [];
  }
}


async function fetchNationalRailArrivals(stopId, stopConfig) {
  const line = stopConfig.lines?.[0]?.line;
  const toStopId = stopConfig.destinationStation;

  if (!toStopId) {
    console.warn(`Missing destinationStation for stopId ${stopId}`);
    return [];
  }

  const url = `https://api.tfl.gov.uk/Journey/JourneyResults/${stopId}/to/${toStopId}?line=${line}&useRealTimeLiveArrivals=true&mode=national-rail&alternativeWalking=false`;

  try {
    // Add timeout for mobile networks
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for rail
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const data_raw = await res.json();
    const now = new Date();

    if (!Array.isArray(data_raw.journeys)) {
      console.warn("Unexpected format from JourneyResults API");
      return [];
    }

    data = data_raw.journeys.map(journey => {
      const leg = journey.legs?.[0];
      if (!leg) return null; 

      const departureTime = new Date(leg.departureTime);
      const minutes = Math.floor((departureTime - now) / 60000);

      return {
        destinationName: leg.arrivalPoint?.commonName || "Unknown",
        timeToStation: minutes * 60,
        departureTime: departureTime,
        //platform: leg.platformName || "N/A", //platform appears to always be empty
        lineName: leg.routeOptions?.[0]?.name || line,
        cause: leg.disruptions?.[0]?.description || "",
        departureStatus: minutes >= 0 ? "ON TIME" : "DELAYED",
        direction: leg.arrivalPoint?.commonName || "",
      };
    }).filter(Boolean);
    
    return data;
  } catch (e) {
    if (e.name === 'AbortError') {
      console.error("National rail request timeout");
    } else {
    console.error("Failed to fetch national rail arrivals via Journey API:", e);
    }
    return [];
  }
}

function renderArrivalsToList(ul, arrivals, stop, lineConfig) {
  const directionFilter = stop.directionFilter || null;
  arrivals = arrivals.filter(
    (a) => {
      let directionFilterResult = true
      if(directionFilter){  
        if(directionFilter[0]) {
          directionFilterResult = directionFilter[1].some(term => a.direction.toLowerCase().includes(term.toLowerCase()))
        } else {
          directionFilterResult = !directionFilter[1].some(term => a.direction.toLowerCase().includes(term.toLowerCase()))
        }
      } 
      directionFilterResult = directionFilterResult || a.direction === 'direction not found'

      let lineFilterResult = true
      if(lineConfig && lineConfig.lineName){
        lineFilterResult = a.lineName.toLowerCase() === lineConfig.line.toLowerCase()
      }

      let destinationFilterResult = true
      if(stop && stop.destinationFilter){
        if(stop.destinationFilter[0]) {
          destinationFilterResult = stop.destinationFilter[1].some(term => a.destinationName.toLowerCase().includes(term.toLowerCase()))
        } else {
          destinationFilterResult = !stop.destinationFilter[1].some(term => a.destinationName.toLowerCase().includes(term.toLowerCase()))
        }
      }

      // Handle case where lineConfig is attached to individual arrivals (for mixed sorting)
      const effectiveLineConfig = lineConfig || a.lineConfig;
      const maxTime = effectiveLineConfig?.maxArrivalTime || maxArrivalTime;
      filter = a.timeToStation/60 <= maxTime 
              && a.timeToStation > 0 
              && directionFilterResult
              && lineFilterResult
              && destinationFilterResult;
      return (filter)
    }
  )

  arrivals = arrivals.sort((a, b) => a.timeToStation - b.timeToStation);
 
  if (arrivals.length === 0) {
    const li = document.createElement("li");
    if(lineConfig && lineConfig.line){
      li.textContent += lineConfig.line + ": ";
    }
    const maxTime = lineConfig?.maxArrivalTime || maxArrivalTime;
    li.textContent += "No upcoming arrivals in the next " + maxTime + " minutes.";
    li.style.color = "#ffc107";
    ul.appendChild(li);
    return;
  }

  arrivals.forEach((arrival) => {
    const li = document.createElement("li");
          const minutes = Math.floor(arrival.timeToStation / 60);
    const arrivalTime = arrival.expectedArrivalTime
      ? formatTime(new Date(arrival.expectedArrivalTime))
      : formatTime(new Date(Date.now() + arrival.timeToStation * 1000));

    const platformText = arrival.platform ? ` | Platform ${arrival.platform}` : '';
    li.innerHTML = `${capitalizeLineName(arrival.lineName)} to ${arrival.destinationName}${platformText} – <strong>${minutes} min</strong> (${arrivalTime})`; 
    ul.appendChild(li);
  });
}

async function fetchLineStatuses(lines) {
  const url = `https://api.tfl.gov.uk/Line/${lines.join(",")}/Status`;

  try {
    // Add timeout for mobile networks
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error("Line status request timeout");
    } else {
    console.error("Failed to fetch line statuses", err);
    }
    return null;
  }
}

async function renderLineStatusResults(data, lines) {
  const statusContainerId = "line-status";
  let container = document.getElementById(statusContainerId);

  if (!container) {
    container = document.createElement("div");
    container.id = statusContainerId;
    container.className = "line-status";
    document.body.insertBefore(container, document.getElementById("arrivals-container"));
  }

  if (!data) {
    container.innerHTML = '<div style="color: #dc3545;">Unable to load line status</div>';
    return;
  }

  container.innerHTML = "";

  // Create a lookup for ordering
  const orderMap = Object.fromEntries(lines.map((id, index) => [id, index]));
  // Sort based on the index in `lines`
  data.sort((a, b) => (orderMap[a.id] ?? Infinity) - (orderMap[b.id] ?? Infinity));
  
  data.forEach((line) => {
    const div = document.createElement("div");
    const status = line.lineStatuses[0]?.statusSeverityDescription || "Unknown";
    const statusColor = getStatusColor(status);
    
    div.innerHTML = `<strong>${capitalizeLineName(line.id)} Line</strong>: <span style="color: ${statusColor}">${status}</span>`;
    container.appendChild(div);
  });
}

function getStatusColor(status) {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('good') || statusLower.includes('running')) return '#28a745';
  if (statusLower.includes('delay') || statusLower.includes('disruption')) return '#ffc107';
  if (statusLower.includes('suspended') || statusLower.includes('closed')) return '#dc3545';
  return '#dc3545';
}

function capitalizeLineName(name) {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}