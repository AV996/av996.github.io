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

  // Initial render
  await renderArrivalStops(stops);

  // Set up refresh interval with mobile-friendly timing
  if (ArrivalConfig.refreshInterval) {
    setInterval(async () => {
      await renderArrivalStops(stops);
    }, ArrivalConfig.refreshInterval);
  }
});

async function renderArrivalStops(stopConfigs) {
  const container = document.getElementById("arrivals-container");
  
  // Show loading state
  container.innerHTML = '<div class="loading">Loading arrivals...</div>';

  // Handle line statuses first
  const statusEntry = stopConfigs.find(entry => entry.linesWithStatus);
  if (statusEntry && statusEntry.linesWithStatus) {
    await renderLineStatuses(statusEntry.linesWithStatus);
  }

  // Clear loading state
  container.innerHTML = "";

  // Render stops with mobile optimization
  let isFirstStop = true;
  
  for (const stop of stopConfigs) {
    if (stop.linesWithStatus) {
      continue;
    }
    
    const stopDiv = await renderSingleStop(stop, isFirstStop);
    container.appendChild(stopDiv);
    
    if (isFirstStop) {
      // Mobile rendering fix for first element
      requestAnimationFrame(() => {
        stopDiv.offsetHeight; // Force reflow
        stopDiv.classList.add('loaded');
      });
      isFirstStop = false;
    }
  }
}

async function renderSingleStop(stop, isFirst = false) {
  const stopId = stop.stopId;
  const div = document.createElement("div");
  div.className = "stop-block";
  
  // Add mobile-specific class for first element
  if (isFirst) {
    div.classList.add('first-stop');
  }

  const stopName = stop.name || "Unnamed Stop";
  const title = document.createElement("h2");
  title.textContent = stopName;
  div.appendChild(title);

  const ul = document.createElement("ul");
  div.appendChild(ul);

  const mode = stop.mode || "bus";

  try {
    if (!stop.lines || stop.lines.length === 0) {
      const arrivals = await fetchArrivals(stopId, mode);
      renderArrivalsToList(ul, arrivals, stop.directionFilter);
    } else {
      // Handle multiple lines with better error handling
      const arrivalPromises = stop.lines.map(async (lineConfig) => {
        try {
          let arrivals;
          if (mode === 'rail') {
            arrivals = await fetchNationalRailArrivals(stopId, stop);
          } else {
            arrivals = await fetchArrivals(stopId, mode, lineConfig.line);
          }
          return { arrivals, lineConfig };
        } catch (error) {
          console.error(`Error fetching arrivals for line ${lineConfig.line}:`, error);
          return { arrivals: [], lineConfig };
        }
      });

      const results = await Promise.all(arrivalPromises);
      
      // Combine all arrivals
      const allArrivals = [];
      results.forEach(({ arrivals, lineConfig }) => {
        if (arrivals && arrivals.length > 0) {
          renderArrivalsToList(ul, arrivals, stop.directionFilter, lineConfig);
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

  return div;
}

async function fetchArrivals(stopId, mode = "bus", line = null) {
  const url = `https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals`;
  
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
    let filtered = arrivals;
    
    if (line) {
      filtered = arrivals.filter((a) => a.lineName.toLowerCase() === line.toLowerCase());
    }
    
    return filtered;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error(`Request timeout for ${stopId}`);
    } else {
      console.error(`Failed to fetch arrivals for ${stopId}`, err);
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

    const data = data_raw.journeys.map(journey => {
      const leg = journey.legs?.[0];
      if (!leg) return null;

      const departureTime = new Date(journey.startDateTime);
      const minutes = Math.round((departureTime - now) / 60000);

      return {
        destinationName: leg.arrivalPoint?.commonName || "Unknown",
        timeToStation: minutes * 60,
        departureTime: departureTime,
        platform: leg.departurePlatform || "N/A",
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

function renderArrivalsToList(ul, arrivals, directionFilter, lineConfig) {
  // Enhanced filtering with better mobile performance
  const filteredArrivals = arrivals.filter((a) => {
    let directionFilterResult = true;
    if (directionFilter) {  
      if (directionFilter[0]) {
        directionFilterResult = directionFilter[1].some(term => 
          a.direction.toLowerCase().includes(term.toLowerCase())
        );
      } else {
        directionFilterResult = !directionFilter[1].some(term => 
          a.direction.toLowerCase().includes(term.toLowerCase())
        );
      }
    } 

    let lineFilterResult = true;
    if (lineConfig && lineConfig.lineName) {
      lineFilterResult = a.lineName.toLowerCase() === lineConfig.line.toLowerCase();
    }

    // Check if maxArrivalTime is defined, use default if not
    const maxTime = typeof maxArrivalTime !== 'undefined' ? maxArrivalTime : 60; // 60 minutes default
    
    return a.timeToStation/60 <= maxTime 
           && a.timeToStation > 0 
           && directionFilterResult
           && lineFilterResult;
  });

  // Sort by arrival time
  filteredArrivals.sort((a, b) => a.timeToStation - b.timeToStation);
 
  if (filteredArrivals.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No upcoming arrivals.";
    li.style.color = "#666";
    ul.appendChild(li);
    return;
  }

  // Limit results on mobile to prevent performance issues
  const maxResults = window.innerWidth < 768 ? 10 : 15;
  const limitedArrivals = filteredArrivals.slice(0, maxResults);

  limitedArrivals.forEach((arrival) => {
    const li = document.createElement("li");
    const minutes = Math.round(arrival.timeToStation / 60);
    const arrivalTime = arrival.expectedArrivalTime
      ? formatTime(new Date(arrival.expectedArrivalTime))
      : formatTime(new Date(Date.now() + arrival.timeToStation * 1000));

    // Mobile-friendly formatting
    const lineName = capitalizeLineName(arrival.lineName);
    const destination = arrival.destinationName;
    
    li.innerHTML = `${lineName} to ${destination} – <strong>${minutes} min</strong> <span style="color: #666;">(${arrivalTime})</span>`;
    ul.appendChild(li);
  });
}

async function renderLineStatuses(lines) {
  const statusContainerId = "line-status";
  let container = document.getElementById(statusContainerId);

  if (!container) {
    container = document.createElement("div");
    container.id = statusContainerId;
    container.className = "line-status";
    document.body.insertBefore(container, document.getElementById("arrivals-container"));
  }

  const url = `https://api.tfl.gov.uk/Line/${lines.join(",")}/Status`;

  try {
    // Add timeout for mobile networks
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();
    container.innerHTML = "";
    
    data.forEach((line) => {
      const div = document.createElement("div");
      const status = line.lineStatuses[0]?.statusSeverityDescription || "Unknown";
      const statusColor = getStatusColor(status);
      
      div.innerHTML = `<strong>${capitalizeLineName(line.id)} Line</strong>: <span style="color: ${statusColor}">${status}</span>`;
      container.appendChild(div);
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error("Line status request timeout");
    } else {
      console.error("Failed to fetch line statuses", err);
    }
    
    // Show error state
    container.innerHTML = '<div style="color: #dc3545;">Unable to load line status</div>';
  }
}

function getStatusColor(status) {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('good') || statusLower.includes('running')) return '#28a745';
  if (statusLower.includes('delay') || statusLower.includes('disruption')) return '#ffc107';
  if (statusLower.includes('suspended') || statusLower.includes('closed')) return '#dc3545';
  return '#6c757d';
}

function capitalizeLineName(name) {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Mobile-specific optimizations
if ('connection' in navigator) {
  // Adjust refresh rate based on connection speed
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection && connection.effectiveType === 'slow-2g') {
    console.log('Slow connection detected, consider reducing refresh frequency');
  }
}

// Handle visibility change to pause/resume updates when tab is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('Page hidden, pausing updates');
    // Could pause interval here if needed
  } else {
    console.log('Page visible, resuming updates');
    // Could resume interval here if needed
  }
});