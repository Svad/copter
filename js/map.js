var STATIONS_DISTANCE = 5e3;//километры
var COPTERS_COUNT = 10;
var ORDER_GENERATION_INTERVAL = 3000; // мс

var bounds = L.latLngBounds(L.latLng(55.878777527891785, 37.8204345703125), L.latLng(55.649698632082625, 37.41737365722656));
var map = L.map('map').setView([55.75, 37.616667], 11);
var tileLayer = L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

map.on('click', function (e) {
  console.log(e.latlng)
});

function generateRandomLatLngWithinBounds() {
  var southEastPoint = map.latLngToLayerPoint(bounds.getSouthEast()),
    northWestPoint = map.latLngToLayerPoint(bounds.getNorthWest());

  return L.latLng(
    map.layerPointToLatLng(
      L.point(Math.random() * (northWestPoint.x - southEastPoint.x) + southEastPoint.x, Math.random() * (southEastPoint.y - northWestPoint.y) + northWestPoint.y)
    )
  );
}

var app = angular.module('app', [])
  .controller('Orders',['$scope', function($scope){


      var manager = new Manager($scope);
      manager.init();
      $scope.orders = manager.orders;

  }]);


