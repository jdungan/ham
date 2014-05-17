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

        // patch for nesting
        data.elements = data.scores;

        // // flatten third level    
        var third_elements = []        
        data.elements.forEach(function(parent) {
          third_elements = third_elements.concat(parent.elements)
        })


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

        var c1 = new Card(svg)
        // c1.title(data.elements[0].label)
        c1.title.text('healtharound.me')
        c1.update([data])

        c1.title.element.on('click', c1_toggle)
        
        
        
        var c2 = new Card(svg)
        c2.title.text(data.elements[0].label)
        c2.update(data.elements)
        c2.title.element.on('click', c2_toggle)


        var c3 = new Card(svg)
        
        c3.update(third_elements)

        c1.transform.translate(stops.top).animate()

        
        
        
        
        function find_subject(card,range,subject) {

          var pR = range.invertExtent(subject)

          var graphX = pR[0]+((pR[1]-pR[0])/2)

          var y = card.strip.transform.translate().y

          card.strip.transform.translate({x: -graphX,y:y}).animate()
                  
          return subject
        
        }

        $(c1.strip.element.node()).on('tune',function (e,x) {
          
          
          var c2s = find_subject(c2,c2.strip.subjects,c1.strip.bars(x))
          
          c2.title.text(c2s.label)
          
          var c3s = find_subject(c3,c3.strip.subjects,c2s)
          
          c3.title.text(c3s.label)
                    
        })
        
        $(c2.strip.element.node()).on('tune',function (e,x) {
          
          
          find_subject(c3,c3.strip.subjects,c2.strip.bars(x))
        
          find_subject(c1,c1.strip.bars,c2.strip.subjects(x))

        })


        $(c3.strip.element.node()).on('tune',function (e,x) {
          
          c3.title.text(c3.strip.bars(x).label||'')
          

        })


        c1.transform.animate({opacity:'.7'})
        c2.transform.animate({opacity:'.7'})



      })
      .error(function(d) {
        debugger;
      });
  });

});
