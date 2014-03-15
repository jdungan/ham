"use strict";

// add swipe up and dow to jquerymobile
//http://stackoverflow.com/questions/17131815/how-to-swipe-top-down-jquery-mobile
(function() {
    var supportTouch = $.support.touch,
            scrollEvent = "touchmove scroll",
            touchStartEvent = supportTouch ? "touchstart" : "mousedown",
            touchStopEvent = supportTouch ? "touchend" : "mouseup",
            touchMoveEvent = supportTouch ? "touchmove" : "mousemove";
    $.event.special.swipeupdown = {
        setup: function() {
            var thisObject = this;
            var $this = $(thisObject);
            $this.bind(touchStartEvent, function(event) {
                var data = event.originalEvent.touches ?
                        event.originalEvent.touches[ 0 ] :
                        event,
                        start = {
                            time: (new Date).getTime(),
                            coords: [ data.pageX, data.pageY ],
                            origin: $(event.target)
                        },
                        stop;

                function moveHandler(event) {
                    if (!start) {
                        return;
                    }
                    var data = event.originalEvent.touches ?
                            event.originalEvent.touches[ 0 ] :
                            event;
                    stop = {
                        time: (new Date).getTime(),
                        coords: [ data.pageX, data.pageY ]
                    };

                    // prevent scrolling
                    if (Math.abs(start.coords[1] - stop.coords[1]) > 10) {
                        event.preventDefault();
                    }
                }
                $this
                        .bind(touchMoveEvent, moveHandler)
                        .one(touchStopEvent, function(event) {
                    $this.unbind(touchMoveEvent, moveHandler);
                    if (start && stop) {
                        if (stop.time - start.time < 1000 &&
                                Math.abs(start.coords[1] - stop.coords[1]) > 30 &&
                                Math.abs(start.coords[0] - stop.coords[0]) < 75) {
                            start.origin
                                    .trigger("swipeupdown")
                                    .trigger(start.coords[1] > stop.coords[1] ? "swipeup" : "swipedown");
                        }
                    }
                    start = stop = undefined;
                });
            });
        }
    };
    $.each({
        swipedown: "swipeupdown",
        swipeup: "swipeupdown"
    }, function(event, sourceEvent){
        $.event.special[event] = {
            setup: function(){
                $(this).bind(sourceEvent, $.noop);
            }
        };
    });

})();

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


//tranform function to be added to a d3 objects

  function Transform(element) {
    var order = ['translate', 'scale', 'rotate'];
  
    function xyString() {
      return this.value.x + ',' + this.value.y
    };

    var inner = {
      translate: {
        value: {
          x: 0,
          y: 0
        },
        string: xyString
      },
      scale: {
        value: {
          x: 1,
          y: 1
        },
        string: xyString
      },
      rotate: {
        value: 0,
        string: function() {
          return this.value
        }
      }
    };


    order.forEach(function(v) {
      this[v] = function(d) {
        if (d == undefined) {
          return inner[v].value;
        } else {
          inner[v].value = d;
          return this;
        }
      }
    }, this);

    this.render = function() {
      element.attr('transform', this.toString());
    }

    this.toString = function() {
      return order.map(
        function(v) {
          return v + '(' + inner[v].string() + ')'
        },
        this).join(' ');
    }

  }

  // d3 based wheel control

  function Wheel(options) {
    var options = options || {
      colors: d3.scale.category10(),
      icon_types: ['home', 'group', 'dollar', 'check'],
    };

    function drag_icon(d) {
      
      var icon = d3.select(d3.event.sourceEvent.srcElement)
        
      icon.attr({
        cx:(+icon.attr('cx')+d3.event.dx),
        cy:(+icon.attr('cy')+d3.event.dy)
      })  
    }

    function rotate_wheel(d) {
      var wheel = inner.wheel;
      var transform = inner.wheel.transform;
      
      
      // //get angles from g center to mouse         
      var new_angle = Math.atan2(d3.event.y , d3.event.x)
      var new_rotate = Math.round(arc2deg(new_angle))
     
      console.log(new_rotate)
      transform
        .rotate(new_rotate % 360 + (new_rotate >= 0 ? 0 : 360))
        .render()
    };

    function update(new_data) {

      if (new_data) {

        var interval = 2 * Math.PI / new_data.length;

        inner.wheel.interval = interval;

        inner.wheel.categorize.range(new_data);

        var arc = d3.svg.arc()
          .outerRadius(100)
          .innerRadius(50)
          .startAngle(function(d, i) {
            return i * interval;
          })
          .endAngle(function(d, i) {
            return (i + 1) * interval;
          });

        var arcs = this.selectAll('g.arcs').data(new_data)
        
        arcs.enter()
          .append('g')
          .attr('class', 'arcs dont_select')

        arcs.exit().remove()

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


        arcs.each(function(d, i) {

            var icon = d3.select(this).append('g')
            icon.transform = new Transform(icon);

           var angle = interval * i + (interval / 2),
              r = 90,
              x = r * Math.sin(angle),
              y = r * Math.cos(angle);

            icon.transform
              .translate({
                x: x,
                y: -y
              })
              .rotate(arc2deg(angle))
              .render()

              // icon.append('circle')
              // .attr({cx:0,cy:15, r:20,'fill-opacity':0.2,fill:'white',stroke:'black'})
              // .call(
              //       d3.behavior.drag().on("drag", drag_icon)
              // );


            icon.append('svg:use')
              .attr(
                {'xlink:href': '#' + options.icon_types[i],
                'id': 'icon' + i
              })

        });

      this.transform.render;

    }

    return arcs
  }

  function inner() {

    if (!inner.wheel) {

      inner.wheel = this.append('g')
      
      inner.wheel.transform = new Transform(inner.wheel);

      inner.wheel.categorize = d3.scale.quantize().domain([360, 0]);

      inner.wheel.data = update;
    }

    return inner.wheel;

  }

return inner;

}
