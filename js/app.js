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

  score.transform = new transform()
  score.transform.translate({
    x: window.innerWidth / 2,
    y: window.innerHeight / 4
  })
  score.transform.scale({
    x: 5,
    y: 5
  })

  score.attr('transform', score.transform.toString());

   
   
  var wheel = new Wheel(svg);

  wheel.transform.translate({
    x: (window.innerWidth / 2),
    y: (window.innerHeight * .7)
  });

  wheel.transform.scale({
    x: 2,
    y: 2
  });

  //nudge the rotation to position the middle of the first arc at the top
  wheel.transform.rotate(-arc2deg(wheel.interval / 2));



  //listen for any rotation and set the score
  $(wheel.node()).on('rotate', function(event, degrees) {
    this.current_category = this.current_category || {}

    var category = wheel.category(wheel.transform.rotate())

    if (this.current_category != category) {
      this.current_category = category;
      d3.select('#score').select('text').text(scores(category.score))
      d3.select('#title').text(Object.keys(this.current_category)[0])

    }

  })

  var button = wheel.append('circle')
    .attr('fill', 'blue')
    .attr('r', 15)
    .on('click', function(d) {
      debugger;
    })

  // wait for the api to be ready (which means waiting for position)
  sgh.ready.done(function() {
    sgh.sample()
      .done(function(data) {

        wheel.update(data.Category);

      })
      .error(function(d) {
        debugger;
      });
  });

});
