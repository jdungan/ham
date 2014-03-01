"use strict";

var circles = [{
  label: 'Gigem',
  icon:"home",
  score: 99
}, {
  icon:"group",
  label: 'Aggies',
  score: 80
}, {
  icon:"dollar",
  label: '1984',
  score: 70
},{
  label: 'Howdy',
  icon:"check",
  score: 60
}
]

var circle2 = [{
  label: 'Gigem',
  icon:"home",
  score: 99
}, {
  icon:"home",
  label: 'Aggies',
  score: 80
}, {
  icon:"home",
  label: '1984',
  score: 70
},{
  label: 'Howdy',
  icon:"home",
  score: 60
}
]
// var icons =['home','group','dollar','check']

$("#data_switch").on("pagecreate", function() {
  
  var svg = d3.select('#canvas')
    .append('svg')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight)


  var interval = 2 * Math.PI / circles.length

  var radius = 100;

  var color = d3.scale.category10();

  var arc2deg = function(x) {
    return 180 * (x / Math.PI)
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
  
    var wheel = new Wheel(svg);

    wheel.update(circles)

  // var score_transform = new transform()
  // score_transform.translate({
  //     x: window.innerWidth / 2,
  //     y: window.innerHeight / 4
  //   })
  //   score_transform.scale({
  //     x: 5,
  //     y: 5
  //   })
  // 
  // score.attr('transform',score_transform.toString());
  // 
  wheel.transform.translate({x:(window.innerWidth / 2), y:(window.innerHeight * .7)});
  wheel.transform.scale({x:2, y:2});
  wheel.transform.rotate(-arc2deg(interval / 2));
  // 
  // var circle_drag = function(d) {
  // 
  //   //shift for translate
  //   d3.event.x -= wheel_transform.translate().x;
  //   d3.event.y -= wheel_transform.translate().y;
  // 
  // 
  //   // //get angle from g center to mouse         
  // 
  //   var start_angle = Math.atan2(d3.event.y - d3.event.dy, d3.event.x - d3.event.dx);
  //   var end_angle = Math.atan2(d3.event.y, d3.event.x);
  //   var radian_diff = end_angle - start_angle;
  //   var degree_diff = Math.round(arc2deg(radian_diff))
  // 
  //         
  //   var new_rotate =  wheel_transform.rotate() + degree_diff;
  //     
  //   wheel_transform.rotate(new_rotate%360 + ( new_rotate >= 0 ? 0 : 360 ));
  //   
  //   
  //   wheel.attr('transform', wheel_transform.toString())
  // 
  // 
  //   var category = wheel_position(wheel_transform.rotate())
  //   
  //   d3.select('#score').select('text') .text(scores(category.score))
  // 
  // };
  // 
  // var rotate = d3.behavior.drag()
  //   .on("drag", circle_drag);
  // 
  // 
  // 
  // var wheel = svg.append('g')
  //   .attr('id', 'wheel')
  //   .call(rotate)
  // 
  // 
  //   var button = wheel.append('circle')
  //   .attr('fill','blue')
  //   .attr('r',15)
  //  
  // 
  // var arc = d3.svg.arc()
  //   .outerRadius(100)
  //   .innerRadius(50)
  //   .startAngle(function(d, i) {
  //     return i * interval;
  //   })
  //   .endAngle(function(d, i) {
  //     return (i + 1) * interval;
  //   });
  // 
  // var arcs = wheel.selectAll('g.arcs')
  //   .data(circles)
  //   .enter()
  //   .append('g')
  //   .attr('class', 'arcs dont_select')
  // 
  // 
  // arcs.append("svg:path")
  //   .attr({
  //     id: function(d, i) {
  //       return 'path' + i
  //     },
  //     d: arc,
  //     fill: function(d, i) {
  //       return color(i);
  //     }
  //   })
  // 
  // var icon_transform = new transform();
  // 
  // arcs
  //     .append('svg:path')
  //     .attr({width:100,height:40})
  //     .attr('d',function (d,i) {
  //       var path=d3.select('path#'+d.icon).attr('d')
  //       
  //       return path;
  //     })
  //     .attr('id',function (d,i) {
  //       return 'icon'+i
  //     })
  //     .attr("transform", function(d,i) {
  //       var angle =interval*i+(interval/2),
  //       r=80,
  //       x= r*Math.sin(angle),
  //       y= r*Math.cos(angle);
  //       icon_transform.translate({x:(x),y: -y})
  //       icon_transform.rotate(arc2deg(angle));
  //       return icon_transform.toString(); 
  //     })
  // 
  // 
  // 
  //   
  //     var downArrow_transform = new transform();
  //     downArrow_transform.translate().x =(wheel_transform.translate().x-73)
  //     downArrow_transform.translate().y =(wheel_transform.translate().y-150)
  //     downArrow_transform.scale({x:5,y:5});
  //     
  // 
  //     svg.append('g')
  //     .append('svg:path')
  //     .attr('d',function (d,i) {
  //       return d3.select('path#down_arrow').attr('d')
  //     })
  //     .attr({'fill-opacity':0,'stroke-opacity':1,stroke:'black'})
  //     .attr('transform',downArrow_transform.toString())



  // arcs.append('text')
  //   .attr('class', 'label dont_select')
  //   .append("textPath")
  //   .attr("xlink:href", function(d, i) {
  //     return '#path' + i
  //   })
  // 
  // .text(function(d) {
  //   return d.label
  //  // return d[Object.keys(d)[0]].icon
  // })

  wheel.attr('transform', wheel.transform.toString());

  // circles = sgh.sample()
  //   .done(function (data) {
  //     wheel.data(data);
  //   })
  //   .error(function (d) {
  //     debugger;
  //   });


});
