var Manager = function ($scope) {
  this.orders = [];
  this.copters = [];
  this.stations = [];
  this.$scope = $scope;
};

Manager.prototype = {
  init: function () {
    this.generateStations();
    this.generateCopters();
    this.orderGenerationLoop();
  },
  generateStations: function () {
    var boundsInMeters = bounds.getNorthWest().distanceTo(bounds.getNorthEast()),
      boundsInPixels = map.latLngToLayerPoint(bounds.getNorthEast()).distanceTo(map.latLngToLayerPoint(bounds.getNorthWest())),
      stationsDistanceInPixels = boundsInPixels * STATIONS_DISTANCE / boundsInMeters,
      initPosition = map.latLngToLayerPoint(bounds.getNorthWest());

    var points = [];
    for (var i = 0; i < boundsInPixels / stationsDistanceInPixels; ++i) {
      for (var j = 0; j < boundsInPixels / stationsDistanceInPixels; ++j) {
        points.push(initPosition.add([i * stationsDistanceInPixels, j * stationsDistanceInPixels]))
      }
    }

    points.map(function (p) {
      return map.layerPointToLatLng(p)
    }).forEach(function (ll) {
        this.stations.push(new Station(ll).addToMap(map));
      }.bind(this))
  },

  generateCopters: function () {
    for (var i = 0; i < COPTERS_COUNT; ++i) {
      var stationIndex = Math.floor(Math.random() * this.stations.length),
        station = this.stations[stationIndex];

      //Пропускаем уже занятые станции
      if (station.full()) {
        --i;
        continue;
      }

      var copter = new Copter();
      copter.onStationReturn = this.onCopterReturn.bind(this);
      copter.assignStation(station);
      station.setCopter(copter);
      this.copters.push(copter);
    }
  },

  onCopterReturn: function(copter) {
    var order = copter._order;
    order.deliveryTime = moment(new Date).diff(moment(order.startTime), 's');
    delete copter._order;
    this.distributeOrders();
  },
  onNewOrder: function (order) {
    this.orders.push(order);
    this.distributeOrders();
  },
  /**
   * распределить заказы
   */
  distributeOrders: function(){
    this.orders.filter(function(order){
      return order.status === Order.statuses.new;
    }).forEach(this.serveOrder.bind(this));
    if(!this.$scope.$$phase)
      this.$scope.$apply();
  },
  /**
   * обслужить зазаз
   * @param order
   */
  serveOrder: function(order) {
    var closestCopter = this.findClosestCopter(order.origin);
    if (!closestCopter) return;
    //станция, на которой находится коптер в данный момент
    var startStation = closestCopter.station;
    //освобождаем станцию
    startStation.copter = undefined;

    //конечная станция, на которой запаркуется коптер
    var endStation = this.findClosestStation(order.destination);

    if(!endStation) return;
    //резервируем конечную станцию для коптера
    endStation.setCopter(closestCopter);

    closestCopter.assignOrder(order, endStation);

    order.status = Order.statuses.inProgress;
    order.startTime = new Date;
  },

  findClosestCopter: function (latlng) {
    //находим коптеры со статусом 'onHold'
    var readyCopters = this.copters
      .filter(function (copter) {
        return copter.status === Copter.statuses.onHold;
      });

    if (readyCopters.length === 0) return null;

    //среди них находим ближайший
    return readyCopters.reduce(function (copter1, copter2) {
        if (copter1 === undefined)
          return copter2;
        return latlng.distanceTo(copter1.marker.getLatLng()) < latlng.distanceTo(copter2.marker.getLatLng()) ? copter1 : copter2;
      }
    )
  },

  orderGenerationLoop: function () {
    var order = new Order(generateRandomLatLngWithinBounds(), generateRandomLatLngWithinBounds()).addToMap(map);
    order._index = ++ORDER_INDEX;
    this.onNewOrder(order);
    setTimeout(this.orderGenerationLoop.bind(this), ORDER_GENERATION_INTERVAL);
  },

  findClosestStation: function(latlng) {
    //находим свободные станции
    var emptyStations = this.stations
      .filter(function (station) {
        return !station.full();
      });

    if (emptyStations.length === 0) return null;

    //среди пустых станций находим ближайшую
    return emptyStations.reduce(function (station1, station2) {
        if (station1 === undefined)
          return station2;
        return latlng.distanceTo(station1.coordinates) < latlng.distanceTo(station2.coordinates) ? station1 : station2;
      }
    )
  }
};


