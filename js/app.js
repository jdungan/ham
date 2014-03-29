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
      y: (window.innerHeight * 0.9)
    })
    .scale({
      x: 3,
      y: 3
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
        turn_wheel.swipes=0
        svg.wheel()
          .transform
          .rotate(0)
          .render();


        }
                
        $('#title').children().last().remove();
        
        svg.update_score(center_icon)
      }
    
  });
  
  $( "#canvas" ).on( "swipedown", function( event ) {
    console.log('down')
    
    var center_icon = svg.wheel().visible_icons[1]
    
    if (center_icon.datum().elements) {
      //save current wheel state
      center_icon.datum().swipes = turn_wheel.swipes
      center_icon.datum().rotation = svg.wheel().transform.rotate()      
      svg.levels.push(center_icon.datum());
      
      svg.wheel().data(center_icon.datum().elements); 
      svg.wheel()
      .transform
      .rotate(0)
      .render()

      turn_wheel.swipes=0
      
     var new_center = svg.wheel().visible_icons[1]
 
      d3.select('#title')
        .append('li')
        .text(new_center.datum().label);
      
        svg.update_score(new_center.datum())
    }


  })
  
  function turn_wheel(direction){
    var interval = svg.wheel().interval;

    
    turn_wheel.degrees = turn_wheel.degrees || arc2deg(interval);
    turn_wheel.swipes = turn_wheel.swipes || 0;    
    turn_wheel.swipes = direction===0 ? 0 : turn_wheel.swipes+= direction; 
    
    console.log(turn_wheel.swipes)
    
    var current_rotation = svg.wheel().transform.rotate(),
    new_rotate =  current_rotation+(-direction * turn_wheel.degrees),
    shrink_icon= svg.wheel().visible_icons[1],
    grow_icon= svg.wheel().visible_icons[(direction===1 ? 2 : 0)],
    reveal_angle = interval* (turn_wheel.swipes+direction);


//find the icon to reveal        
    var reveal_icon = direction===1
      ? svg.wheel().hidden_icons.pop()
      : svg.wheel().hidden_icons.shift()

// move it to visible arrary
    direction===1
      ? svg.wheel().visible_icons.push(reveal_icon)
      : svg.wheel().visible_icons.unshift(reveal_icon)
        
//find the icon to hide
    var hide_icon = direction===1 
      ? svg.wheel().visible_icons.shift()
      : svg.wheel().visible_icons.pop()

//move it to the hidden array
    direction===1
      ? svg.wheel().hidden_icons.unshift(hide_icon)
      : svg.wheel().hidden_icons.push(hide_icon)


//start animations
    
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
      .translate(fromCenter(80,reveal_angle))
      .rotate(arc2deg(reveal_angle))
      .scale({x:.5 , y:.5})
      .animate({'opacity':'1',duration:50})

      console.log({current_rotation:current_rotation,new_rotate:new_rotate,reveal_angle:arc2deg(reveal_angle)})

    svg.wheel()
      .transform
      .rotate(new_rotate)
      .animate()

    hide_icon.datum() 
      .transform
      .translate({x: 0,y: 0})
      .rotate(0)
      .scale({x:.5 , y:.5})
      .animate({'opacity': '0',duration:2000})
        
      
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
