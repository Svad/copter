var Station = function (latlng) {
  this.coordinates = latlng;
  this.marker = L.marker(latlng, {icon: L.icon({iconUrl: 'imgs/station.png', iconSize:[35,35]})})
};

Station.prototype.addToMap = function(map) {
  this.marker.addTo(map);
  return this;
};

Station.prototype.setCopter = function(copter) {
  this.copter = copter;
}

Station.prototype.full = function(){
  return this.copter !== undefined;
}