/* MMM-OvInfo
 *
 * By: Mike Mestebeld
 */
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
    originUicCode: 8400058,
    destinationUicCode: 8400058,

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

      var row = document.createElement("tr");
      table.appendChild(row);

      var timeCell = document.createElement("td");
      timeCell.className = "departure xsmall";

      departure = travel.plannedDepartureDate
        .split("T")[1]
        .split("+")[0]
        .split(":", 2)
        .join(":");
      
      arrow = '<i class="fa-solid fa-arrow-right"></i>'
      arrival = travel.destDate
      .split("T")[1]
      .split("+")[0]
      .split(":", 2)
      .join(":");

      timeCell.innerHTML = departure+" "+arrow+" "+arrival;
      row.appendChild(timeCell);

      if (travel.delay > 0) {
        var delayCell = document.createElement("td");
        delayCell.className = "delay";
        delayCell.innerHTML = "+" + Math.round(travel.delay);
        row.appendChild(delayCell);
      } else {
        var delayCell = document.createElement("td");
        delayCell.className = "delay0";
        delayCell.innerHTML = "  ";
        row.appendChild(delayCell);
      }
      console.log(travel.crowd);
      var crowd = document.createElement("td");
      if(travel.crowd == "LOW") {
        crowd.className = "crowd-low";
        crowd.innerHTML = '<i class="fa-solid fa-person"></i>'
      } else if(travel.crowd == "MEDIUM") {
        crowd.className = "crowd-medium";
        crowd.innerHTML = '<i class="fa-solid fa-person"></i><i class="fa-solid fa-person"></i>'
      } else if(travel.crowd == "HIGH") {
        crowd.className = "crowd-high";
        crowd.innerHTML = '<i class="fa-solid fa-person"></i><i class="fa-solid fa-person"></i><i class="fa-solid fa-person"></i>'
      } else {
        crowd.className = "crowd-unknown";
        crowd.innerHTML = '<i class="fa-solid fa-user-slash"></i>'
      }
      row.appendChild(crowd);

      var trainCell = document.createElement("td");
      trainCell.className = "train";
      trainCell.innerHTML = travel.train;
      row.appendChild(trainCell);

      var DirectionCell = document.createElement("td");
      DirectionCell.className = "direction";
      DirectionCell.innerHTML = travel.direction;
      row.appendChild(DirectionCell);

      var stationCell = document.createElement("td");
      stationCell.className = "station";
      stationCell.innerHTML = travel.originStation+" "+travel.originTrack+" "+'<i class="fa-solid fa-arrow-right"></i>'+" "+travel.destStation+" "+travel.destTrack;
      row.appendChild(stationCell);

      

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
      const parsedPlannedDate = this.dateParser(travel.legs[0].origin.plannedDateTime);
      var calculatedDelay = 0;
      var actualDepartureTime = travel.legs[0].origin.plannedDateTime;
      if(travel.legs[0].origin.actualDateTime !== undefined) {
        const parsedActualDate = this.dateParser(travel.legs[0].origin.actualDateTime);
        actualDepartureTime = travel.legs[0].origin.actualDateTime
        calculatedDelay = (parsedActualDate - parsedPlannedDate) / (1000 * 60);
      }
      var originTrack = '?';
      var destTrack = '?';
      if (travel.legs[0].origin.actualTrack !== undefined) {
        originTrack = travel.legs[0].origin.actualTrack
      }
      if (travel.legs[0].destination.actualTrack !== undefined) {
        destTrack = travel.legs[0].destination.actualTrack
      }
      let travelData = {
        train: travel.legs[0].product.shortCategoryName,
        direction: travel.legs[0].direction,
        originTrack: originTrack,
        originStation: travel.legs[0].origin.name,
        destTrack: destTrack,
        destStation: travel.legs[0].destination.name,
        plannedDepartureDate: travel.legs[0].origin.plannedDateTime,
        destDate: travel.legs[0].destination.plannedDateTime,
        delay: calculatedDelay,
        crowd: travel.legs[0].crowdForecast
      };
      this.travels.push(travelData);
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
