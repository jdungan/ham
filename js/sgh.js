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
{label:'A'},
{label:'B'},

  {label:'A'},
  {label:'B'},
  {label:'C'},
  {label:'D'},
  {label:'E'}
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

      var maxR = Math.PI*2
          
      var interval = maxR/circles.length
      
      var radius = 100;

      var g = svg.append('g')
      
      var color =  d3.scale.category10();
      
      var arc2deg = function (x) {
        return Math.round((x > 0 ? x : (maxR + x)) * 360 / maxR)
      }
      
      
      var circle_drag =  function(d) {
        
        circle_drag.rotation= circle_drag.rotation || 0;

            // //get angle from g center to mouse         
            var mouse_angle = Math.atan2(150-d3.event.y, 150-d3.event.x);
            
            var el = d3.select(this),
            elx = el.attr('cx'),
            ely = el.attr('cy');
            var element_angle = Math.atan2(150-ely, 150-elx);

            circle_drag.rotation = circle_drag.rotation + (mouse_angle - element_angle)
            
            g.attr('transform','translate(150,150) rotate('+arc2deg(circle_drag.rotation)+')')
            
          };
      



      var rotate = d3.behavior.drag()
          // .origin( function (d) {
          //   return {x:150,y:150}; 
          // })
          .on("drag", circle_drag);
      
      g.selectAll('circles')
        .data(circles)
        .enter() 
        .append('circle')
        .attr({
          cy:function(d,i){return radius*Math.sin(i*interval);},
          cx:function(d,i){return radius*Math.cos(i*interval);},
          r:20,
          fill:function(d,i){return color(i);}
        })
        .call(rotate)
    
    
    g.attr('transform','translate(150,150)');

    // g.attr({x:150,y:150})


    });

  