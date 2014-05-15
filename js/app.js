"use strict";

var cross ={}
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

   cross = new Viewfinder(svg)

  cross.transform.scale({
    x: 3,
    y: 3
  })

  cross.position({
    x: 125,
    y: viewport.height / 2
  })

  




  // wait for the api to be ready (which means waiting for position)
  ham.ready.done(function() {
    ham.sample()
      .done(function(data) {


        var c1_toggle = function(d,i){
          switch (cards.length) {
            case 0:
              c1.move(stops.foot)
              c2.move(stops.top)
              cards.push(c1)
              break;
            case 1:
              c1.move(stops.top)
              c2.move(stops.zero)
              cards.pop()
              break;
          }
        }

        var c2_toggle = function(e) {
          
          switch (cards.length) {
            case 1:
              c1.move(stops.out)
              c2.move(stops.foot)
              cards.push(c2)
              break;
            case 2:
              cards.shift()
              c2.move(stops.top)
              c1.move(stops.foot)
              break;
            }
        }

        console.log(data)
        // patch for nesting
        data.elements = data.scores;

        var c1 = new Card(svg)
        // c1.title(data.elements[0].label)
        c1.title.text('healtharound.me')
        c1.update([data])

        c1.title.element.on('mousedown', c1_toggle)
        
        
        data.elements.forEach(function (parent) {
          parent.elements.forEach(function (child) {
            child.parent = parent;
          })
        })
        
        var c2 = new Card(svg)
        c2.title.text(data.elements[0].label)
        c2.update(data.elements)
        c2.title.element.on('mousedown', c2_toggle)

        var third_elements = []

        data.elements.forEach(function(parent) {
          parent.elements.forEach(function (child) {
            child.parent = parent;
          })
          third_elements = third_elements.concat(parent.elements)
        })




        var c3 = new Card(svg)
        c3.update(third_elements)

        c1.transform.translate(stops.top).animate()

        $(c1.strip.element.node()).on('tune',function (e,x) {
          
          
          c2.title.text(c1.strip.tuner(x).label||'')
          
          
        })
        
        $(c2.strip.element.node()).on('tune',function (e,x) {
          
          c3.title.text(c2.strip.tuner(x).label||'')

        })


        $(c3.strip.element.node()).on('tune',function (e,x) {
          
          c3.title.text(c3.strip.tuner(x).label||'')
          
        })



      })
      .error(function(d) {
        debugger;
      });
  });

});
