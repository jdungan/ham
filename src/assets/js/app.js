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
    cards=[];




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

  function bar_title(card){
    var x = 125-card.strip.transform.translate().x
    return card.strip.bars(x).label
  }
  function subject_title(card){
    var x = 125-card.strip.transform.translate().x
    return card.strip.subjects(x).label
  }



  // wait for the api to be ready (which means waiting for position)
  ham.ready.done(function() {
    ham.score()
      .done(function(data) {

        // patch for nesting
        // data.elements = data.scores;

        // // flatten third level
        var third_elements = []
        data.elements.forEach(function(parent) {
          third_elements = third_elements.concat(parent.elements)
        })


        var c1_toggle = function(d,i){
          switch (cards.length) {
            case 0:
              c3.title.text(bar_title(c2))
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
              c3.title.text(bar_title(c3))
              c2.title.text(subject_title(c3))
              cards.push(c2)
              break;
            case 2:
              cards.shift()
              c2.move(stops.top)
              c1.move(stops.foot)
              c3.title.text(bar_title(c2))
              c2.title.text(subject_title(c2))

              break;
            }
        }

        console.log(data)


        var c1 = new Card(svg)
        var c2 = new Card(svg)
        var c3 = new Card(svg)

        c1.title.element.on('click', c1_toggle)
        c2.title.element.on('click', c2_toggle)

        c1.title.text('healtharound.me')
        c1.update([data])
        c1.move(stops.top)

        c2.title.text(data.elements[0].label)
        c2.update(data.elements)

        c3.update(third_elements)
        c3.title.text(data.elements[0].label)


        function find_subject(card,range,subject) {

          if (subject ? subject.label : undefined)  {

            var pR = range.invertExtent(subject)

            var graphX = 125-(pR[0]+((pR[1]-pR[0])/2))

            var y = card.strip.transform.translate().y

            card.strip.transform.translate({x: graphX,y:y}).animate()

            return subject
          }

        }

        $(c1.strip.element.node()).on('tune',function (e,x) {

          var c2s = c1.strip.bars(x)

          find_subject(c2,c2.strip.subjects,c2s)

          c2.title.text(c2s.label)

          find_subject(c3,c3.strip.subjects,c2s.elements[0])

          // c3.title.text(c2s.elements[0].elements[0].label)

        })

        $(c2.strip.element.node()).on('tune',function (e,x) {

          var c3s = c2.strip.bars(x)

          find_subject(c3,c3.strip.subjects,c3s)

          c3.title.text(c3s.label)

          var c2s = c2.strip.subjects(x)

          c2.title.text(c2s.label)

        })


        $(c3.strip.element.node()).on('tune',function (e,x) {

          c3.title.text(bar_title(c3))

          var c3s = c3.strip.subjects(x)

          c2.title.text(c3s.label)


        })


        // c1.transform.animate({opacity:'.8'})
        // c2.transform.animate({opacity:'.5'})

        c1.strip.fill('mediumspringgreen')
        c2.strip.fill('powderblue')
        c3.strip.fill('tomato')

        $(c1.strip.element.node()).trigger('tune',75)

      })
      .error(function(d) {
        debugger;
      });
  });

});
