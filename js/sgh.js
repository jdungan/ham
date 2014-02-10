"use strict";

var sliders=[

  { cx: function () {
          return window.innerWidth/2
        },
    cy: function () {
          return 50
        },
    r:50,
    fill:'blue',
    constraint: function (){}
  },
  
  { cx: function () {
          return window.innerWidth/2
        },
    cy: function () {
          return 50
        },
    r:50,
    fill:'red',
    drag: function (){}
  }]


var circles =[  
  {label:'Howdy',score:50},
  {label:'Dammit',score:55},
  {label:'Gigem',score:52},
  {label:'Aggies',score:70},
  {label:'Rock',score:150},
  {label:'Rockelle',score:530},
  {label:'Good Bull',score:84}
]

    
    
    function resizeAll() {
      d3.select(this[0][0])
        .attr('width', window.innerWidth)
        .attr('height', window.innerHeight)
    }

    var drag = d3.behavior.drag()
        .origin(Object)
        .on("drag", dragmove);
        
    function dragmove(d) {
      var this_circle = d3.select(this);
      this_circle
        .attr("cy",(+this_circle.attr('cy'))+d3.event.dy) 
        .attr("cx",(+this_circle.attr('cx'))+d3.event.dx) 

    }


    $("#data_switch").on("pagecreate", function() {


        var svg = d3.select('#canvas')
          .append('svg')
            .attr('width',window.innerWidth)
            .attr('height',window.innerHeight/2)

        // svg.selectAll('circles')
        //   .data(sliders)
        //   .enter() 
        //   .append('circle')
        //   .attr('cx', function (d) {
        //     return d.cx()
        //   })
        //   .attr('cy', function (d) {
        //     return d.cy()
        //   })
        //   .attr('r', function (d) {
        //     return d.r
        //   })
        //   .attr('fill',function (d) {
        //     return d.fill
        //   })
        //   .call(drag)

      var twoPI = Math.PI*2
          
      var interval = twoPI/circles.length
      
      var radius = 100;
      
      var color =  d3.scale.category10();
      
      var arc2deg = function (x) {
        return Math.round((x > 0 ? x : (twoPI + x)) * 360 / twoPI)
      }
      
      
      var circle_drag =  function(d) {
        
        // save rotation in radians
        circle_drag.rotation= circle_drag.rotation || 0;

        // //get angle from g center to mouse         
                
        var start_angle = Math.atan2(d3.event.y-d3.event.dy, d3.event.x-d3.event.dx);
        var end_angle = Math.atan2(d3.event.y, d3.event.x);
        var angle_diff = end_angle-start_angle
        
        circle_drag.rotation += angle_diff;
        
        arcs.attr('transform','translate(150,150) rotate('+arc2deg(circle_drag.rotation)+')')
            
      };
      
      var rotate = d3.behavior.drag()
          .on("drag", circle_drag);
      
      var arc = d3.svg.arc()
        .outerRadius(100)
        .innerRadius(60)
        .startAngle(function(d,i){
            return i*interval;
        })
        .endAngle(function(d,i){
            return (i+1)*interval;
        });
      
      var arcs = svg.selectAll('g.arcs')
        .data(circles)
        .enter() 
        .append('g')
          .attr('class','arcs')
        
      arcs.append("svg:path")
        .attr({
          id: function (d,i){
            return 'path'+i
          },
          d:arc,
          fill:function(d,i){return color(i);}
        })
        .call(rotate)
        
    arcs.append('text')
      .append("textPath")
        .attr("xlink:href", function (d,i) {
          return '#path'+i
        })
        .text(function (d) {
          return d.label
        })
    
    
    arcs.attr('transform','translate(150,150)');


    });

  