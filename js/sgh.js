"use strict";

// {
// function (api) {
//   
//   return api
// }  
//   
//   
// }(sgh_api)


// http://206.214.166.144/api/score/-95.9911,36.1498/?format=json


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
