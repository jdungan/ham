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

  var wheel_position = d3.scale.quantize()
  .domain([360,0])
  .range(circles)

  var scores = d3.scale.quantize()
    .domain([0,100])
    .range(['F','F','F','F','F','D','C','B','A']);
  
 
  var score = svg.append('g')
    .attr('id', 'score')
    .append('text')
    .text(scores(circles[0].score))
  
    score.transform = new transform()
    score.transform.translate({
        x: window.innerWidth / 2,
        y: window.innerHeight / 4
      })
    score.transform.scale({
        x: 5,
        y: 5
    })
    
    score.attr('transform',score.transform.toString());


    var wheel = new Wheel(svg);

  wheel.transform.translate({
    x: (window.innerWidth / 2),
    y: (window.innerHeight * .7)
  });
  
  wheel.transform.scale({
    x: 2,
    y: 2
  });
  
  //nudge the rotation to position the middle of the first arc at the top
  wheel.transform.rotate(-arc2deg(interval / 2));

  //listen for any rotation and set the score
  $(wheel.node()).on('rotate',function (event,degrees) {
      var category = wheel_position(wheel.transform.rotate())        
      d3.select('#score').select('text') .text(scores(category.score))
      
      
  
  })


  //   var button = wheel.append('circle')
  //   .attr('fill','blue')
  //   .attr('r',15)
  //  
  // 
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

  // wait for the api to be ready (which means waiting for position)
  sgh.ready.done(function () {
    circles = sgh.sample()
      .done(function (data) {
                
        wheel.update(data.Category);

      })
      .error(function (d) {
        debugger;
      });
  });

});



