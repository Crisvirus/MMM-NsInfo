/* MMM-OvInfo
 *
 * By: Mike Mestebeld
 */
class Train {
  constructor(direction,type,durationTime) {
    this.direction = direction
    this.type = type
    this.durationTime = durationTime
  }
}

class Station {
  constructor(name,departureTime=null, arrivalTime=null,arrivalTrack=null,departureTrack=null,departingConnection=null) {
    this.name = name
    this.departureTime = departureTime
    this.arrivalTime = arrivalTime
    this.arrivalTrack = arrivalTrack
    this.departureTrack = departureTrack
    this.departingConnection = departingConnection
  }
}


class Trip {
  constructor(originStationName,destinationStationName,originPlannedTime,originActualTime,destinationPlannedTime,originPlatform,destinationPlatform,crowd,direction,trainType,status,stations) {
    this.originStationName = originStationName
    this.destinationStationName = destinationStationName
    this.originPlannedTime = originPlannedTime
    this.originActualTime = originActualTime
    this.destinationPlannedTime = destinationPlannedTime
    this.originPlatform = originPlatform
    this.destinationPlatform = destinationPlatform
    this.crowd = crowd
    this.direction = direction
    this.trainType = trainType
    this.status = status
    const parsedPlannedDate = this.dateParser(originPlannedTime);
    const parsedActualDate = this.dateParser(originActualTime);
    this.delay = (parsedActualDate - parsedPlannedDate) / (1000 * 60);
    this.stations = stations
    console.log(stations)
  }
  dateParser(date) {
    return new Date(date);
  }
  getCard() {
    var row_original = document.createElement("tr");
    var card = document.createElement("div");
    if(this.status == "NORMAL") {
      card.className = "card";
    } else if(this.status == "CANCELLED") {
      card.className = "card card-cancelled";
    } else {
      card.className = "card card-unknown";
    }

    var cardTable = document.createElement("table")
    cardTable.className = "card-table"

    var row = document.createElement("tr");
    var col1 = document.createElement("td");
    col1.className = "card-time"
    var row1 = document.createElement("tr");
    var row2 = document.createElement("tr");
    var row3 = document.createElement("tr");
    row1.className = "card-time";
    row1.innerHTML = this.originPlannedTime
      .split("T")[1]
      .split("+")[0]
      .split(":", 2)
      .join(":");
    row2.className = "card-time";
    row2.innerHTML = '<i class="fa-solid fa-arrow-down"></i>'

    row3.className = "card-time";
    row3.innerHTML = this.destinationPlannedTime
      .split("T")[1]
      .split("+")[0]
      .split(":", 2)
      .join(":");
    col1.appendChild(row1)
    col1.appendChild(row2)
    col1.appendChild(row3)

    row.appendChild(col1)

    if (this.delay > 0) {
      var delayCell = document.createElement("td");
      delayCell.className = "delay medium";
      delayCell.innerHTML = "+" + Math.round(this.delay);
      row.appendChild(delayCell);
    } else {
      var delayCell = document.createElement("td");
      delayCell.className = "delay0 medium";
      delayCell.innerHTML = "+0";
      console.log(Math.round(this.delay))
      row.appendChild(delayCell);
    }

    var col2 = document.createElement("td");
    var table2 = document.createElement("table");
    var row1 = document.createElement("tr");
    row1.className = "train-info"
    var row2 = document.createElement("tr");
    row2.className = "train-route"

    var row1col = document.createElement("td")

    var crowd = document.createElement("a");
    if(this.crowd == "LOW") {
      crowd.className = "crowd crowd-low";
      crowd.innerHTML = '<i class="fa-solid fa-person"></i>'
    } else if(this.crowd == "MEDIUM") {
      crowd.className = "crowd crowd-medium";
      crowd.innerHTML = '<i class="fa-solid fa-person"></i><i class="fa-solid fa-person"></i>'
    } else if(this.crowd == "HIGH") {
      crowd.className = "crowd crowd-high";
      crowd.innerHTML = '<i class="fa-solid fa-person"></i><i class="fa-solid fa-person"></i><i class="fa-solid fa-person"></i>'
    } else {
      crowd.className = "crowd crowd-unknown";
      crowd.innerHTML = '<i class="fa-solid fa-user-slash"></i>'
    }
    row1col.appendChild(crowd);

    var trainCell = document.createElement("a");
    trainCell.className = "card-train-type";
    trainCell.innerHTML = this.trainType;
    row1col.appendChild(trainCell);

    var DirectionCell = document.createElement("a");
    DirectionCell.className = "card-train-direction";
    DirectionCell.innerHTML = this.direction;
    row1col.appendChild(DirectionCell);
    row1.appendChild(row1col)

    var stationCell = document.createElement("td");
    stationCell.className = "card-train-route";
    stationCell.appendChild(this.getRouteHtml())
    row2.appendChild(stationCell);
    table2.appendChild(row1)
    table2.appendChild(row2)
    col2.appendChild(table2)
    row.appendChild(col2)
    cardTable.appendChild(row)
    card.appendChild(cardTable)
    row_original.appendChild(card)
    return row_original;
  }

  getRouteHtml() {
    var table = document.createElement("table")
    table.className = "route-table xsmall"
    var row1 = document.createElement("tr")
    var row2 = document.createElement("tr")
    for(var i=0;i<this.stations.length;++i) {
      var station = this.stations[i]
      var nameCell = document.createElement("td")
      nameCell.innerHTML = station.arrivalTrack+" "+station.name+" "+station.departureTrack
      var timeCell = document.createElement("td")
      if(station.arrivalTime!=null && station.departureTime!=null){
        timeCell.innerHTML = station.arrivalTime.split("T")[1].split("+")[0].split(":", 2).join(":")+"-"+station.departureTime.split("T")[1].split("+")[0].split(":", 2).join(":")
      } else if(station.arrivalTime!=null) {
        timeCell.innerHTML = station.arrivalTime.split("T")[1].split("+")[0].split(":", 2).join(":")
      } else if(station.departureTime!=null) {
        timeCell.innerHTML = station.departureTime.split("T")[1].split("+")[0].split(":", 2).join(":")
      } else {
        timeCell.innerHTML = "WTF"
      }
      row1.appendChild(nameCell)
      row2.appendChild(timeCell)
      if (station.departingConnection!=null) {
        var arrowCell = document.createElement("td")
        var directionCell = document.createElement("td")
        arrowCell.innerHTML = '<i class="fa-solid fa-arrow-right-long"></i>'
        directionCell.innerHTML = station.departingConnection.type+" "+station.departingConnection.direction
        row1.appendChild(arrowCell)
        row2.appendChild(directionCell)
      }
    }
    table.appendChild(row1)
    table.appendChild(row2)

    return row1
    // return table
    // return this.originStationName+" "+this.originPlatform+" "+'<i class="fa-solid fa-arrow-right"></i>'+" "+this.destinationStationName+" "+this.destinationPlatform;
  }

  getHTML() {
    var row = document.createElement("tr");

    var timeCell = document.createElement("td");
    timeCell.className = "departure xsmall";

    var departure = this.originPlannedTime
      .split("T")[1]
      .split("+")[0]
      .split(":", 2)
      .join(":");
    
    var arrow = '<i class="fa-solid fa-arrow-right"></i>'
    var arrival = this.destinationPlannedTime
    .split("T")[1]
    .split("+")[0]
    .split(":", 2)
    .join(":");

    timeCell.innerHTML = departure+" "+arrow+" "+arrival;
    row.appendChild(timeCell);

    if (this.delay > 0) {
      var delayCell = document.createElement("td");
      delayCell.className = "delay";
      delayCell.innerHTML = "+" + Math.round(this.delay);
      row.appendChild(delayCell);
    } else {
      var delayCell = document.createElement("td");
      delayCell.className = "delay0";
      delayCell.innerHTML = Math.round(this.delay);
      row.appendChild(delayCell);
    }
    console.log(this.crowd);
    var crowd = document.createElement("td");
    if(this.crowd == "LOW") {
      crowd.className = "crowd-low";
      crowd.innerHTML = '<i class="fa-solid fa-person"></i>'
    } else if(this.crowd == "MEDIUM") {
      crowd.className = "crowd-medium";
      crowd.innerHTML = '<i class="fa-solid fa-person"></i><i class="fa-solid fa-person"></i>'
    } else if(this.crowd == "HIGH") {
      crowd.className = "crowd-high";
      crowd.innerHTML = '<i class="fa-solid fa-person"></i><i class="fa-solid fa-person"></i><i class="fa-solid fa-person"></i>'
    } else {
      crowd.className = "crowd-unknown";
      crowd.innerHTML = '<i class="fa-solid fa-user-slash"></i>'
    }
    row.appendChild(crowd);

    var trainCell = document.createElement("td");
    trainCell.className = "train";
    trainCell.innerHTML = this.trainType;
    row.appendChild(trainCell);

    var DirectionCell = document.createElement("td");
    DirectionCell.className = "direction";
    DirectionCell.innerHTML = this.direction;
    row.appendChild(DirectionCell);

    var stationCell = document.createElement("td");
    stationCell.className = "station";
    stationCell.innerHTML = this.originStationName+" "+this.originPlatform+" "+'<i class="fa-solid fa-arrow-right"></i>'+" "+this.destinationStationName+" "+this.destinationPlatform;
    row.appendChild(stationCell);

    return row;
  }
}
Module.register("MMM-NsInfo", {
  // Default module config.
  defaults: {
    header: null,
    apiKey: null,
    maxDepartures: 10,
    updateInterval: 5,
    initialLoadDelay: 2500,
    animationSpeed: 1000,
    retryDelay: 2500,
    fade: false,
    fadePoint: 0.25,
    originUIC: 8400621,
    destinationUIC: 8400058,
    calendarClass: "calendar",
    tableClass: "small",

    BaseURL:
      "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v3/trips?",
      
    defaultParams: 
      "originWalk=false&originBike=false&originCar=false&destinationWalk=false&destinationBike=false&destinationCar=false&shorterChange=false&travelAssistance=false&searchForAccessibleTrip=false&localTrainsOnly=false&excludeHighSpeedTrains=false&excludeTrainsWithReservationRequired=false&yearCard=false&discount=NO_DISCOUNT&travelClass=2&passing=false&travelRequestType=DEFAULT",
    lang: "en"
  },

  getStyles: function () {
    return ["MMM-NsInfo.css"];
  },

  start: function () {
    Log.info("Starting module: " + this.name);
    this.loaded = false;
    this.scheduleUpdate(this.config.initialLoadDelay);

    this.updateTimer = null;
    this.config.header = "Utrecht to Amsterdam"
  },

  getDom: function () {
    var wrapper = document.createElement("div");

    if (
      this.config.apiKey === null ||
      this.config.apiKey === "" ||
      this.config.apiKey === "YOUR_API_KEY_HERE"
    ) {
      wrapper.innerHTML =
        "Please set the an NS <i>API_KEY</i> in the config for module: " +
        this.name +
        ".";
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    if (!this.loaded) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    if (this.travels.length === 0) {
      wrapper.innerHTML =
        "Could not load departures, please check the console for more details.";
      wrapper.className = "dimmed light small";
      return wrapper;
    }
    var table = document.createElement("table");
    table.className = this.config.tableClass;

    for (var t in this.travels) {
      var travel = this.travels[t];

      var row = travel.getCard()
      table.appendChild(row);

      

      if (this.config.fade && this.config.fadePoint < 1) {
        if (this.config.fadePoint < 0) {
          this.config.fadePoint = 0;
        }
        var startingPoint = this.travels.length * this.config.fadePoint;
        var steps = this.travels.length - startingPoint;
        if (t >= startingPoint) {
          var currentStep = t - startingPoint;
          row.style.opacity = 1 - (1 / steps) * currentStep;
        }
      }
    }

    return table;
  },

  // Overrides the header Creation
  getHeader: function () {
    if (this.config.header === null) {
      return this.config.station
        ? "reizen vanaf " + this.config.station
        : "NS Reizen";
    } else {
      return this.config.header;
    }
  },

  // Creates a request to NS travel API
  updateTravels: function () {
    if (this.config.api_key === "") {
      Log.error("ovInfo: api_key not set!");
      return;
    }

    var url = this.config.BaseURL+this.getParams();
    var self = this;
    var retry = true;

    var travelRequest = new XMLHttpRequest();
    travelRequest.open("GET", url, true);
    travelRequest.setRequestHeader(
      "Ocp-Apim-Subscription-Key",
      this.config.apiKey
    );
    travelRequest.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          self.processTravel(JSON.parse(this.response));
        } else if (this.status === 401) {
          self.updateDom(self.config.animationSpeed);
          retry = false;
        } else if (this.status === 404) {
          const error = JSON.parse(this.response);
          Log.error("error 404: " + error.errors[0].type);
          self.loaded = true;
          self.updateDom(self.config.animationSpeed);
        } else {
          Log.error(self.name + ": Could not load train data.");
        }
        if (retry) {
          self.scheduleUpdate(self.loaded ? -1 : self.config.retryDelay);
        }
      }
    };
    travelRequest.send();
  },

  // Sets the parameters for the request
  getParams: function () {
    params = "originUicCode="+this.config.originUIC+"&destinationUicCode="+this.config.destinationUIC+"&"+this.config.defaultParams
    return params;
  },

  // Creates an Object with all data neccesary for the DOM Render;
  processTravel: function (data) {
    this.travel = [];
    let travelList = data.trips;

    for (var i = 0, count = travelList.length; i < count; i++) {
      var travel = travelList[i];
      var stations = []

      for(var j=0; j< travel.legs.length; j++) {
        leg = travel.legs[j]
        if(stations.length == 0) {
          var originTrack = '?';
          var destTrack = '?';
          if (leg.origin.actualTrack !== undefined) {
            originTrack = leg.origin.actualTrack
          }
          if (leg.destination.actualTrack !== undefined) {
            destTrack = leg.destination.actualTrack
          }
          train = new Train(leg.direction,leg.product.shortCategoryName,leg.plannedDurationInMinutes)
          originStation = new Station(leg.origin.name, departureTime=leg.origin.plannedDateTime, arrivalTime=null, arrivalTrack=" ",departureTrack=originTrack,departingConnection=train)
          destStation = new Station(leg.destination.name, departureTime=null, arrivalTime=leg.destination.plannedDateTime, arrivalTrack=destTrack,departureTrack = " ", departingConnection = null)
          stations.push(originStation)
          stations.push(destStation)
        } else {
          var originTrack = '?';
          var destTrack = '?';
          if (leg.origin.actualTrack !== undefined) {
            originTrack = leg.origin.actualTrack
          }
          if (leg.destination.actualTrack !== undefined) {
            destTrack = leg.destination.actualTrack
          }
          train = new Train(leg.direction,leg.product.shortCategoryName,leg.plannedDurationInMinutes)
          stations[stations.length-1].departingConnection = train
          stations[stations.length-1].departureTime = leg.origin.plannedDateTime
          stations[stations.length-1].departureTrack = originTrack
          destStation = new Station(leg.destination.name, departureTime=null, arrivalTime=leg.destination.plannedDateTime, arrivalTrack=destTrack,departureTrack = " ", departingConnection = null)
          stations.push(destStation)
        }
      }
      var leg_length = travel.legs.length
      var actualDepartureTime = travel.legs[0].origin.plannedDateTime;
      if(travel.legs[0].origin.actualDateTime !== undefined) {
        actualDepartureTime = travel.legs[0].origin.actualDateTime
      }
      var originTrack = '?';
      var destTrack = '?';
      if (travel.legs[0].origin.actualTrack !== undefined) {
        originTrack = travel.legs[0].origin.actualTrack
      }
      if (travel.legs[leg_length-1].destination.actualTrack !== undefined) {
        destTrack = travel.legs[leg_length-1].destination.actualTrack
      }
      var status="NORMAL";
      if (travel.status !== undefined) {
        status = travel.status;
        console.log(status)
      }
      // let travelData = {
      //   train: travel.legs[0].product.shortCategoryName,
      //   direction: travel.legs[0].direction,
      //   originTrack: originTrack,
      //   originStation: travel.legs[0].origin.name,
      //   destTrack: destTrack,
      //   destStation: travel.legs[0].destination.name,
      //   plannedDepartureDate: travel.legs[0].origin.plannedDateTime,
      //   destDate: travel.legs[0].destination.plannedDateTime,
      //   delay: calculatedDelay,
      //   crowd: travel.legs[0].crowdForecast
      // };
      trip = new Trip(travel.legs[0].origin.name,
        travel.legs[leg_length-1].destination.name,
        travel.legs[0].origin.plannedDateTime,
        actualDepartureTime,
        travel.legs[leg_length-1].destination.plannedDateTime,
        originTrack,
        destTrack,
        travel.legs[0].crowdForecast,
        travel.legs[0].direction,
        travel.legs[0].product.shortCategoryName,
        status,
        stations
        )

      this.travels.push(trip);
    }
    this.show(this.config.animationSpeed, { lockString: this.identifier });
    this.loaded = true;
    this.updateDom(this.config.animationSpeed);
  },

  // Parses the given string from the API to an Date Object
  dateParser: function (date) {
    return new Date(date);
  },

  // Calls an update every set minutes
  scheduleUpdate: function (delay) {
    this.travels = [];
    var nextLoad = this.config.updateInterval * 1000 * 60;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
    }

    var self = this;
    clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(function () {
      self.updateTravels();
    }, nextLoad);
  }
});
