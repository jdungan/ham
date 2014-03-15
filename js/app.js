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
    // .text(scores(circles[0].score))
    .text('A')
    
  score.transform = new Transform(score)
  
  score
    .transform.translate({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.25 
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

    svg.category = function () {
      return svg.wheel().categorize(svg.wheel().transform.rotate())
    }


  $( "#canvas" ).on( "swipeup", function( event ) {
    console.log('up')
    
  })
  $( "#canvas" ).on( "swipedown", function( event ) {
    console.log('down')

    if (svg.category().elements) {
      svg.wheel().data(svg.category().elements);
      d3.select('#title')
        .append('li')
        .text(svg.category().label)
      
      d3.select('#score').select('text').text(scores(svg.category().score))
    }


  })
  
  function turn_wheel(direction){

    var new_rotate =  svg.wheel().transform.rotate()+(direction * arc2deg(svg.wheel().interval))
    
    var new_rotation = new_rotate % 360 + (new_rotate >= 0 ? 0 : 360)
    
    
    svg.wheel()
      .transform
        .rotate(new_rotation)
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
        svg.wheel().data(data.scores);
        console.log(data);
        //nudge the rotation to position the middle of the first arc at the top
        svg.wheel()
          .transform
            .rotate(-arc2deg(svg.wheel().interval / 2))
            .render()
            
        d3.select('#title')
          .append('li')
          .text(svg.category().label)
        

      })
      .error(function(d) {
        debugger;
      });
  });

});
