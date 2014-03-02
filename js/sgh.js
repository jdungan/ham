"use strict";


// location watch object
function Location() {
  var options = {enableHighAccuracy: true},
  inner_pos={},
  dfd = new $.Deferred(),
  moved = function(pos) {
    inner_pos = pos || {};
    dfd.resolve()
  },
  fail = function (err) {
      if (err){
          console.warn('ERROR(' + err.code + '): ' + err.message);
      }
      dfd.reject()
  };

  this.__defineGetter__("lat", function(){
    return inner_pos.coords ? inner_pos.coords.latitude : null;
  });

  this.__defineGetter__("lng", function(){
      
      return inner_pos.coords ? inner_pos.coords.longitude: null ;
  });

  this.WatchID =navigator.geolocation.watchPosition(moved, fail, options);

  this.ready = dfd.promise()
}


// http://206.214.166.144/api/score/-95.9911,36.1498?callback=your_function

// creates a new sgh api object in the global space
var sgh = new(function api() {
  var dfd = new $.Deferred()
  
  
  this.loc = new Location;
  
  this.loc.__defineGetter__("position", function(){
      return this.lng+','+this.lat;
  });
  
  this.loc.ready.done(function () {
    return dfd.resolve()
  })

  this.ready = dfd.promise()
  
  var api_calls = [
  { 'name': 'sample',
    'uri': 'api/score/'}
  ]

  this.options = this.options || {
    url: 'http://206.214.166.144/'
  };

  this.call_api = function(uri, ajax_params) {
    ajax_params = ajax_params || {};
    return $.ajax({
      type: "get",
      url: this.options.url + uri + this.loc.position,
      data: ajax_params,
      dataType: 'jsonp',
    })
  };
  
  // setup simple api mappings
  api_calls.every(function(v, i) {
    api.prototype[v.name] = function(params) {
      return this.call_api(v.uri, params)
    }
  });
  
})()


//tranform function to be added to svg objects
var transform = function() {
  var order = ['translate', 'scale', 'rotate']
  var toString;
  var inner_translate = inner_translate || {
    x: 0,
    y: 0
  };
  var inner_scale = inner_scale || {
    x: 1,
    y: 1
  };

  var inner_rotate = inner_rotate || 0;

  this.rotate = function(d) {
    if (d)(inner_rotate = d)
    return inner_rotate;
  };

  this.rotate.string = function() {
    return inner_rotate;
  }

  this.translate = function(d) {
    if (d) {
      if (d.x) {
        inner_translate.x = d.x
      }
      if (d.y) {
        inner_translate.y = d.y
      }
    }
    return inner_translate;
  };

  this.translate.string = function() {
    return inner_translate.x + ',' + inner_translate.y
  }

  this.scale = function(d) {
    if (d) {
      if (d.x) {
        inner_scale.x = d.x
      }
      if (d.y) {
        inner_scale.y = d.y
      }
    }
    return inner_scale;
  };

  this.scale.string = function() {
    return inner_scale.x + ',' + inner_scale.y
  }


  this.toString = function() {
    return order.map(
      function(v) {
        return v + '(' + this[v].string() + ') '
      },
      this).join(' ');

  }

}

// d3 based wheel control



  function Wheel(parent) {
    var inner_element = this.element || "";
    var inner_data = this.data || [];
    var options = options || {};
    var inner_wheel= parent.append('g');

    var interval = 2 * Math.PI / circles.length

    var radius = 100;

    var colors = d3.scale.category10();

    var arc2deg = function(x) {
      return 180 * (x / Math.PI)
    }

    var rotate_wheel = function(d) {

      //shift for translate
      d3.event.x -= inner_wheel.transform.translate().x;
      d3.event.y -= inner_wheel.transform.translate().y;


      // //get angle from g center to mouse         
      var start_angle = Math.atan2(d3.event.y - d3.event.dy, d3.event.x - d3.event.dx);
      var end_angle = Math.atan2(d3.event.y, d3.event.x);
      var radian_diff = end_angle - start_angle;
      var degree_diff = Math.round(arc2deg(radian_diff))

      var new_rotate = inner_wheel.transform.rotate() + degree_diff;

      inner_wheel.transform.rotate(new_rotate % 360 + (new_rotate >= 0 ? 0 : 360));


      inner_wheel.attr('transform', inner_wheel.transform.toString())

      $(inner_wheel.node()).trigger('rotate', inner_wheel.transform.rotate())

    };

    var rotate = d3.behavior.drag()
      .on("drag", rotate_wheel);

    inner_wheel
      .attr('id', 'wheel')
      .call(rotate)



    inner_wheel.transform = new transform();

    inner_wheel.update = function(new_data) {

      if (new_data) {
        this.data = new_data

        var arc = d3.svg.arc()
          .outerRadius(100)
          .innerRadius(50)
          .startAngle(function(d, i) {
            return i * interval;
          })
          .endAngle(function(d, i) {
            return (i + 1) * interval;
          });


        var arcs = inner_wheel.selectAll('g.arcs')
          .data(new_data)
          .enter()
          .append('g')
          .attr('class', 'arcs dont_select')

        .append("svg:path")
          .attr({
            id: function(d, i) {
              return 'path' + i
            },
            d: arc,
            fill: function(d, i) {
              return colors(i);
            }
          })

        inner_wheel.attr('transform', inner_wheel.transform.toString());
      }
      return arcs
    }


    return inner_wheel;
  }
