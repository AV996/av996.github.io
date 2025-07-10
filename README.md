# TFL Departure Board

*Note: This dashboard is not affiliated with Transport for London. It's a personal project using publicly available TFL APIs.*

A real-time departure dashboard that brings together different modes of transport in London, displaying live departure information for buses, tube, overground, and train services.  
This is intended for (semi-)regular routes that have optionality, infrequent or unreliable services, or regular closures and delays. It should give a one-page overview for a journey so that I can decide if I take the bus (and which bus number), or the train, or the overground but where my decision is contingent on other transports being operable, e.g. if I take Thameslink to St Pancras, I then need the Victoria line to be running.  
I build the currently existing dashboards for specific journies for myself and friends. 

**I am very happy to take dashboard requests by raising an 'issue' (https://github.com/AV996/av996.github.io/issues/new) if anyone would like their own journey overview page and become a pre-apha tester!** 

## How to Access the Dashboards
Hosted in github here: https://av996.github.io/index.html

## Features

- **Multi-modal Transport**: Displays departures for buses, tube, overground, and train
- **Real-time Data**: Uses TFL (Transport for London) API for live departure information
- **Direction Filtering**: Separates departures by direction (inbound/outbound, including or excluding particular destination stations)

## How It Works

The dashboard fetches real-time departure data from the TFL API based on a dashboard configuration and displays it in a user-friendly format. Different transport modes are handled with specific logic:

### Transport Modes Supported

- **Buses**: Single direction from each stop point.
- **Tube & Overground**: Filtered by 'inbound' or 'outbound' direction and inclusion or exclusion of destination stations (e.g. 'clapham')
- **National Rail**: Using the journey planner as it includes Thameslink stations that are only on stopping services.

## Future Enhancements

- [ ] Add additional modes as required: DLR, Elizabeth-line, boat
- [ ] Build a way that a user can create their own dashboards
- [ ] Turn into an app and help other Londoners navigate their journeys
- [ ] Enhance the UI which is currently very basic
- [ ] Improve robustness and error messaging to user

### Stop Search
A utility to look up stop information to build configurations for new dashboards.

## Technical Implementation

### Direction Filtering Logic

- **Buses**: No filtering: single direction per NAPTAN ID and line id.
- **Tube/Overground**: Filter by `direction` field ('inbound'/'outbound') and by `destinationFilter`: [false, ['clapham']], `false` to exculde a destination, `true` to include only the listed destinations
- **Thameslink**: Using the journey planner

### Known Limitations

- All configurations are currently hardcoded
- Including or excluding stations is vulnerable to trains that terminate early.
- Not all transport modes have been added yet.

## Development

This project was built with assistance of free AI tools (ChatGPT and Claude) and is designed as a personal utility to monitor local transport departures. The codebase is intentionally simple and focused on functionality over form.

## Contributing

This is a personal project, but suggestions and improvements are welcome. Please feel free to open issues or submit pull requests.

