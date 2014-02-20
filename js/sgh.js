"use strict";

var circles = [{
  label: 'Gigem',
  score: 80
}, {
  label: 'Aggies',
  score: 70
}, {
  label: 'Howdy',
  score: 62
}, {
  label: 'Dammit',
  score: 55
}, ]


$("#data_switch").on("pagecreate", function() {

  var svg = d3.select('#canvas')
    .append('svg')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight)


  var interval = 2 * Math.PI / circles.length

  var radius = 100;

  var color = d3.scale.category10();

  var arc2deg = function(x) {
    return x != 0 ? 180 * (x / Math.PI) : 0
  }


  var transformation = function(options) {
    this.options = options;
    this.text = function() {
      options = this.options;
      return 'translate(' + options.translate.x + ',' + options.translate.y + ') scale(' + options.scale.x + ',' + options.scale.y + ') rotate(' + options.rotate + ')'
    }
  }

  var wheel_options = {
    translate: {
      x: window.innerWidth / 2,
      y: window.innerHeight
    },
    scale: {
      x: 4,
      y: 2
    },
    rotate: 0
  }


  var score_options = {
    translate: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 4
    },
    scale: {
      x: 5,
      y: 5
    },
    rotate: 0
  }

  var scores = d3.scale.quantize()
    .domain([0,100])
    .range(['F','F','F','F','F','D','C','B','A']);
  
  var wheel_position = d3.scale.quantize()
  .domain([360,0])
  .range(circles)
  
 
  var score = svg.append('g')
    .attr('id', 'score')
    .append('text')
    .text(scores(circles[0].score))


  var score_trans = new transformation(score_options)


  score.attr('transform',score_trans.text())

  var wheel_trans = new transformation(wheel_options)


  var circle_drag = function(d) {

    //shift for translate
    d3.event.x -= wheel_options.translate.x
    d3.event.y -= wheel_options.translate.y


    // //get angle from g center to mouse         

    var start_angle = Math.atan2(d3.event.y - d3.event.dy, d3.event.x - d3.event.dx);
    var end_angle = Math.atan2(d3.event.y, d3.event.x);
    var radian_diff = end_angle - start_angle;
    var degree_diff = Math.round(arc2deg(radian_diff))


    // if (degree_diff != 0) {
          
      var new_rotate =  wheel_options.rotate + degree_diff;
        
      wheel_options.rotate = new_rotate >= 0 ? new_rotate%360 : 360-(new_rotate%360)
      
      wheel.attr('transform', wheel_trans.text())
  
  
      var category = wheel_position(wheel_options.rotate)
      d3.select('#score').select('text') .text(scores(category.score))
      
      
    // }

  };

  var rotate = d3.behavior.drag()
    .on("drag", circle_drag);

  var wheel = svg.append('g')
    .attr('id', 'wheel')
    .call(rotate)


  var arc = d3.svg.arc()
    .outerRadius(100)
    .innerRadius(20)
    .startAngle(function(d, i) {
      return i * interval;
    })
    .endAngle(function(d, i) {
      return (i + 1) * interval;
    });

  var arcs = wheel.selectAll('g.arcs')
    .data(circles)
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
        return color(i);
      }
    })


  arcs.append('text')
    .attr('class', 'dont_select')
    .append("textPath")
    .attr("xlink:href", function(d, i) {
      return '#path' + i
    })
    .attr('transform', 'translate(20,20)')
    .text(function(d) {
      return d.label
    })


  wheel.attr('transform', wheel_trans.text());


});
