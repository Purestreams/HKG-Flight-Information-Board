const yesterday = new Date();
const year = new Date();
yesterday.setDate(yesterday.getDate() - 1);
year.setDate(year.getDate() - 91);
const formattedYesterday = yesterday.toISOString().split('T')[0];
const formattedLastYear = year.toISOString().split('T')[0];

window.onload = function() {
    //document.getElementById("date").max=formattedYesterday;
    //document.getElementById("date").min=formattedLastYear;
    processiata("PVG");
} 



//console.log(formattedYesterday);
//console.log(formattedLastYear);

searchClick = function() {
    //remove the previous statistics
    document.getElementById("show1").innerHTML = "";
    document.getElementById("show2").innerHTML = "";
    if (document.getElementById("date").value === "") {
        //alert("Please enter a date");
        //show a message above the date input form
        document.getElementById("888").innerHTML = "Please enter a date";
        setTimeout(function() {
            document.getElementById("888").innerHTML = "";
        }, 2000);
    }
    else {
        if (document.getElementById("date").value < formattedLastYear) {
            document.getElementById("888").innerHTML = "Please enter a date within the last 90 days";
            setTimeout(function() {
                document.getElementById("888").innerHTML = "";
            }, 2000);
            return;
        }
        else if (document.getElementById("date").value > formattedYesterday) {
            document.getElementById("888").innerHTML = "Please enter a date within yesterday";
            setTimeout(function() {
                document.getElementById("888").innerHTML = "";
            }, 2000);
            return;
        }
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
    document.getElementById("show1").innerHTML += `
    <h2>Flight Statistics on ${document.getElementById("date").value}</h2>`;

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
    var number_of_delayed = 0;
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
        else if (status === "Delayed") {
            number_of_delayed++;
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
        return originCounts[key] > 0;
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

    //add the statistics to the webpage
    document.getElementById("dd_arrival").innerHTML += `
        <div style="margin-left: 5%">
            <p>Total Flights: ${Total_Flight}</p>
            <p>Number of Origins: ${number_of_origin}</p>
            <p>Number of Special Cases: Cancelled: ${number_of_cancelled} Delay: ${number_of_delayed}</p>
        </div>
    `;

    //add the histogram to the webpage
    document.getElementById("dd_arrival").innerHTML += `
        <div style="margin-left: 5%">
            <h3>Departure Time</h3>

            <div id="chart-block">
            <svg class="chart" width="100%" height="550px">
                <g transform="translate(0,0)">
                    <rect x="20" width="${10*prev}" height="19" fill="#2D9596"></rect>
                    <text x="${10*prev+25}" y="9.5" dy=".35em">${prev}</text>
                    <text x="0" y="9.5" dy=".35em" style="font-size: 9px;">Prev</text>
                </g>
                <g transform="translate(0,20)">
                  <rect x="20" width="${10*number_of_flight_on_each_hour[0]}" height="19" fill="#2D9596"></rect>
                  <text x="${10*number_of_flight_on_each_hour[0]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[0]}</text>
                  <text x="0" y="9.5" dy=".35em">00</text>
                </g>
                <g transform="translate(0,40)">
                  <rect x="20" width="${10*number_of_flight_on_each_hour[1]}" height="19" fill="#2D9596"></rect>
                  <text x="${10*number_of_flight_on_each_hour[1]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[1]}</text>
                    <text x="0" y="9.5" dy=".35em">01</text>
                </g>
                <g transform="translate(0,60)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[2]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[2]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[2]}</text>
                    <text x="0" y="9.5" dy=".35em">02</text>
                </g>
                <g transform="translate(0,80)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[3]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[3]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[3]}</text>
                    <text x="0" y="9.5" dy=".35em">03</text>
                </g>
                <g transform="translate(0,100)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[4]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[4]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[4]}</text>
                    <text x="0" y="9.5" dy=".35em">04</text>
                </g>
                <g transform="translate(0,120)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[5]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[5]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[5]}</text>
                    <text x="0" y="9.5" dy=".35em">05</text>
                </g>
                <g transform="translate(0,140)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[6]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[6]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[6]}</text>
                    <text x="0" y="9.5" dy=".35em">06</text>
                </g>
                <g transform="translate(0,160)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[7]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[7]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[7]}</text>
                    <text x="0" y="9.5" dy=".35em">07</text>
                </g>
                <g transform="translate(0,180)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[8]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[8]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[8]}</text>
                    <text x="0" y="9.5" dy=".35em">08</text>
                </g>
                <g transform="translate(0,200)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[9]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[9]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[9]}</text>
                    <text x="0" y="9.5" dy=".35em">09</text>
                </g>
                <g transform="translate(0,220)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[10]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[10]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[10]}</text>
                    <text x="0" y="9.5" dy=".35em">10</text>
                </g>
                <g transform="translate(0,240)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[11]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[11]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[11]}</text>
                    <text x="0" y="9.5" dy=".35em">11</text>
                </g>
                <g transform="translate(0,260)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[12]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[12]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[12]}</text>
                    <text x="0" y="9.5" dy=".35em">12</text>
                </g>
                <g transform="translate(0,280)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[13]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[13]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[13]}</text>
                    <text x="0" y="9.5" dy=".35em">13</text>
                </g>
                <g transform="translate(0,300)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[14]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[14]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[14]}</text>
                    <text x="0" y="9.5" dy=".35em">14</text>
                </g>
                <g transform="translate(0,320)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[15]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[15]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[15]}</text>
                    <text x="0" y="9.5" dy=".35em">15</text>
                </g>
                <g transform="translate(0,340)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[16]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[16]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[16]}</text>
                    <text x="0" y="9.5" dy=".35em">16</text>
                </g>
                <g transform="translate(0,360)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[17]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[17]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[17]}</text>
                    <text x="0" y="9.5" dy=".35em">17</text>
                </g>
                <g transform="translate(0,380)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[18]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[18]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[18]}</text>
                    <text x="0" y="9.5" dy=".35em">18</text>
                </g>
                <g transform="translate(0,400)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[19]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[19]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[19]}</text>
                    <text x="0" y="9.5" dy=".35em">19</text>
                </g>
                <g transform="translate(0,420)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[20]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[20]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[20]}</text>
                    <text x="0" y="9.5" dy=".35em">20</text>
                </g>
                <g transform="translate(0,440)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[21]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[21]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[21]}</text>
                    <text x="0" y="9.5" dy=".35em">21</text>
                </g>
                <g transform="translate(0,460)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[22]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[22]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[22]}</text>
                    <text x="0" y="9.5" dy=".35em">22</text>
                </g>
                <g transform="translate(0,480)">
                    <rect x="20" width="${10*number_of_flight_on_each_hour[23]}" height="19" fill="#2D9596"></rect>
                    <text x="${10*number_of_flight_on_each_hour[23]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[23]}</text>
                    <text x="0" y="9.5" dy=".35em">23</text>
                </g>
                <g transform="translate(0,500)">
                    <rect x="20" width="${10*next_arrival}" height="19" fill="#2D9596"></rect>
                    <text x="${10*next_arrival+25}" y="9.5" dy=".35em">${next_arrival}</text>
                    <text x="0" y="9.5" dy=".35em" style="font-size: 9px;">Next</text>
              </svg>
            </div>
        </div>
    `;

    //add the top 10 origins to the webpage
    document.getElementById("dd_arrival").innerHTML += `
        <div style="margin-left: 5%">
            <h3>Top 10 Origins</h3>
            <table>
                <tr>
                    <th>IATA Code</th>
                    <th>Airport Name</th>
                    <th>Number of Flights</th>
                </tr>
                <tr>
                    <td>${topOrigins[0]}</td>
                    <td>${processiata(topOrigins[0])}</td>
                    <td>${topOriginsCounts[0]}</td>
                </tr>
                <tr>
                    <td>${topOrigins[1]}</td>
                    <td>${processiata(topOrigins[1])}</td>
                    <td>${topOriginsCounts[1]}</td>
                </tr>
                <tr>
                    <td>${topOrigins[2]}</td>
                    <td>${processiata(topOrigins[2])}</td>
                    <td>${topOriginsCounts[2]}</td>
                </tr>
                <tr>
                    <td>${topOrigins[3]}</td>
                    <td>${processiata(topOrigins[3])}</td>
                    <td>${topOriginsCounts[3]}</td>
                </tr>
                <tr>
                    <td>${topOrigins[4]}</td>
                    <td>${processiata(topOrigins[4])}</td>
                    <td>${topOriginsCounts[4]}</td>
                </tr>
                <tr>
                    <td>${topOrigins[5]}</td>
                    <td>${processiata(topOrigins[5])}</td>
                    <td>${topOriginsCounts[5]}</td>
                </tr>
                <tr>
                    <td>${topOrigins[6]}</td>
                    <td>${processiata(topOrigins[6])}</td>
                    <td>${topOriginsCounts[6]}</td>
                </tr>
                <tr>
                    <td>${topOrigins[7]}</td>
                    <td>${processiata(topOrigins[7])}</td>
                    <td>${topOriginsCounts[7]}</td>
                </tr>
                <tr>
                    <td>${topOrigins[8]}</td>
                    <td>${processiata(topOrigins[8])}</td>
                    <td>${topOriginsCounts[8]}</td>
                </tr>
                <tr>
                    <td>${topOrigins[9]}</td>
                    <td>${processiata(topOrigins[9])}</td>
                    <td>${topOriginsCounts[9]}</td>
                </tr>
            </table>
        </div>
    `;
}

processiata = function(iata) {
    console.log(iata);
    var output = "";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "iata.json", false);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var iataData = JSON.parse(xhr.responseText);
            var iataDataValues = Object.values(iataData);
            for (var i = 0; i < iataDataValues.length; i++) {
                if (iataDataValues[i].iata_code == iata) {
                    output = iataDataValues[i].name;
                    break;
                }
            }
        } else {
            console.log("Error: " + xhr.status);
            throw new Error("Error: " + xhr.status);
        }
    };
    xhr.send();
    // Return the output if a matching iata code is found
    return output;
}


rendorStatistics_departure = function(flightsData) {
    // rendor the statistics
    // flightsData is the JSON data in array
    //var number_of_flight = flightsData.length;
    var Total_Flight = 0;
    var number_of_destinations = 0;
    var number_of_cancelled = 0;
    var number_of_delayed = 0;
    var number_of_flight_on_each_hour = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    console.log(flightsData);

    Total_Flight = flightsData[0].list.length;
    
    var list_of_destinations = [];
    var next_depature = 0;
    for (var i = 0; i < flightsData[0].list.length; i++) {
        var destination = flightsData[0].list[i].destination[0];
        if  (!list_of_destinations.includes(destination)) {
            list_of_destinations.push(destination);
        }
        var status= flightsData[0].list[i].status;
        if (status === "Delayed") {
            console.log(flightsData[0].list[i].status);
            number_of_delayed++;
        }
        else if (status === "Cancelled") {
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
            //console.log(flightsData[0].list[i].status);
            //console.log(status_time);
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
        return destinationCounts[key] > 0;
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

    //add the statistics to the webpage
    document.getElementById("dd_departure").innerHTML += `
        <div style="margin-left: 5%">
            <p>Total Flights: ${Total_Flight}</p>
            <p>Number of Destinations: ${number_of_destinations}</p>
            <p>Number of Special Cases: Cancelled: ${number_of_cancelled} Delay: ${number_of_delayed}</p>
        </div>
    `;
   //add the histogram to the webpage
   document.getElementById("dd_departure").innerHTML += `
   <div style="margin-left: 5%">
       <h3>Departure Time</h3>

       <div id="chart-block">
       <svg class="chart" width="100%" height="550px">
           <g transform="translate(0,0)">
             <rect x="20" width="${10*number_of_flight_on_each_hour[0]}" height="19" fill="#2D9596"></rect>
             <text x="${10*number_of_flight_on_each_hour[0]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[0]}</text>
             <text x="0" y="9.5" dy=".35em">00</text>
           </g>
           <g transform="translate(0,20)">
             <rect x="20" width="${10*number_of_flight_on_each_hour[1]}" height="19" fill="#2D9596"></rect>
             <text x="${10*number_of_flight_on_each_hour[1]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[1]}</text>
               <text x="0" y="9.5" dy=".35em">01</text>
           </g>
           <g transform="translate(0,40)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[2]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[2]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[2]}</text>
               <text x="0" y="9.5" dy=".35em">02</text>
           </g>
           <g transform="translate(0,60)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[3]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[3]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[3]}</text>
               <text x="0" y="9.5" dy=".35em">03</text>
           </g>
           <g transform="translate(0,80)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[4]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[4]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[4]}</text>
               <text x="0" y="9.5" dy=".35em">04</text>
           </g>
           <g transform="translate(0,100)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[5]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[5]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[5]}</text>
               <text x="0" y="9.5" dy=".35em">05</text>
           </g>
           <g transform="translate(0,120)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[6]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[6]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[6]}</text>
               <text x="0" y="9.5" dy=".35em">06</text>
           </g>
           <g transform="translate(0,140)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[7]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[7]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[7]}</text>
               <text x="0" y="9.5" dy=".35em">07</text>
           </g>
           <g transform="translate(0,160)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[8]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[8]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[8]}</text>
               <text x="0" y="9.5" dy=".35em">08</text>
           </g>
           <g transform="translate(0,180)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[9]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[9]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[9]}</text>
               <text x="0" y="9.5" dy=".35em">09</text>
           </g>
           <g transform="translate(0,200)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[10]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[10]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[10]}</text>
               <text x="0" y="9.5" dy=".35em">10</text>
           </g>
           <g transform="translate(0,220)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[11]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[11]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[11]}</text>
               <text x="0" y="9.5" dy=".35em">11</text>
           </g>
           <g transform="translate(0,240)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[12]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[12]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[12]}</text>
               <text x="0" y="9.5" dy=".35em">12</text>
           </g>
           <g transform="translate(0,260)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[13]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[13]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[13]}</text>
               <text x="0" y="9.5" dy=".35em">13</text>
           </g>
           <g transform="translate(0,280)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[14]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[14]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[14]}</text>
               <text x="0" y="9.5" dy=".35em">14</text>
           </g>
           <g transform="translate(0,300)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[15]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[15]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[15]}</text>
               <text x="0" y="9.5" dy=".35em">15</text>
           </g>
           <g transform="translate(0,320)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[16]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[16]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[16]}</text>
               <text x="0" y="9.5" dy=".35em">16</text>
           </g>
           <g transform="translate(0,340)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[17]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[17]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[17]}</text>
               <text x="0" y="9.5" dy=".35em">17</text>
           </g>
           <g transform="translate(0,360)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[18]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[18]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[18]}</text>
               <text x="0" y="9.5" dy=".35em">18</text>
           </g>
           <g transform="translate(0,380)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[19]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[19]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[19]}</text>
               <text x="0" y="9.5" dy=".35em">19</text>
           </g>
           <g transform="translate(0,400)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[20]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[20]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[20]}</text>
               <text x="0" y="9.5" dy=".35em">20</text>
           </g>
           <g transform="translate(0,420)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[21]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[21]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[21]}</text>
               <text x="0" y="9.5" dy=".35em">21</text>
           </g>
           <g transform="translate(0,440)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[22]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[22]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[22]}</text>
               <text x="0" y="9.5" dy=".35em">22</text>
           </g>
           <g transform="translate(0,460)">
               <rect x="20" width="${10*number_of_flight_on_each_hour[23]}" height="19" fill="#2D9596"></rect>
               <text x="${10*number_of_flight_on_each_hour[23]+25}" y="9.5" dy=".35em">${number_of_flight_on_each_hour[23]}</text>
               <text x="0" y="9.5" dy=".35em">23</text>
           </g>
           <g transform="translate(0,480)">
               <rect x="20" width="${10*next_depature}" height="19" fill="#2D9596"></rect>
               <text x="${10*next_depature+25}" y="9.5" dy=".35em">${next_depature}</text>
               <text x="0" y="9.5" dy=".35em" style="font-size: 9px;">Next</text>
         </svg>
       </div>
   </div>
`;

//add the top 10 destinations to the webpage
document.getElementById("dd_departure").innerHTML += `
   <div style="margin-left: 5%">
       <h3>Top 10 Destinations</h3>
       <table>
           <tr>
                <th>IATA Code</th>
                <th>Airport Name</th>
                <th>Number of Flights</th>
           </tr>
           <tr>
               <td>${topDestinations[0]}</td>
               <td>${processiata(topDestinations[0])}</td>
               <td>${topDestinationsCounts[0]}</td>
           </tr>
           <tr>
               <td>${topDestinations[1]}</td>
                <td>${processiata(topDestinations[1])}</td>
               <td>${topDestinationsCounts[1]}</td>
           </tr>
           <tr>
               <td>${topDestinations[2]}</td>
                <td>${processiata(topDestinations[2])}</td>
               <td>${topDestinationsCounts[2]}</td>
           </tr>
           <tr>
               <td>${topDestinations[3]}</td>
                <td>${processiata(topDestinations[3])}</td>
               <td>${topDestinationsCounts[3]}</td>
           </tr>
           <tr>
               <td>${topDestinations[4]}</td>
                <td>${processiata(topDestinations[4])}</td>
               <td>${topDestinationsCounts[4]}</td>
           </tr>
           <tr>
               <td>${topDestinations[5]}</td>
                <td>${processiata(topDestinations[5])}</td>
               <td>${topDestinationsCounts[5]}</td>
           </tr>
           <tr>
               <td>${topDestinations[6]}</td>
                <td>${processiata(topDestinations[6])}</td>
               <td>${topDestinationsCounts[6]}</td>
           </tr>
           <tr>
               <td>${topDestinations[7]}</td>
                <td>${processiata(topDestinations[7])}</td>
               <td>${topDestinationsCounts[7]}</td>
           </tr>
           <tr>
               <td>${topDestinations[8]}</td>
                <td>${processiata(topDestinations[8])}</td>
               <td>${topDestinationsCounts[8]}</td>
           </tr>
           <tr>
               <td>${topDestinations[9]}</td>
                <td>${processiata(topDestinations[9])}</td>
               <td>${topDestinationsCounts[9]}</td>
           </tr>
       </table>
   </div>
`;

}