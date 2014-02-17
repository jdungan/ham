"use strict";

  var circles =[  
    {label:'Howdy',score:50},
    {label:'Dammit',score:55},
    {label:'Gigem',score:52},
    {label:'Aggies',score:70},
    {label:'Rock',score:150},
    {label:'Good',score:530},
    {label:'Bull',score:84}
  ]


    $("#data_switch").on("pagecreate", function() {

      var svg = d3.select('#canvas')
        .append('svg')
          .attr('width',window.innerWidth)
          .attr('height',window.innerHeight/2)


      var twoPI = Math.PI*2
          
      var interval = twoPI/circles.length
      
      var radius = 100;
      
      var color =  d3.scale.category10();
      
      var arc2deg = function (x) {
        return x !=0 ? 180*(x/Math.PI) : 0
      }


      var shift = {
        x:200,
        y:200,
        text: function (){
        return this.x+','+this.y
      },}

      
      var circle_drag =  function(d) {
        
        //shift for translate
        d3.event.x -= shift.x
        d3.event.y -= shift.y
        
        // save rotation in degrees
        circle_drag.rotation= circle_drag.rotation || 0;
        
        // //get angle from g center to mouse         

        var start_angle = Math.atan2(d3.event.y-d3.event.dy, d3.event.x-d3.event.dx);
        var end_angle = Math.atan2(d3.event.y, d3.event.x);
        var radian_diff = end_angle-start_angle;
        var degree_diff = arc2deg(radian_diff)
      
        circle_drag.rotation += degree_diff 
                
        wheel.attr('transform','translate('+shift.text()+') scale(1.5) rotate('+circle_drag.rotation+')')
            
      };
      
      var rotate = d3.behavior.drag()
          // .origin(function(d,i) { return {x:150, y:150}; })
          .on("drag", circle_drag);
      
      var wheel = svg.append('g')
        .attr('id','wheel')
        .call(rotate)

      
      var arc = d3.svg.arc()
        .outerRadius(100)
        .innerRadius(50)
        .startAngle(function(d,i){
            return i*interval;
        })
        .endAngle(function(d,i){
            return (i+1)*interval;
        });
      
      
      
      
      var arcs = wheel.selectAll('g.arcs')
        .data(circles)
        .enter() 
        .append('g')
          .attr('class','arcs')
        
      arcs.append("svg:path")
        .attr({
          id: function (d,i){return 'path'+i},
          d:arc,
          fill:function(d,i){return color(i);}
        })
        
        
    arcs.append('text')
      .append("textPath")
        .attr("xlink:href", function (d,i) {return '#path'+i})
        .text(function (d) {return d.label})
    
    
    wheel.attr('transform','translate('+shift.text()+') scale(1.5)');


    });

  