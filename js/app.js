"use strict";

$("#viewer").on("pagecreate", function() {

  var viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  },
    stops = {
      zero :{
        x:0,
        y:0
      },
      top: {
        x: 0,
        y: viewport.height * .05
      },
      foot: {
        x: 0,
        y: viewport.height * .95
      },
      out: {
        x: 0,
        y: viewport.height * 1.05
      }
    },
    cards=[]




  var svg = d3.select('#canvas').attr(viewport);

  var cross = new Viewfinder(svg)

  cross.transform.scale({
    x: 3,
    y: 3
  })

  cross.position({
    x: 125,
    y: viewport.height / 2
  })

  
  var move_card = function(c,pos){

    c.transform
      .translate(pos)
      .animate({
        ease: 'cubic',
        duration: 800
      })

  }



  
  
  // wait for the api to be ready (which means waiting for position)
  ham.ready.done(function() {
    ham.sample()
      .done(function(data) {



        var toggle_stop = function(e) {

          switch (cards.length) {
            case 0:
              move_card(c1,stops.foot)
              cards.push(c1)
              break;
            case 1:
              if (cards[0]===c1){
                cards.push(c2)
                move_card(c1,stops.out)
                move_card(c2,stops.foot)
              } else {
                cards.pop()
                move_card(c2,stops.zero)
                move_card(c1,stops.top)
              }
              break;
            case 2:
              cards.shift()
              move_card(c2,stops.top)
              move_card(c1,stops.foot)
              break;
          }
        
        }

        console.log(data)
        // patch for nesting
        data.elements = data.scores;

        var c1 = new Card(svg)
        c1.title(data.elements[0].label)
        c1.footer('healtharound.me')
        c1.update([data])

        c1.title_text.on('mousedown', toggle_stop)

        var c2 = new Card(svg)
        c2.title(data.elements[0].label)
        c2.update(data.elements)
        c2.title_text.on('mousedown', toggle_stop)

        var third_elements = []

        data.elements.forEach(function(v) {
          third_elements = third_elements.concat(v.elements)
        })

        var c3 = new Card(svg)
        c3.update(third_elements)

        c1.transform.translate(stops.top).animate()



      })
      .error(function(d) {
        debugger;
      });
  });

});
