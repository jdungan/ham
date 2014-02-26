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
// 
// ,{
//   icon:"home",
//   label: 'Dammit',
//   score: 55
// }, ]

var icons =['home','group','dollar','check']


$("#data_switch").on("pagecreate", function() {

  // circles = sdoh.category

  // FastClick.attach(document.body);

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
      x: window.innerWidth /2 ,
      y: window.innerHeight* .7
    },
    scale: {
      x: 3,
      y: 1.5
    },
    rotate: -arc2deg(interval/2)
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
        
      wheel_options.rotate = new_rotate%360 + ( new_rotate >= 0 ? 0 : 360 )
      
      
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

    var button = wheel.append('circle')
    .attr('fill','blue')
    .attr('r',15)
    // d3.behavior.click()
    .on('click',function (d) {
      // alert('howdy')
    })


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

   arcs.append('svg:path')
      .attr('d',function (d,i) {
        var path=d3.select('path#'+d.icon).attr('d')
        return path;
      })
      .attr("transform", function(d,i) {
        var angle =interval*i+(interval/2),
        r=80,
        x= r*Math.sin(angle),
        y= r*Math.cos(angle);
         
        return "translate("+x+","+(-y)+") rotate("+arc2deg(angle)+")"; 
      })

    

  arcs.append('text')
    .attr('class', 'label dont_select')
    .append("textPath")
    .attr("xlink:href", function(d, i) {
      return '#path' + i
    })
  
  .text(function(d) {
    return d.label
   // return d[Object.keys(d)[0]].icon
  })

  wheel.attr('transform', wheel_trans.text());


});
