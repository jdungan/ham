"use strict";

$("#viewer").on("pagecreate", function() {
  
  var viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  
  var svg = d3.select('#canvas').attr(viewport);
    
  var first = new Card(svg)

  first.title("first")
  first.level( 1)
  first.strip.fill('green')  

  var second = new Card(svg)

  second.title("second")
  second.level(2)
  second.strip.fill('yellow')  
    
  var third = new Card(svg)

  third.title("third")
  third.level(3)
  third.strip.fill('blue')  

  // $( "#canvas" ).on( "swipeleft", function( event ) {
  //   console.log('left')
  //   turn_wheel(1)
  //   
  // })
  // 
  // $( "#canvas" ).on( "swiperight", function( event ) {
  //   console.log('right')
  //   turn_wheel(-1)
  // })
  // 
  // 
  // $( "#canvas" ).on( "info_clicked", function( event ) {
  //   $.mobile.changePage( "#locale", {
  //     changeHash: false
  //   });
  // })
  // 
  // $( "i.home_button" ).on( 'click', function( event ) {
  //   $.mobile.changePage( "#dialer", {
  //     changeHash: false
  //   });
  // })

  // wait for the api to be ready (which means waiting for position)
  ham.ready.done(function() {
    ham.sample()
      .done(function(data) {
        
        // patch for nesting
        data.elements = data.scores;

      })
      .error(function(d) {
        debugger;
      });
  });

});
