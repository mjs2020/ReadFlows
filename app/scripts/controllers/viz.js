define(['angular', 'jquery', 'd3'], function (angular, $, d3) {
  'use strict';

  /**
   * @ngdoc function
   * @name pocketvizApp.controller:VizCtrl
   * @description
   * # VizCtrl
   * Controller of the pocketvizApp
   */
  angular.module('pocketvizApp.controllers.VizCtrl', [])
  .controller('VizCtrl', function ($scope) {

    // Create #svgCanvas for the visualization
    var pocketviz = d3.select("#graph")
                      .append("svg")
                      .attr('id', 'svgCanvas')
                      .attr('width', '1000')
                      .attr('height', '600')
                      .attr('viewbox', '0 0 1000 500')
                      .attr('preserveAspectRatio', 'xMidYMid');

    // Assign behaviour in case of window resize (for responsiveness)
    var aspect = 1000 / 600,
        svgCanvas = $("#svgCanvas");
    $(window).on("resize", function() {
      var targetWidth = svgCanvas.parent().width();
      svgCanvas.attr("width", targetWidth);
      svgCanvas.attr("height", targetWidth / aspect);
    });

    // Get the data to visualize



  });
});
