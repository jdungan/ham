"use strict";

$("#dialer").on("pagecreate", function() {

  var svg = d3.select('#canvas')
    .append('svg')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight)

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
    .render()
   
  svg.wheel = new Wheel();

  svg.wheel().transform
    .translate({
      x: (window.innerWidth / 2),
      y: (window.innerHeight * 0.6)
    })
    .scale({
      x: 2,
      y: 2
    })
    .render()
    
  svg.category = function () {
    return svg.wheel().categorize(svg.wheel().transform.rotate())
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
        d3.select('#score').select('text').text(scores(svg.category().score))
      }
    }
    
  });
  
  $( "#canvas" ).on( "swipedown", function( event ) {
    console.log('down')
    if (svg.category().elements) {
      svg.levels[svg.levels.length-1].rotation = svg.wheel().transform.rotate()
      svg.levels.push(svg.category());
      svg.wheel().data(svg.category().elements); 
 
      d3.select('#title')
        .append('li')
        .text(svg.category().label);
      
      d3.select('#score').select('text').text(scores(svg.category().score))
    }


  })
  
  function turn_wheel(direction){
    var new_rotate =  svg.wheel().transform.rotate()+(direction * arc2deg(svg.wheel().interval))
    svg.wheel()
      .transform
        .rotate(absDeg(new_rotate))
        .render()
    
    $('#title').children().last().text(svg.category().label)
    
    d3.select('#score').select('text').text(scores(svg.category().score))
    
  }
  
  $( "#canvas" ).on( "swipeleft", function( event ) {
    console.log('left')
    turn_wheel(-1)
    
  })
  
  $( "#canvas" ).on( "swiperight", function( event ) {
    console.log('right')
    turn_wheel(1)
  })


  // wait for the api to be ready (which means waiting for position)
  sgh.ready.done(function() {
    sgh.sample()
      .done(function(data) {
        
        // patch for nesting
        data.elements = data.scores;
        
        svg.levels.push(data)
        
        svg.wheel().data(data.elements);
        
        d3.select('#score').select('text').text(scores(svg.category().score))      
            
        d3.select('#title')
          .append('li')
          .text(svg.category().label)

      })
      .error(function(d) {
        debugger;
      });
  });

});
