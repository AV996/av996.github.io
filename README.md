# TFL Departure Dashboard
A very basic departure dashboard bringing together different modes of transport. Currently split into different directions and starting points.
The tfl departure stop points and directions filters are hardcoded and have been looked up through a variety of means:

1. Find station ids:
    1. Search for Somerton Road only returns the group ID, not the indivdual naptan ids: https://api.tfl.gov.uk/StopPoint/Search?query=Somerton%20Road
    2. Lookup naptan ids from the group id: https://api.tfl.gov.uk/StopPoint/490G00012230  
    Alternatively look up naptan IDs in this csv file: https://foi.tfl.gov.uk/FOI-2262-2324/2262-2324-Bus%20Stop%20Data.csv
    3. Google station ids for Thameslink

2. 
    1. Get arrival predictions for busses, tube, overground: https://api.tfl.gov.uk/StopPoint/490012230N/Arrivals
    2. Get the departure predictions for Thameslink:  https://api.tfl.gov.uk/StopPoint/910GCRKLWD/ArrivalDepartures?lineIds=thameslink

3. Filter for directions:
    1. Busses only have one direction from a naptan id and hence no need to filter
    2. Overground, tube: filter by direction 'inbount' or 'outbound'. Can see the direction from https://api.tfl.gov.uk/StopPoint/910GWHMDSTD/Arrivals
    3. Thameslink: Harcode filters for destination stations in the north, here those containing ['albans', 'luton', 'bedford'].  
    Limitation: Should a train terminate at other stations it will be missed when going northbound and will not be filtered out when going southbound.

Currently everything is hardcoded and very bare just to get it live and see how useful it is to me. The free versions of ChatGPT and Claude assisted in the build of this and future code restructure and logic enhancements are likely should it turn out to be useful.

