"use strict";

$("#viewer").on("pagecreate", function() {
  
  var viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  
  var svg = d3.select('#canvas').attr(viewport);
    
  var cross = new Viewfinder(svg)
  
  cross.transform.scale({x:3,y:3})
  
  cross.position({x:175,y:viewport.height/2})  
  
    
  // var first = new Card(svg)  
  // first.title("healtharound.me")
  // first.level( 1)
  // first.strip.fill('blue')  



  // wait for the api to be ready (which means waiting for position)
  ham.ready.done(function() {
    ham.sample()
      .done(function(data) {
        
        // patch for nesting
        data.elements = data.scores;
        
        var s = new  Card(svg)
        s.title(data.elements[0].label)
        s.footer('healtharound.me')
        debugger;
        s.update([data.elements])  
        
        

      })
      .error(function(d) {
        debugger;
      });
  });

});
