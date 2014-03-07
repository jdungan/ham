"use strict";

$("#dialer").on("pagecreate", function() {

  var svg = d3.select('#canvas')
    .append('svg')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight)

  var scores = d3.scale.quantize()
    .domain([0, 100])
    .range(['F', 'F', 'F', 'F', 'F', 'D', 'C', 'B', 'A']);

  var score = svg.append('g')
    .attr('id', 'score')
    .append('text')
    // .text(scores(circles[0].score))
    .text('A')
    
    
  score.transform = new transform(score)
  score
    .transform.translate({
      x: window.innerWidth / 2,
      y: window.innerHeight / 3
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
      y: (window.innerHeight * .5)
    })
    .scale({
      x: 2,
      y: 2
    })

  //listen for any rotation and set the score
  $(svg.wheel().node()).on('rotate', function(event, degrees) {
    this.current_category = this.current_category || {}

    var category = svg.wheel().category(svg.wheel().transform.rotate())

    if (this.current_category != category) {
      this.current_category = category;
      d3.select('#score').select('text').text(scores(category.score))
      d3.select('#title').text(Object.keys(this.current_category)[0])

    }

  })

  // var button = wheel.append('circle')
  //   .attr('fill', 'blue')
  //   .attr('r', 15)
  //   .on('click', function(d) {
  //     debugger;
  //   })

  // wait for the api to be ready (which means waiting for position)
  sgh.ready.done(function() {
    sgh.sample()
      .done(function(data) {
        svg.wheel().data(data.Category);
        //nudge the rotation to position the middle of the first arc at the top
        svg.wheel()
          .transform
            .rotate(-arc2deg(svg.wheel().interval / 2))
            .render()

      })
      .error(function(d) {
        debugger;
      });
  });

});
