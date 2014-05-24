"use strict";
$("#viewer").on("pagecreate", function() {


  // wait for the api to be ready (which means waiting for position)
  ham.ready.done(function() {
    ham.score()
      .done(function(data) {

        treemap(data)

      })
      .error(function(d) {
        debugger;
      });
  });

});
