"use strict";

    function resizeAll() {
      d3.select(this[0][0])
        .attr('width', window.innerWidth)
        .attr('height', window.innerHeight)
    }

    $("#data_switch").on("pagecreate", function() {

        var svg = d3.select('#data_switch').append('svg');

        var control = svg.append('rect')

        control.attr('x', 0)
          .attr('y', 0)
          .attr('fill', 'blue');

          control.resize = resizeAll;

          control.resize();

    });

