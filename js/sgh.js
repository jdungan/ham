"use strict";


// http://206.214.166.144/api/score/-95.9911,36.1498/?format=json

var sgh = new (function api() {

  var call_map = [
  { 'name': 'sample',
    'uri': 'api/score/-95.9911,36.1498'}
  ]

  this.options = this.options || {
      url: 'http://206.214.166.144/'
  };

  
  this.call_api = function (resource, ajax_params){
      ajax_params = ajax_params || {};
      return $.ajax({
          type: "get",
          url: this.options.url+resource,
          data: ajax_params,
          dataType: 'jsonp',
      })
  };
  // setup simple api mappings
  call_map.every(function(v, i){
      api.prototype[v.name] = function(params){
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
  var inner_wheel;
  
  var interval = 2 * Math.PI / circles.length

  var radius = 100;

  var colors = d3.scale.category10();

  var arc2deg = function(x) {
    return 180 * (x / Math.PI)
  }
  
  
  inner_wheel = parent.append('g');

  inner_wheel.transform = new transform();

  inner_wheel.update = function (new_data) {
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
    
    
    
    }
      
      
      
    
      return arcs
  }
  
  
  return inner_wheel;
}
