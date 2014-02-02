
L.AnimatedMarker = L.Marker.extend({
  options: {
    // meters
    distance: 200,
    // ms
    interval: 1000,
    // animate on add?
    autoStart: true,
    // callback onend
    onReachingPoint: function () {
    },
    clickable: false
  },

  initialize: function (latlngs, options) {
    this.setLine(latlngs);

    L.Marker.prototype.initialize.call(this, latlngs[0], options);
  },

  // Breaks the line up into tiny chunks (see options) ONLY if CSS3 animations
  // are not supported.
  _chunk: function (latlngs) {
    var i,
      len = latlngs.length,
      chunkedLatLngs = [];


    for (i = 1; i < len; i++) {
      var cur = latlngs[i - 1],
        next = latlngs[i],
        dist = cur.distanceTo(next),
        factor = this.options.distance / dist,
        dLat = factor * (next.lat - cur.lat),
        dLng = factor * (next.lng - cur.lng);
      chunkedLatLngs.push(cur);
      if (dist > this.options.distance) {
        while (dist > this.options.distance) {
          cur = new L.LatLng(cur.lat + dLat, cur.lng + dLng);
          dist = cur.distanceTo(next);
          chunkedLatLngs.push(cur);
        }
      }
    }
    chunkedLatLngs.push(latlngs.slice(-1)[0]);

    return chunkedLatLngs;
  },

  onAdd: function (map) {
    L.Marker.prototype.onAdd.call(this, map);

    // Start animating when added to the map
    if (this.options.autoStart) {
      this.start();
    }

    this._map.on('viewreset', this.onZoomAnim, this);
  },
  onZoomAnim: function (e) {
    if(!this._animation) return;
    this._icon.style[L.DomUtil.TRANSITION] = '';
    var closestPoint = this._map.latLngToLayerPoint(this.__latlng);
    L.DomUtil.setPosition(this._icon, closestPoint);
    setTimeout(function(){
      this._runAnimation(this.__latlng, this._latlngs[1]);
    }.bind(this),10)
  },
  _onPointReached: function () {
    this._originalLatLngs = this._originalLatLngs.slice(1);
    this._currentPoint++;

    if (this._originalLatLngs.length >= 2)
      this._runAnimation(this._originalLatLngs[0], this._originalLatLngs[1]);
    else {
      this.setLatLng(this._originalLatLngs[0]);
      delete this._animation;
    }

    this.options.onReachingPoint.call(this, this._currentPoint);
  },
  // Start the animation
  start: function () {
    this._currentPoint = 0;
    setTimeout(function () {
      this._runAnimation(this._originalLatLngs[0], this._originalLatLngs[1])
    }.bind(this), 10);

  },
  _runAnimation: function (l1, l2) {
    this._latlngs = [l1, l2];
    var speed = l1.distanceTo(l2) / this.options.distance * this.options.interval;
    this._animation = new L.PosAnimation();
    this._animation.run(this._icon, map.latLngToLayerPoint(l2), speed / 1000, 1);
    this._animation.on('step', function() {
      if(!this._animation) return;
      this.__latlng = this._map.layerPointToLatLng(this._animation._getPos());
    }, this)
      .on('end', function(){
        this._onPointReached();
      },this);
  },
  // Stop the animation in place
  stop: function () {
    this._icon.style[L.DomUtil.TRANSITION] = '';
  },

  setLine: function (latlngs) {
    this._originalLatLngs = latlngs;
  }

});

L.animatedMarker = function (latlngs, options) {
  return new L.AnimatedMarker(latlngs, options);
};