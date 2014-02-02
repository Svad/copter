var Copter = function () {
  this.marker = L.animatedMarker([], {autoStart: false,
    //настройка скорости
    distance: 50, // расстояние в метрах
    interval: 10,  // время в мс
    onReachingPoint: this.onReachingPoint.bind(this), icon: L.icon({iconUrl: 'imgs/copter.png', iconSize: [48, 48]})});
  this.status = Copter.statuses.onHold;
  this.route = L.polyline([]).addTo(map);
};

Copter.statuses = {'onOrder': 'onOrder', 'onHold': 'onHold', 'onWayBack': 'onWayBack'};

Copter.prototype = {
  assignStation: function (station) {
    this.marker.setLatLng(station.coordinates).addTo(map);
    this.station = station;
  },
  assignOrder: function (order, endStation) {
    this._order = order;
    this.status = Copter.statuses.onOrder;

    this.station = endStation;
    //формируем маршрут
    this.route.setLatLngs([this.marker.getLatLng(), order.origin, order.destination, endStation.coordinates]);

    this.marker.setLine(this.route.getLatLngs());
    this.marker.start();
  },
  onReachingPoint: function (pointNum) {
    switch (pointNum) {
      //Подобрали заказ
      case 1:
        this._order.setStatus(Order.statuses.inAir);
        break;
      //доставили заказ
      case 2:
        this._order.setStatus(Order.statuses.done);
        this.status = Copter.statuses.onWayBack;
        break;
      //вернулся на станцию
      case 3:
        this.status = Copter.statuses.onHold;
        this.marker.stop();
        this.route.setLatLngs([]);
        this.onStationReturn(this);
    }
    if(!$scope.$$phase)
      $scope.$apply();
  },
  onStationReturn: function(){}
};