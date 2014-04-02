"use strict";

$("#dialer").on("pagecreate", function() {
  
  var svg = d3.select('#canvas')
    .append('svg')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight*.8)
    svg.wheels=[];


    var add_card = function(){
      var card = new ScoreCard(svg)
      card().transform.translate({
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.1 
      })
      .scale({
        x: 4,
        y: 4
      })
      .render()
    return card()  
    }

    var score = add_card();
       
  var add_wheel = function(){
    var wheel = new Wheel(svg);
    wheel().transform
      .translate({
        x: (window.innerWidth / 2),
        y: (window.innerHeight * 0.8)
      })
      .scale({
        x: 2.2,
        y: 2
      })
      .render()     
      return wheel();
  }
   
  svg.category = function () {
    return svg.wheel().categorize(svg.wheel().transform.rotate())
  }

  $( "#canvas" ).on( "swipeup", function( event ) {
    console.log('up')
    if (svg.wheels.length != 1) {

      svg.wheels.shift().remove()
      
      svg.wheels.forEach(function (v) {
        var scale = v.transform.scale()
        scale.x*=1/.75
        scale.y*=1/.75
        v.transform.scale(scale).animate()
      })

                
        $('#title').children().last().remove();
        
        score.setScore(svg.wheels[0].focus())

      }
    
  });
  
  $( "#canvas" ).on( "swipedown", function( event ) {
    console.log('down')
    
    var center_icon = svg.wheels[0].focus()
    
    var d = center_icon.datum()

    if (d.elements) {

      svg.wheels.forEach(function (v) {
        var scale = v.transform.scale()
        scale.x*=.7
        scale.y*=.7
        v.transform.scale(scale).animate()
      })
      
      svg.wheels.unshift(add_wheel())
      
      svg.wheels[0].data(d.elements);
          
      score.setScore(d.elements[0])
      
      d3.select('#title')
        .append('li')
        .text(d.elements[0].label)
    }




  })
  
  function turn_wheel(direction){

    var new_focus = svg.wheels[0].turn(direction)
    
    $('#title').children().last().text(new_focus.datum().label)
    
    score.setScore(new_focus.datum())
    
  }
  
  $( "#canvas" ).on( "swipeleft", function( event ) {
    console.log('left')
    turn_wheel(1)
    
  })
  
  $( "#canvas" ).on( "swiperight", function( event ) {
    console.log('right')
    turn_wheel(-1)
  })

  $( "#canvas" ).on( "info_clicked", function( event ) {
    $.mobile.changePage( "#locale", {
      changeHash: false
    });
  })

  $( "#canvas" ).on( "info_clicked", function( event ) {
    $.mobile.changePage( "#locale", {
      changeHash: false
    });
  })

  $( "i.home_button" ).on( 'click', function( event ) {
    $.mobile.changePage( "#dialer", {
      changeHash: false
    });
  })

  // wait for the api to be ready (which means waiting for position)
  sgh.ready.done(function() {
    sgh.sample()
      .done(function(data) {
        
        // patch for nesting
        data.elements = data.scores;
        
        // svg.levels.push(data)
        
        svg.wheels.unshift(add_wheel())
        
        svg.wheels[0].data(data.elements);
        
        score.setScore(data.elements[0])
            
        d3.select('#title')
          .append('li')
          .text(data.elements[0].label)

      })
      .error(function(d) {
        debugger;
      });
  });

});
