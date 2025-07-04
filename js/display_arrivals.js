
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

  await renderArrivalStops(stops);

  if (ArrivalConfig.refreshInterval) {
    setInterval(async () => {
      await renderArrivalStops(stops);
    }, ArrivalConfig.refreshInterval);
  }
});

async function renderArrivalStops(stopConfig) {
  const container = document.getElementById("arrivals-container");
  container.innerHTML = "";

  if (stopConfig.linesWithStatus) {
    await renderLineStatuses(stopConfig.linesWithStatus);
  }

  for (const [stopId, stop] of Object.entries(stopConfig)) {
    if (stopId === "linesWithStatus") continue;

    const div = document.createElement("div");
    div.className = "stop-block";

    const stopName = stop.name || "Unnamed Stop";
    const title = document.createElement("h2");
    title.textContent = stopName;
    div.appendChild(title);

    const ul = document.createElement("ul");
    div.appendChild(ul);

    const mode = stop.mode || "bus";
    const fetchFn = mode === "thameslink" ? fetchNationalRailArrivals : fetchArrivals;

    if (!stop.lines || stop.lines.length === 0) {
      const arrivals = await fetchFn(stopId, mode);
      renderArrivalsToList(ul, arrivals, stop.directionFilter);
    } else {
      for (const lineConfig of stop.lines) {
        const arrivals = await fetchFn(stopId, mode, lineConfig.line);
        const filtered = arrivals.filter(
          (arrival) =>
            arrival.lineName.toLowerCase() === lineConfig.line.toLowerCase() &&
            arrival.timeToStation <= lineConfig.maxArrivalTime * 60
        );
        renderArrivalsToList(ul, filtered, stop.directionFilter);
      }
    }

    container.appendChild(div);
  }
}

async function fetchArrivals(stopId, mode = "bus", line = null) {
  const url = `https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals`;
  try {
    const res = await fetch(url);
    const arrivals = await res.json();
    let filtered = arrivals;
    if (line) {
      filtered = arrivals.filter((a) => a.lineName.toLowerCase() === line.toLowerCase());
    }
    filtered//.sort((a, b) => a.timeToStation - b.timeToStation);
    return filtered;
  } catch (err) {
    console.error(`Failed to fetch arrivals for ${stopId}`, err);
    return [];
  }
}

async function fetchNationalRailArrivals(stopId, line) {
  const url = `https://api.tfl.gov.uk/StopPoint/${stopId}/ArrivalDepartures?lineIds=${line}`;
  try {
    const res = await fetch(url);
    const data_raw = await res.json();
    const data = data_raw.map(dep => {
      const depTime = new Date(dep.estimatedTimeOfDeparture);
      const minutes = Math.round((depTime - new Date()) / 60000);

      return {
        destinationName: dep.destinationName,
        timeToStation: minutes * 60,
        departureTime: depTime,
        platform: dep.platformName,
        lineName: line,
        cause: dep.cause,
        departureStatus: dep.departureStatus,
        direction: dep.destinationName
      };
    })
  } catch (e) {
    console.error("Failed to fetch national rail arrivals:", e);
    return [];
  }
}

function renderArrivalsToList(ul, arrivals, directionFilter) {
  arrivals = arrivals.filter(
    (a) => {
      directionFilterResult = true//directionFilter ? directionFilter.some(term => a.direction != '' && term.includes(a.direction.toLowerCase())) : true
      if(directionFilter){  
        if(directionFilter[0]) {
          directionFilterResult = directionFilter[1].some(term => a.direction.toLowerCase().includes(term.toLowerCase()))
        } else {
          directionFilterResult = !directionFilter[1].some(term => a.direction.toLowerCase().includes(term.toLowerCase()))
        }
      } 

      filter = a.timeToStation/60 <= maxArrivalTime && directionFilterResult;
      return (filter
      )
    }
  );
  arrivals = arrivals.sort((a, b) => a.timeToStation - b.timeToStation);
 
  if (arrivals.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No upcoming arrivals.";
    ul.appendChild(li);
    return;
  }

  arrivals.forEach((arrival) => {
    const li = document.createElement("li");
    const minutes = Math.round(arrival.timeToStation / 60);
    const arrivalTime = arrival.expectedArrivalTime
      ? formatTime(new Date(arrival.expectedArrivalTime))
      : formatTime(new Date(Date.now() + arrival.timeToStation * 1000));

    li.textContent = `${capitalizeLineName(arrival.lineName)} to ${arrival.destinationName} – ${minutes} min (${arrivalTime})`;
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
    const res = await fetch(url);
    const data = await res.json();
    container.innerHTML = "";
    data.forEach((line) => {
      const div = document.createElement("div");
      const status = line.lineStatuses[0]?.statusSeverityDescription || "Unknown";
      div.innerHTML = `<strong>${capitalizeLineName(line.id)}</strong>: ${status}`;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to fetch line statuses", err);
  }
}

function capitalizeLineName(name) {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
