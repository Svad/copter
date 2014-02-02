var Order = function (origin, destination) {
  this.origin = origin;
  this.destination = destination;
  this.status = Order.statuses.new;
  this._orderIcon = L.icon({iconUrl: 'imgs/order.png', iconSize: [25, 25]});
  this._deliveredOrderIcon = L.icon({iconUrl: 'imgs/order_delivered.png', iconSize: [25, 25]});
  this.marker = L.marker(origin, {icon: this._orderIcon})
};

Order.prototype = {
  addToMap: function (map) {
    this.map = map;
    this.marker.addTo(map);
    return this;
  },
  setStatus: function (status) {
    this.status = status;
    switch (status) {
      case Order.statuses.inAir:
        this.marker.setLatLng(this.destination);
        this.marker.setIcon(this._deliveredOrderIcon);
        break;
      case Order.statuses.done:
        this.map.removeLayer(this.marker);
        break;
    }
  }
}


Order.statuses = {'new': 'new', 'inProgress': 'inProgress', 'inAir': 'inAir', 'done': 'done'};

