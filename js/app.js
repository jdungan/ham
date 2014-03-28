"use strict";

$("#dialer").on("pagecreate", function() {
  
  var svg = d3.select('#canvas')
    .append('svg')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight*.8)

  var scores = d3.scale.quantize()
    .domain([0, 1])
    .range(['F', 'F', 'F', 'F', 'F', 'D', 'C', 'B', 'A']);

  
  var score = svg.append('g')
    .attr('id', 'score')
    .append('text')
    
  score.transform = new Transform(score)
  
  score
    .transform.translate({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.1 
    })
    .scale({
      x: 4,
      y: 4
    })
    .animate()
   
  svg.wheel = new Wheel();

  svg.wheel().transform
    .translate({
      x: (window.innerWidth / 2),
      y: (window.innerHeight * 0.5)
    })
    .scale({
      x: 2,
      y: 2
    })
    .animate()
    
  svg.category = function () {
    return svg.wheel().categorize(svg.wheel().transform.rotate())
  }

  svg.update_score =function (d) {
    d3.select('#score').select('text').text(scores(d.score)+':'+d.score)
  }

  
  

  svg.levels =[];
  
  $( "#canvas" ).on( "swipeup", function( event ) {
    console.log('up')
    if (svg.levels.length != 1) {
      svg.levels.splice(-1);
      var level = svg.levels[svg.levels.length-1];
        
      if (level) {
        svg.wheel().data(level.elements);
      
        if (level.rotation){
          svg.wheel()
            .transform
            .rotate(level.rotation)
            .render();
        }        
        $('#title').children().last().remove();
        
        svg.update_score(center_icon)
      }
    }
    
  });
  
  $( "#canvas" ).on( "swipedown", function( event ) {
    console.log('down')
    var center_icon = svg.wheel().visible_icons[1]
    if (center_icon.datum().elements) {
      svg.levels[svg.levels.length-1].rotation = svg.wheel().transform.rotate()
      svg.levels.push(center_icon);

      svg.wheel().data(center_icon.datum().elements); 
      console.log({'element count':center_icon.datum().elements.length})
 
      d3.select('#title')
        .append('li')
        .text(svg.wheel().visible_icons[1].datum().label);
      
        svg.update_score(center_icon.datum())
    }


  })
  
  function turn_wheel(direction){
    turn_wheel.degrees = turn_wheel.degrees || arc2deg(svg.wheel().interval);
    turn_wheel.swipes = turn_wheel.swipes || 0;    
    turn_wheel.swipes = direction===0 ? 0 : turn_wheel.swipes+= direction; 
    
    console.log(turn_wheel.swipes)
    
    var current_rotation = svg.wheel().transform.rotate(),
    new_rotate =  current_rotation+(-direction * turn_wheel.degrees),
    interval = svg.wheel().interval;
    
    var shrink_icon= svg.wheel().visible_icons[1]
    var grow_icon= svg.wheel().visible_icons[(direction===1 ? 2 : 0)]

//find the icon to reveal        
    var reveal_icon = direction===-1 
        ? svg.wheel().hidden_icons.shift()
        : svg.wheel().hidden_icons.pop()
//move it to visible arrary
    direction===-1 
        ? svg.wheel().visible_icons.unshift(reveal_icon)
        : svg.wheel().visible_icons.push(reveal_icon)
        
//find the icon to hide
var hide_icon = direction===-1 
  ? svg.wheel().visible_icons.pop()
  : svg.wheel().visible_icons.shift()

//move it to the hidden array
direction===-1 
  ? svg.wheel().hidden_icons.push(hide_icon)
  : svg.wheel().hidden_icons.unshift(hide_icon)

  //start animations

  svg.wheel()
    .transform
    .rotate(new_rotate)
    .animate()
    
  shrink_icon.datum()
    .transform
    .scale({x:.5,y:.5})
    .animate()

  grow_icon.datum()
    .transform
    .scale({x:1.5,y:1.5})
    .animate()

        
  reveal_icon.datum() 
    .transform
    .translate(fromCenter(80,interval* (turn_wheel.swipes+direction)))
    .rotate(arc2deg(interval * (turn_wheel.swipes+direction)))
    .scale({x:.5 , y:.5})
    .animate({'opacity':'1'})

    hide_icon.datum() 
      .transform
      .translate({x: 0,y: 0})
      .rotate(0)
      .scale({x:.5 , y:.5})
      .animate({'opacity': '0'})
        
      
    $('#title').children().last().text(grow_icon.datum().label)
    
    svg.update_score()
    
  }
  
  $( "#canvas" ).on( "swipeleft", function( event ) {
    console.log('left')
    turn_wheel(1)
    
  })
  
  $( "#canvas" ).on( "swiperight", function( event ) {
    console.log('right')
    turn_wheel(-1)
  })


  // wait for the api to be ready (which means waiting for position)
  sgh.ready.done(function() {
    sgh.sample()
      .done(function(data) {
        
        // patch for nesting
        data.elements = data.scores;
        
        svg.levels.push(data)
        
        svg.wheel().data(data.elements);
        
        svg.update_score(data.elements[0])
            
        d3.select('#title')
          .append('li')
          .text(data.elements[0].label)

      })
      .error(function(d) {
        debugger;
      });
  });

});
