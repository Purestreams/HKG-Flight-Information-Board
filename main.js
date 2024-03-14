const yesterday = new Date();
const year = new Date();
yesterday.setDate(yesterday.getDate() - 1);
year.setDate(year.getDate() - 364);
const formattedYesterday = yesterday.toISOString().split('T')[0];
const formattedLastYear = year.toISOString().split('T')[0];

window.onload = function() {
    document.getElementById("date").max=formattedYesterday;
    document.getElementById("date").min=formattedLastYear;
} 



//console.log(formattedYesterday);
//console.log(formattedLastYear);

searchClick = function() {
    if (document.getElementById("date").value === "") {
        alert("Please enter a date");
    }
    else {
        var date_given = new Date(document.getElementById("date").value);
        var date_given_yesterday = new Date(date_given);
        date_given_yesterday.setDate(date_given_yesterday.getDate() - 1);
        var date_given_tomorrow = new Date(date_given);
        date_given_tomorrow.setDate(date_given_tomorrow.getDate() + 1);

        date_given_formatted_yesterday = date_given_yesterday.toISOString().split('T')[0];
        date_given_formatted_tomorrow = date_given_tomorrow.toISOString().split('T')[0];
        console.log(date_given_formatted_yesterday);
        console.log(date_given_formatted_tomorrow);

        rendorWebpage();

        getFlights_arrival();
        getFlights_departure();

    }
}



getFlights_arrival = function() {
    var date = document.getElementById("date").value;
    var lang = "en";
    var cargo = false;
    var arrival = true;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "flight.php?date=" + date + "&lang=" + lang + "&cargo=" + cargo + "&arrival=" + arrival, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var flights = JSON.parse(xhr.responseText);
            // Store the flights JSON data in a variable
            //flightData_arrival is an object
            const flightsData_arrival = Object.values(flights);
            //console.log(flightsData_arrival);
            //getthe statistics
            rendorStatistics_arrival(flightsData_arrival);
        }
    };
    xhr.send();
}

getFlights_departure = function() {
    var date = document.getElementById("date").value;
    var lang = "en";
    var cargo = false;
    var arrival = false;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "flight.php?date=" + date + "&lang=" + lang + "&cargo=" + cargo + "&arrival=" + arrival, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var flights = JSON.parse(xhr.responseText);
            // Store the flights JSON data in a variable
            //flightData_departure is an object
            const flightsData_departure = Object.values(flights);
            //console.log(flightsData_departure);
            //getthe statistics
            rendorStatistics_departure(flightsData_departure);
        }
    };
    xhr.send();
}

rendorWebpage = function() {
    // rendor the webpage
    document.getElementById("show1").innerHTML = "Flight Statistics on " + document.getElementById("date").value;
    
    document.getElementById("show2").innerHTML += `
    <dd id="dd_departure">
        <center><h2 id="text_departure">departure</h2></center>
    </dd>  
    <dd id="dd_arrival">
        <center><h2 id="text_arrival">arrival</h2></center>
    </dd>
    `;
}


rendorStatistics_arrival = function(flightsData) {
    // rendor the statistics
    // flightsData is the JSON data in array
    //var number_of_flight = flightsData.length;
    var Total_Flight = 0;
    var number_of_origin = 0;
    var number_of_cancelled = 0;
    var number_of_flight_on_each_hour = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var prev = 0;
    var next_arrival = 0;
    console.log(flightsData);

    Total_Flight = flightsData[0].list.length;
    
    var list_of_origins = [];
    for (var i = 0; i < flightsData[0].list.length; i++) {
        var origin = flightsData[0].list[i].origin[0];
        var status= flightsData[0].list[i].status;
        if (status === "Cancelled") {
            number_of_cancelled++;
        }
        else{
            //format status "At Gate hh:mm"
            var status_time = flightsData[0].list[i].status.split(" ");
            //console.log(status_time);
            if ( status_time[3] !== undefined ) {
                //console.log(status_time[3]);
                //change the date split by "/" to "-" (dd/mm/yyyy) to yyyy-mm-dd
                var date = status_time[3].split("/");
                var new_date = date[2] + "-" + date[1] + "-" + date[0];
                var new_date = new_date.replace("(", "");
                var new_date = new_date.replace(")", "");
                console.log(new_date);
                // if the date is yesterday, prev+1; if the date is tomorrow, next_arrival+1
                if (new_date === date_given_formatted_yesterday) {
                    prev += 1;
                }
                if (new_date === date_given_formatted_tomorrow) {
                    next_arrival += 1;
                }
            }
            else {
            var hour = status_time[2].split(":")[0];
            number_of_flight_on_each_hour[parseInt(hour)]++;
            }
        }
    }
    var originCounts = {};
    for (var i = 0; i < flightsData[0].list.length; i++) {
        var origin = flightsData[0].list[i].origin[0];
        if (originCounts[origin]) {
            originCounts[origin]++;
        } else {
            originCounts[origin] = 1;
        }
    }

    var number_of_origin = Object.keys(originCounts).filter(function(key) {
        return originCounts[key] > 1;
    }).length;
    var topOrigins = Object.keys(originCounts).sort(function(a, b) {
        return originCounts[b] - originCounts[a];
    }).slice(0, 10);
    var topOriginsCounts = Object.values(originCounts).sort(function(a, b) {
        return b - a;
    }).slice(0, 10);


    console.log(Total_Flight);
    console.log(number_of_origin);
    console.log(number_of_cancelled);

    console.log(topOrigins);
    console.log(topOriginsCounts);
    console.log(number_of_flight_on_each_hour);
    console.log(next_arrival);
    console.log(prev);
}

rendorStatistics_departure = function(flightsData) {
    // rendor the statistics
    // flightsData is the JSON data in array
    //var number_of_flight = flightsData.length;
    var Total_Flight = 0;
    var number_of_destinations = 0;
    var number_of_cancelled = 0;
    var number_of_flight_on_each_hour = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    console.log(flightsData);

    Total_Flight = flightsData[0].list.length;
    
    var list_of_destinations = [];
    var next_depature = 0;
    for (var i = 0; i < flightsData[0].list.length; i++) {
        var destination = flightsData[0].list[i].destination[0];
        if (!list_of_destinations.includes(destination)) {
            list_of_destinations.push(destination);
        }
        var status= flightsData[0].list[i].status;
        if (status === "Cancelled") {
            number_of_cancelled++;
        }
        else{
            //format status "Dep hh:mm"
            var status_time = flightsData[0].list[i].status.split(" ");
            //console.log(status_time);
            if ( status_time[2] !== undefined ) {
                next_depature += 1;
            }
            else {
            var hour = status_time[1].split(":")[0];
            number_of_flight_on_each_hour[parseInt(hour)]++;
            }
        }

    }
    var destinationCounts = {};
    for (var i = 0; i < flightsData[0].list.length; i++) {
        var destination = flightsData[0].list[i].destination[0];
        if (destinationCounts[destination]) {
            destinationCounts[destination]++;
        } else {
            destinationCounts[destination] = 1;
        }
    }



    var number_of_destinations = Object.keys(destinationCounts).filter(function(key) {
        return destinationCounts[key] > 1;
    }).length;
    var topDestinations = Object.keys(destinationCounts).sort(function(a, b) {
        return destinationCounts[b] - destinationCounts[a]
    }).slice(0, 10);
    var topDestinationsCounts = Object.values(destinationCounts).sort(function(a, b) {
        return b - a;
    }).slice(0, 10);

    console.log(Total_Flight);
    //console.log(list_of_destinations);
    console.log(number_of_destinations);
    console.log(number_of_cancelled);
    console.log(topDestinations);
    console.log(topDestinationsCounts);
    console.log(number_of_flight_on_each_hour);
    console.log(next_depature);
}