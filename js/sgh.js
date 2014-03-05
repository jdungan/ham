"use strict";


// location watch object

function Location() {
  var options = {
    enableHighAccuracy: true
  },
    inner_pos = {},
    dfd = new $.Deferred(),
    moved = function(pos) {
      inner_pos = pos || {};
      dfd.resolve()
    },
    fail = function(err) {
      if (err) {
        console.warn('ERROR(' + err.code + '): ' + err.message);
      }
      dfd.reject()
    };

  this.__defineGetter__("lat", function() {
    return inner_pos.coords ? inner_pos.coords.latitude : null;
  });

  this.__defineGetter__("lng", function() {

    return inner_pos.coords ? inner_pos.coords.longitude : null;
  });

  this.WatchID = navigator.geolocation.watchPosition(moved, fail, options);

  this.ready = dfd.promise()
}


// http://206.214.166.144/api/score/-95.9911,36.1498?callback=your_function

// creates a new sgh api object in the global space
var sgh = new(function api() {
  var dfd = new $.Deferred()

  this.loc = new Location();

  this.loc.__defineGetter__("position", function() {
    return this.lng + ',' + this.lat;
  });

  this.loc.ready.done(function() {
    return dfd.resolve()
  })

  this.ready = dfd.promise()

  var api_calls = [{
    'name': 'sample',
    'uri': 'api/score/'
  }]

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

//handy helper
var arc2deg = function(x) {
  return 180 * (x / Math.PI)
}


//tranform function to be added to svg objects
var transform = function(element) {
  var order = ['translate', 'scale', 'rotate']
  var inner ={
    translate:{x:0,y:0},
    scale:{x:1,y:1},
    rotate:0
  }

  element = element || {};
  
  this.rotate = function(d) {
    if (d)(inner.rotate = d)
    return inner.rotate;
  };

  this.rotate.string = function() {
    return inner.rotate;
  }

  this.translate = function(d) {
    if (d) {
      if (d.x) {
        inner.translate.x = d.x
      }
      if (d.y) {
        inner.translate.y = d.y
      }
    }
    return inner.translate;
  };

  this.translate.string = function() {
    return inner.translate.x + ',' + inner.translate.y
  }

  this.scale = function(d) {
    if (d) {
      if (d.x) {
        inner.scale.x = d.x
      }
      if (d.y) {
        inner.scale.y = d.y
      }
    }
    return inner.scale;
  };

  this.scale.string = function() {
    return inner.scale.x + ',' + inner.scale.y
  }

  this.toString = function() {
    return order.map(
      function(v) {
        return v + '(' + this[v].string() + ')'
      },
      this).join(' ');
  }

  this.__defineGetter__("render", function() {
    if (element){
      element.attr('transform',this.toString());
    } 
  });
  

}

// d3 based wheel control

  function Wheel(options) {
    var options = options || {
      colors: d3.scale.category10(),
      icon_types: ['home', 'group', 'dollar', 'check'],
    };

    var category = d3.scale.quantize().domain([360, 0])

    var rotate_wheel = function(d) {
      
      
      var wheel = inner.wheel;
      var transform = inner.wheel.transform;

      //shift for translate
      eventX = d3.event.x - transform.translate().x;
      eventY = d3.event.y - transform.translate().y;

      // //get angle from g center to mouse         
      var start_angle = Math.atan2(eventY - d3.event.dy, eventX - d3.event.dx);
      var end_angle = Math.atan2(eventY, eventX);
      var degree_diff = Math.round(arc2deg(end_angle - start_angle))

      var new_rotate = transform.rotate() + degree_diff;
      transform.rotate(new_rotate % 360 + (new_rotate >= 0 ? 0 : 360));
      wheel.transform.render
      $(wheel.node()).trigger('rotate', transform.rotate())

    };


    function update(new_data) {

      if (new_data) {
  
        var interval = 2 * Math.PI / new_data.length;

        inner.wheel.interval = interval;
        
        category.range(new_data);

        var arc = d3.svg.arc()
          .outerRadius(100)
          .innerRadius(50)
          .startAngle(function(d, i) {
            return i * interval;
          })
          .endAngle(function(d, i) {
            return (i + 1) * interval;
          });

        var arcs = this.selectAll('g.arcs')
          .data(new_data)
          .enter()
          .append('g')
          .attr('class', 'arcs dont_select')

        arcs.append("svg:path")
          .attr({
            id: function(d, i) {
              return 'path' + i
            },
            d: arc,
            fill: function(d, i) {
              return options.colors(i);
            }
          })

        arcs.append('svg:use')
          .attr('xlink:href', function(d, i) {
            return '#' + options.icon_types[i]
          })
          .attr('id', function(d, i) {
            return 'icon' + i
          })
          .attr("transform", function(d, i) {
            var angle = interval * i + (interval / 2),
              r = 90,
              x = r * Math.sin(angle),
              y = r * Math.cos(angle);
            var icon_transform = new transform();
            icon_transform.translate({
              x: (x),
              y: -y
            })
            icon_transform.rotate(arc2deg(angle));
            return icon_transform.toString();
          })

        this.transform.render;
        
      }
      return arcs
    }

    function inner() {

      if (!inner.wheel){
        
        inner.wheel = this.append('g');
        
        inner.wheel.transform =  new transform(inner.wheel);
        
        inner.wheel.call(
          d3.behavior.drag().on("drag", rotate_wheel)
        );
        
        inner.wheel.category = category;
        
        inner.wheel.data = update;
      } 
      
      return inner.wheel;
    
    }

    return inner;
    
  }
